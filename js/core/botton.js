
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('[data-logout]');

    if (!logoutButton) return;

    window.location.href = '../../index.html';
});
