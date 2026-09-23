const THEME_KEY = 'taskboard.theme';

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function initializeTheme(
  button,
  root = document.documentElement,
  storage = localStorage,
) {
  let theme = storage.getItem(THEME_KEY) ?? 'light';

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
