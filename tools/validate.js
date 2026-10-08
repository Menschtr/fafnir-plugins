#!/usr/bin/env node
/*
 * Fafnir plugin validator.
 *
 * Mirrors the scan/boot rules in Pake/src-tauri/src/app/fafnir_store.rs so a
 * pull request can be checked before Fafnir ever sees it:
 *   - folder name (id): is_plugin_id()  -> [A-Za-z0-9._-], max 64 bytes
 *   - plugin.json: <= 64 KB, valid JSON object
 *   - main: file name only (sanitize_file_name), ends in .js, <= 512 KB
 *   - display fields: missing ones degrade in the app, so they warn here
 *
 * Usage:
 *   node tools/validate.js community/my-plugin   # one folder
 *   node tools/validate.js                        # every plugin in the repo
 */
"use strict";

const fs = require("fs");
const path = require("path");

const MAX_MANIFEST_BYTES = 64 * 1024;
const MAX_SOURCE_BYTES = 512 * 1024;

/* fafnir_store.rs: is_plugin_id */
function isPluginId(id) {
  if (!id || Buffer.byteLength(id) > 64) return false;
  if (id === "." || id === "..") return false;
  for (const ch of id) {
    const ok =
      (ch >= "0" && ch <= "9") ||
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      ch === "." ||
      ch === "_" ||
      ch === "-";
    if (!ok) return false;
  }
  return true;
}

/* fafnir_store.rs: sanitize_file_name */
function sanitizeFileName(name) {
  if (!name || Buffer.byteLength(name) > 128) return false;
  if (name.includes("/") || name.includes("\\") || name.includes("\0")) return false;
  if (name === "." || name === ".." || name.startsWith("..")) return false;
  return true;
}

function validatePlugin(dir) {
  const errors = [];
  const warnings = [];

  const id = path.basename(dir);
  if (!isPluginId(id)) {
    errors.push(
      `folder name "${id}" is not a valid plugin id ([A-Za-z0-9._-], max 64 bytes)`
    );
    return { errors, warnings };
  }

  const manifestPath = path.join(dir, "plugin.json");
  let manifestBytes;
  try {
    manifestBytes = fs.readFileSync(manifestPath);
  } catch (error) {
    errors.push("plugin.json is missing or unreadable");
    return { errors, warnings };
  }
  if (manifestBytes.length > MAX_MANIFEST_BYTES) {
    errors.push(`plugin.json is ${manifestBytes.length} bytes (max ${MAX_MANIFEST_BYTES})`);
    return { errors, warnings };
  }
  if (
    manifestBytes.length >= 3 &&
    manifestBytes[0] === 0xef &&
    manifestBytes[1] === 0xbb &&
    manifestBytes[2] === 0xbf
  ) {
    errors.push("plugin.json must not start with a UTF-8 BOM (serde_json rejects it)");
    return { errors, warnings };
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch (error) {
    errors.push("plugin.json is not valid JSON: " + error.message);
    return { errors, warnings };
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    errors.push("plugin.json must contain a JSON object");
    return { errors, warnings };
  }

  const main = typeof manifest.main === "string" ? manifest.main.trim() : "";
  if (!main) {
    errors.push('manifest field "main" is missing or empty');
  } else if (!sanitizeFileName(main)) {
    errors.push(`"main" must be a plain file name inside the folder, got "${main}"`);
  } else if (!main.toLowerCase().endsWith(".js")) {
    errors.push(`"main" must end in .js, got "${main}"`);
  } else {
    const mainPath = path.join(dir, main);
    let mainBytes;
    try {
      mainBytes = fs.readFileSync(mainPath);
    } catch (error) {
      errors.push(`entry file "${main}" is missing or unreadable`);
    }
    if (mainBytes && mainBytes.length > MAX_SOURCE_BYTES) {
      errors.push(`"${main}" is ${mainBytes.length} bytes (max ${MAX_SOURCE_BYTES})`);
    }
    if (mainBytes && !mainBytes.toString("utf8").includes("\0")) {
      /* ok */
    } else if (mainBytes) {
      errors.push(`"${main}" is not valid UTF-8 text (NUL byte found)`);
    }
  }

  for (const key of ["name", "version", "author", "description"]) {
    const value = manifest[key];
    if (typeof value !== "string" || !value.trim()) {
      warnings.push(`manifest field "${key}" is missing or empty`);
    } else if (value !== value.trim()) {
      warnings.push(`manifest field "${key}" has leading/trailing whitespace`);
    }
  }
  if (typeof manifest.name !== "string" || !manifest.name.trim()) {
    warnings.push(`the panel will fall back to the id "${id}" as the display name`);
  }
  if (manifest.main !== undefined && typeof manifest.main === "string" && manifest.main !== main) {
    warnings.push('"main" has surrounding whitespace; Fafnir uses it verbatim');
  }

  return { errors, warnings };
}

function findPluginDirs(root, depth, out) {
  if (depth > 3) return;
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (error) {
    return;
  }
  if (entries.some((e) => e.isFile() && e.name === "plugin.json")) {
    out.push(root);
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    findPluginDirs(path.join(root, entry.name), depth + 1, out);
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const targets = [];
  const args = process.argv.slice(2);
  if (args.length) {
    for (const arg of args) {
      const abs = path.resolve(repoRoot, arg);
      if (!fs.existsSync(abs)) {
        console.error(`no such folder: ${arg}`);
        process.exit(2);
      }
      targets.push(abs);
    }
  } else {
    for (const name of ["community", "plugins", "templates"]) {
      const dir = path.join(repoRoot, name);
      if (fs.existsSync(dir)) findPluginDirs(dir, 0, targets);
    }
  }
  if (!targets.length) {
    console.error("no plugin folders found");
    process.exit(2);
  }

  let failed = 0;
  for (const dir of targets.sort()) {
    const rel = path.relative(repoRoot, dir).split(path.sep).join("/");
    const { errors, warnings } = validatePlugin(dir);
    const label = errors.length ? "FAIL" : warnings.length ? "ok (warn)" : "ok";
    console.log(`${label.padEnd(9)} ${rel}`);
    for (const message of errors) console.log(`          error: ${message}`);
    for (const message of warnings) console.log(`          warn:  ${message}`);
    if (errors.length) failed += 1;
  }

  console.log(
    `${targets.length} plugin folder(s) checked, ${failed} failed`
  );
  process.exit(failed ? 1 : 0);
}

main();
