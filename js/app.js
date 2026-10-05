
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href="index.html"]').forEach((link) => {
        if (link.textContent.trim() === 'Gestor de inventarios') {
            link.href = 'index1.0.html';
        }
    });
});

document.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('[data-logout]');

    if (!logoutButton) return;

    const shouldLogout = window.confirm('¿Deseas cerrar la sesión?');
    if (!shouldLogout) return;

    sessionStorage.clear();
    window.location.href = 'inicio.html?sesion=cerrada';
});
