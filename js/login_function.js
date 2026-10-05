document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formulario_login');
    if (formLogin) {
        formLogin.addEventListener('submit', autenticarUsuario);
    }
});

function autenticarUsuario(e) {
    e.preventDefault();

    const emailIngresado = document.getElementById('email').value.trim().toLowerCase();
    const passwordIngresada = document.getElementById('password').value;

    // 1. Recuperar usuarios registrados
    const usuarios = JSON.parse(localStorage.getItem('usuarios_sanfer')) || [];

    // 2. Buscar coincidencia de credenciales
    const usuarioEncontrado = usuarios.find(user => 
        user.email === emailIngresado && user.password === passwordIngresada
    );

    if (usuarioEncontrado) {
        // 3. SEGURIDAD: Creamos un objeto de sesión temporal SIN la contraseña
        const sesionPasajera = {
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            email: usuarioEncontrado.email,
            rol: usuarioEncontrado.rol
        };

        // 4. Guardamos en sessionStorage (los datos se borran solos al cerrar la pestaña)
        sessionStorage.setItem('sesion_activa', JSON.stringify(sesionPasajera));

        const destination = usuarioEncontrado.rol === 'admin' ? 'index1.0.html' : 'index.html';
        window.location.href = destination;
    } else {
        alert("❌ Correo o contraseña incorrectos. Verifica tus datos o regístrate.");
    }
}