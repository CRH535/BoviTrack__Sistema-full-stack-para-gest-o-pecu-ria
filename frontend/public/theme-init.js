(() => {
  const root = document.documentElement;
  let preference = "system";

  try {
    const saved = JSON.parse(localStorage.getItem("bovitrack_preferences"));
    if (["light", "dark", "system"].includes(saved?.theme)) preference = saved.theme;
  } catch {
    preference = "system";
  }

  const resolved = preference === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;

  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
  root.style.backgroundColor = resolved === "dark" ? "#1c1c1c" : "#eef0f2";
})();
