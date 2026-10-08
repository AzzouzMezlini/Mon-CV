export function initTheme() {
    const themeCheckbox = document.getElementById('theme-toggle');
    const storageKey = 'cv_theme_preference';

    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeCheckbox) {
            themeCheckbox.checked = (theme === 'dark');
        }
    };

    // Application initiale
    applyTheme(getPreferredTheme());

    // Activation fluide après le premier rendu
    requestAnimationFrame(() => {
        document.body.classList.add('theme-transition');
    });

    // Écouteur du switch
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            const newTheme = themeCheckbox.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(storageKey, newTheme);
        });
    }
}
