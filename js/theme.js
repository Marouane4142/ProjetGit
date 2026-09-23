const THEME_KEY = 'taskboard.theme';

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function resolveInitialTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return prefersDark ? 'dark' : 'light';
}

export function initializeTheme(
  button,
  root = document.documentElement,
  storage = localStorage,
  prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches,
) {
  let theme = resolveInitialTheme(storage.getItem(THEME_KEY), prefersDark);

  function applyTheme() {
    root.dataset.theme = theme;
    button.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  button.addEventListener('click', () => {
    theme = nextTheme(theme);
    storage.setItem(THEME_KEY, theme);
    applyTheme();
  });

  applyTheme();
}
