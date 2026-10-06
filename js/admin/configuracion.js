
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settingsForm');
    const message = document.getElementById('settingsMessage');
    const storageKey = 'sanfer.settings';

    try {
        const settings = JSON.parse(localStorage.getItem(storageKey) || '{}');
        Object.entries(settings).forEach(([key, value]) => {
            const field = form.elements.namedItem(key);
            if (field) field.value = value;
        });
    } catch {
        localStorage.removeItem(storageKey);
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const settings = Object.fromEntries(new FormData(form).entries());
        localStorage.setItem(storageKey, JSON.stringify(settings));
        message.textContent = 'Configuración guardada en este navegador.';
    });
});
