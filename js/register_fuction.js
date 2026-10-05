document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado en rol cliente
    seleccionarRol('cliente');

    const formRegistro = document.getElementById('formulario_registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', guardarRegistroUsuario);
    }
});

function seleccionarRol(rol) {
    const btnCliente = document.getElementById('btn-cliente');
    const btnAdmin = document.getElementById('btn-admin');
    const grupoAdmin = document.getElementById('grupo-clave-admin');
    const inputClaveAdmin = document.getElementById('clave-admin');

    if (rol === 'cliente') {
        btnCliente.classList.add('activo');
        btnAdmin.classList.remove('activo');
        if (grupoAdmin) grupoAdmin.style.display = 'none';
        if (inputClaveAdmin) {
            inputClaveAdmin.removeAttribute('required');
            inputClaveAdmin.value = '';
        }
    } else if (rol === 'admin') {
        btnAdmin.classList.add('activo');
        btnCliente.classList.remove('activo');
        if (grupoAdmin) grupoAdmin.style.display = 'flex';
        if (inputClaveAdmin) inputClaveAdmin.setAttribute('required', 'true');
    }
}

function guardarRegistroUsuario(e) {
    e.preventDefault();

    const btnAdmin = document.getElementById('btn-admin');
    const esAdmin = btnAdmin && btnAdmin.classList.contains('activo');

    // Si es administrador, primero validamos la clave de taller
    if (esAdmin) {
        const inputClave = document.getElementById('clave-admin').value;
        if (typeof validarClaveAdmin === 'function' && !validarClaveAdmin(inputClave)) {
            alert("❌ Clave de administrador incorrecta.");
            return;
        }
    }

    // Captura de datos del formulario
    const nuevoUsuario = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value,
        rol: esAdmin ? 'admin' : 'cliente'
    };

    // Obtener lista de usuarios registrados o iniciar un arreglo vacío
    let usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_sanfer')) || [];

    // Verificar si el correo ya existe
    const existe = usuariosRegistrados.some(user => user.email === nuevoUsuario.email);
    if (existe) {
        alert("⚠️ Este correo ya está registrado. Por favor, inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    // Guardar el nuevo usuario
    usuariosRegistrados.push(nuevoUsuario);
    localStorage.setItem('usuarios_sanfer', JSON.stringify(usuariosRegistrados));

    alert("✅ ¡Registro completado con éxito! Serás redirigido al inicio de sesión.");
    
    // Redirección al formulario de login
    window.location.href = "login.html";
}




/*=================================================
logica de botones de registro cliente administrador 
===================================================*/

//logica de los botones del registro
document.addEventListener('DOMContentLoaded', () => {
    // Inicializamos el estado al cargar la página en modo 'cliente'
    seleccionarRol('cliente');
});

function seleccionarRol(rol) {
    // Obtenemos los elementos del DOM
    const btnCliente = document.getElementById('btn-cliente');
    const btnAdmin = document.getElementById('btn-admin');
    const grupoAdmin = document.getElementById('grupo-clave-admin');
    const inputClaveAdmin = document.getElementById('clave-admin');

    if (rol === 'cliente') {
        // 1. Cambiar clases activas en los botones
        btnCliente.classList.add('activo');
        btnAdmin.classList.remove('activo');

        // 2. Ocultar el campo de clave de administrador
        if (grupoAdmin) {
            grupoAdmin.style.display = 'none';
        }

        // 3. Quitar el atributo 'required' y limpiar el campo para que no bloquee el envío
        if (inputClaveAdmin) {
            inputClaveAdmin.removeAttribute('required');
            inputClaveAdmin.value = '';
        }

    } else if (rol === 'admin') {
        // 1. Cambiar clases activas en los botones
        btnAdmin.classList.add('activo');
        btnCliente.classList.remove('activo');

        // 2. Mostrar el campo de clave de administrador
        if (grupoAdmin) {
            grupoAdmin.style.display = 'flex';
        }

        // 3. Hacer obligatorio el campo cuando sea administrador
        if (inputClaveAdmin) {
            inputClaveAdmin.setAttribute('required', 'true');
        }
    }
}