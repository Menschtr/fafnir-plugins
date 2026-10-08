# Fafnir Plugin API

A Fafnir plugin is a folder with a `plugin.json` manifest and at least one
JavaScript file. The folder is copied into the app-side plugins directory and
enabled per-plugin from the Plugins launcher; Fafnir boots enabled plugins by
evaluating the manifest's `main` file in the page, once per page load.

## Folder and manifest

```
my-plugin/
├── plugin.json
└── main.js
```

```json
{
  "name": "My Plugin",
  "version": "1.0",
  "author": "you",
  "description": "One line shown in the Plugins panel.",
  "main": "main.js"
}
```

| Field         | Required | Notes                                                       |
| ------------- | -------- | ----------------------------------------------------------- |
| `name`        | yes      | Display name.                                               |
| `version`     | yes      | Shown next to the name in the panel.                        |
| `author`      | yes      | Free text.                                                  |
| `description` | yes      | One short line; shown under the toggle.                     |
| `main`        | yes      | Path to the entry `.js`, relative to the folder.            |

The **plugin id is the folder name**, not a manifest field. Fafnir scans the
plugins directory and derives the id from each entry.

### Limits (enforced at scan/boot)

- Folder name (id): `[A-Za-z0-9._-]`, max 64 characters.
- `plugin.json`: max 64 KB.
- `main` source: max 512 KB.
- `main` must resolve inside the plugin folder (no `..` traversal) and end
  in `.js`.

## Runtime: `window.Fafnir`

Plugins run in the page, so the ordinary DOM is available. The facade exists
because the modules do not import each other, and it is the stable surface:

```js
// Subscribe to DOM nodes as Fafnir processes them (runs for every node).
Fafnir.hooks.add((node) => {
  if (node.classList && node.classList.contains("some-widget")) {
    node.classList.add("my-plugin-tweaked");
  }
});

// chrome.storage.local, for persistent settings.
await Fafnir.storage.set({ myPluginFlag: true });
const { myPluginFlag } = await Fafnir.storage.get(["myPluginFlag"]);

// Call Tauri commands (the same commands the app itself uses).
const scan = await Fafnir.invoke("fafnir_plugins_scan", {});

// Translated string with an explicit fallback.
const label = Fafnir.tr("summary.title", "Summary");

// Namespaced logging.
Fafnir.log("started");
```

| Member                 | Signature                                | Notes                                             |
| ---------------------- | ---------------------------------------- | ------------------------------------------------- |
| `Fafnir.hooks`         | `{ add(fn) }`                            | `fn(node)` runs for each node Fafnir processes.   |
| `Fafnir.storage`       | `chrome.storage.local` or `null`         | Persistent key/value storage.                     |
| `Fafnir.invoke`        | `(name, args) => Promise`                | Tauri command bridge; rejects outside the app.    |
| `Fafnir.tr`            | `(key, fallback, params?) => string`     | App i18n, `fallback` used when the key is missing.|
| `Fafnir.log`           | `(...args) => void`                      | `console.log` bound to the console.               |

## Lifecycle

1. The folder is scanned when the Plugins panel loads (`fafnir_plugins_scan`).
2. The toggle writes `pluginEnabledMap[<id>]` to `chrome.storage.local`.
3. On the next page load, enabled plugins are booted
   (`fafnir_plugins_boot`): each `main` file is evaluated as an async
   module-style script, once per page load.
4. Toggling does not boot or kill a running plugin - reload the page (F5).

## Conventions

- Wrap boot code in an async IIFE so a rejected promise does not leak.
- Namespace everything you attach (`data-*` attributes, class prefixes,
  storage keys) to avoid colliding with Fafnir or other plugins.
- One plugin per folder; share state between plugins through
  `Fafnir.storage`, not globals.
- Keep `main.js` under the source limit; split logic across extra files in
  the same folder and load them with `import()` if you need more room.

## What plugins should not do

- Depend on Fafnir's internal module layout (`appmenu.js`, `content.js`
  function names); only `window.Fafnir` is stable.
- Write to `<html>` direction or styles that mirror the page; Fafnir's own
  overlays assume the host page stays as it is.
- Assume a plugin runs when disabled: disabled plugins are never evaluated.
