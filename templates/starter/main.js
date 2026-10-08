(async () => {
  const F = window.Fafnir;
  if (!F) return;

  F.log("starter plugin booted");

  const settings = await F.storage.get(["starterGreeted"]);
  if (!settings.starterGreeted) {
    document.documentElement.setAttribute("data-starter-plugin", "1");
    await F.storage.set({ starterGreeted: true });
  }

  F.hooks.add((node) => {
    if (node.nodeType !== 1) return;
    node.setAttribute("data-starter-seen", "1");
  });
})();
