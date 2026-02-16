(function () {
  const STORAGE_KEY = 'physioapp_theme';
  const LEGACY_KEY = 'physioapp_settings_misc_state';
  const DARK_QUERY = '(prefers-color-scheme: dark)';

  const supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const darkMedia = supportsMatchMedia ? window.matchMedia(DARK_QUERY) : null;

  const safeGet = function (key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeSet = function (key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures (private mode / blocked storage).
    }
  };

  const normalizeTheme = function (value) {
    if (value === 'light' || value === 'dark' || value === 'system') return value;
    return 'system';
  };

  const readLegacyTheme = function () {
    const raw = safeGet(LEGACY_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return normalizeTheme(parsed && parsed.app && parsed.app.themeSelector);
    } catch (error) {
      return null;
    }
  };

  const getThemePreference = function () {
    const fromPrimary = normalizeTheme(safeGet(STORAGE_KEY));
    if (fromPrimary !== 'system' || safeGet(STORAGE_KEY) === 'system') {
      return fromPrimary;
    }

    const fromLegacy = readLegacyTheme();
    return fromLegacy || 'system';
  };

  const resolveTheme = function (preference) {
    const normalized = normalizeTheme(preference);
    if (normalized === 'system') {
      return darkMedia && darkMedia.matches ? 'dark' : 'light';
    }
    return normalized;
  };

  const applyTheme = function (preference) {
    const resolved = resolveTheme(preference);
    document.documentElement.setAttribute('data-theme-preference', normalizeTheme(preference));
    document.documentElement.setAttribute('data-theme', resolved);
    return resolved;
  };

  const persistThemePreference = function (preference) {
    const normalized = normalizeTheme(preference);
    safeSet(STORAGE_KEY, normalized);

    const rawLegacy = safeGet(LEGACY_KEY);
    let legacyState = { app: {} };
    if (rawLegacy) {
      try {
        legacyState = JSON.parse(rawLegacy) || { app: {} };
      } catch (error) {
        legacyState = { app: {} };
      }
    }

    legacyState.app = Object.assign({}, legacyState.app || {}, { themeSelector: normalized });
    safeSet(LEGACY_KEY, JSON.stringify(legacyState));
  };

  const setTheme = function (preference) {
    const normalized = normalizeTheme(preference);
    persistThemePreference(normalized);
    return applyTheme(normalized);
  };

  const handleSystemChange = function () {
    if (getThemePreference() === 'system') {
      applyTheme('system');
    }
  };

  const initTheme = function () {
    const preference = getThemePreference();
    applyTheme(preference);

    if (darkMedia) {
      if (typeof darkMedia.addEventListener === 'function') {
        darkMedia.addEventListener('change', handleSystemChange);
      } else if (typeof darkMedia.addListener === 'function') {
        darkMedia.addListener(handleSystemChange);
      }
    }

    return preference;
  };

  window.PhysioTheme = {
    getThemePreference,
    setTheme,
    applyTheme,
    initTheme
  };

  initTheme();
})();
