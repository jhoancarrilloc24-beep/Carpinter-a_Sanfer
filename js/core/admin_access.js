function actualizarEnlaceAdmin() {
    const adminNavLink = document.getElementById('adminNavLink');
    if (!adminNavLink) return;

    const homeNavLink = document.getElementById('homeNavLink');
    const logoutNavLink = document.getElementById('logoutNavLink');
    const loginNavLink = document.getElementById('loginNavLink');
    const userNavProfile = document.getElementById('userNavProfile');
    const userNavName = document.getElementById('userNavName');
    const userNavRole = document.getElementById('userNavRole');
    if (!homeNavLink || !logoutNavLink || !loginNavLink || !userNavProfile || !userNavName || !userNavRole) return;

    adminNavLink.hidden = true;
    homeNavLink.hidden = false;
    logoutNavLink.hidden = true;
    loginNavLink.hidden = false;
    userNavProfile.hidden = true;

    const sesionActivaJSON = sessionStorage.getItem('sesion_activa');
    if (!sesionActivaJSON) return;

    try {
        const usuario = JSON.parse(sesionActivaJSON);
        const nombre = [usuario.nombre, usuario.apellido]
            .filter(valor => typeof valor === 'string' && valor.trim())
            .join(' ');
        const roles = {
            admin: 'Administrador',
            cliente: 'Cliente'
        };
        const rol = roles[usuario.rol];

        if (!nombre || !rol) {
            console.error('La sesión activa no contiene un nombre y un rol válidos.');
            return;
        }

        userNavName.textContent = nombre;
        userNavRole.textContent = rol;
        userNavProfile.hidden = false;
        loginNavLink.hidden = true;
        homeNavLink.hidden = true;
        logoutNavLink.hidden = false;
        adminNavLink.hidden = usuario.rol !== 'admin';
    } catch (error) {
        console.error('No se pudo leer la sesión activa del usuario.', error);
    }
}

document.addEventListener('DOMContentLoaded', actualizarEnlaceAdmin);
window.addEventListener('pageshow', actualizarEnlaceAdmin);

document.addEventListener('click', event => {
    const logoutNavLink = event.target.closest('#logoutNavLink');
    if (!logoutNavLink) return;

    event.preventDefault();
    sessionStorage.removeItem('sesion_activa');
    actualizarEnlaceAdmin();
});