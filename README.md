# Fafnir Plugins

Community plugin repository for [Fafnir](https://github.com/Menschtr/Fafnir-source),
a desktop client for fenrid.com. Plugins are small JavaScript files that run inside
the Fafnir page and extend it - badges, keyboard shortcuts, cosmetic tweaks, message
helpers. There is no review board: you build your plugin, drop it in the folder, and
turn it on from the **Plugins** launcher in the bottom-right corner.

> **Security note.** Plugins run with the same privileges as Fafnir's own scripts,
> inside the page. Only enable plugins whose source you have read and trust.
> Every plugin is off by default and is enabled per-plugin, per-machine.

## Installing a plugin

1. Copy the plugin folder into Fafnir's plugin directory:

   ```
   %APPDATA%\com.menschtr.fafnir\fafnir\plugins\<plugin-id>\
   ```

   The folder name **is** the plugin id (letters, digits, `.`, `_`, `-`; max 64 characters).

2. Open Fafnir, click the puzzle-piece button above the menu button (bottom-right),
   and switch the plugin on.

3. Reload the page (F5) so the plugin boots.

## Repository layout

| Path                | What it is                                                     |
| ------------------- | -------------------------------------------------------------- |
| `templates/starter/` | Minimal plugin scaffold - copy it to start a new plugin.       |
| `plugins/demo/`      | The demo plugin shipped with Fafnir, kept here for reference.  |
| `community/`         | Plugins contributed by the community, one folder per plugin.  |
| `community/examples/` | Small worked examples that show one API each.                  |
| `tools/validate.js`  | Validator that checks a plugin folder against the real rules.  |
| `PLUGIN_API.md`      | Full API reference: manifest schema, `window.Fafnir`, limits.  |

## Contributing your plugin

There is no selection process. If your plugin validates, it belongs in `community/`.

1. Copy `templates/starter/` to `community/<your-plugin-id>/` and write your code.
2. Validate it:

   ```
   node tools/validate.js community/<your-plugin-id>
   ```

3. Open a pull request with **one plugin per PR**. The description should say what
   the plugin does and whether it needs any permissions beyond `window.Fafnir`.

Validation enforces the same rules Fafnir itself enforces at scan time: id
characters, `plugin.json` shape, the `main` file being a `.js` file inside the
folder, and the size limits (64 KB manifest, 512 KB source).

## Documentation

- [PLUGIN_API.md](PLUGIN_API.md) - manifest schema, `window.Fafnir` facade,
  lifecycle, limits.
- [README.tr.md](README.tr.md) - Turkish version of this README.

## License

MIT - see [LICENSE](LICENSE). Contributions are made under the same license.
