# Community plugins

Anyone can add a plugin here. There is no selection process: if the folder
validates with `tools/validate.js`, it can be merged.

## Rules

1. **One plugin per pull request.** The PR touches exactly one folder:
   `community/<plugin-id>/`.
2. **The folder name is the plugin id** and must match `[A-Za-z0-9._-]`
   (max 64 characters).
3. **Validate before opening the PR:**

   ```
   node tools/validate.js community/<plugin-id>
   ```

4. **Include a description** in the PR body: what the plugin does, whether it
   uses anything beyond `window.Fafnir`, and where its source lives upstream
   (so users can audit it).
5. **License:** contributions are made under the repository's MIT license. Do
   not submit code you cannot relicense.

## Layout of a submission

```
community/my-plugin/
├── plugin.json
├── main.js
└── README.md      (optional - when the plugin needs its own docs)
```

See [`templates/starter/`](../templates/starter/) for the scaffold and
[`PLUGIN_API.md`](../PLUGIN_API.md) for the full API.

## Index

Keep this list updated in your PR:

| Plugin           | Author | What it does |
| ---------------- | ------ | ------------ |
| `examples/hello` | Fafnir | Prints a boot line; the smallest possible plugin. |
