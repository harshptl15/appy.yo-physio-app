(() => {
  const STORAGE_KEY = "physioapp_theme_preference";
  const VALID = new Set(["system", "light", "dark"]);
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const safeGet = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const safeSet = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // Ignore storage errors (private mode, browser policy, etc.).
    }
  };

  const getPreference = () => {
    const stored = safeGet();
    return VALID.has(stored) ? stored : "system";
  };

  const resolveTheme = (preference) => {
    if (preference === "light" || preference === "dark") return preference;
    return media.matches ? "dark" : "light";
  };

  const applyTheme = (preference = getPreference()) => {
    const resolved = resolveTheme(preference);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-preference", preference);
    document.documentElement.style.colorScheme = resolved;
    return resolved;
  };

  const setPreference = (preference) => {
    const normalized = String(preference || "").toLowerCase();
    const next = VALID.has(normalized) ? normalized : "system";
    safeSet(next);
    applyTheme(next);
    return next;
  };

  applyTheme();

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", () => {
      if (getPreference() === "system") applyTheme("system");
    });
  } else if (typeof media.addListener === "function") {
    media.addListener(() => {
      if (getPreference() === "system") applyTheme("system");
    });
  }

  window.PhysioTheme = {
    getPreference,
    setPreference,
    resolveTheme,
    applyTheme
  };
})();
