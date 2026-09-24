









/*=================================================
logica de botones de registro cliente administrador 
===================================================*/

function seleccionarRol(rol) {
  const btnCliente = document.getElementById('btn-cliente');
  const btnAdmin = document.getElementById('btn-admin');

  if (rol === 'cliente') {
    btnCliente.classList.add('activo');
    btnAdmin.classList.remove('activo');
  } else {
    btnAdmin.classList.add('activo');
    btnCliente.classList.remove('activo');
  }
}


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