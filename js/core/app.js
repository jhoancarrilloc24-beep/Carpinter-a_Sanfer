
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('[data-logout]');

    if (!logoutButton) return;

    const shouldLogout = window.confirm('¿Deseas cerrar la sesión?');
    if (!shouldLogout) return;

    sessionStorage.clear();
    window.location.href = 'inicio.html?sesion=cerrada';
});
