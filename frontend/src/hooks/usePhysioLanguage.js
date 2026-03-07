import { useEffect, useState } from 'react';

export function usePhysioLanguage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((prev) => prev + 1);
    window.addEventListener('physio-language-changed', onChange);
    return () => window.removeEventListener('physio-language-changed', onChange);
  }, []);

  const t = (key, fallback) => {
    if (window.PhysioLanguage && typeof window.PhysioLanguage.t === 'function') {
      return window.PhysioLanguage.t(key, fallback);
    }
    return fallback || key;
  };

  return { t, tick };
}
