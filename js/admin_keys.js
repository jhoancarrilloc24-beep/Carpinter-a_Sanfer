/*Módulo de Validación de Claves Carpintería Sanfer*/

// Lista de claves válidas 
const CLAVES_ADMIN_AUTORIZADAS = [
    "SANFER-2026-ADM",
    "TALLER-SANFER-MASTER",
    "EMP-8842-ADMIN",
    "CARPINTERIA-SANFER-99"
];

/**
 * Verifica si la clave ingresada coincide con alguna de las llaves autorizadas.
 * @param {string} claveIngresada - Texto ingresado en el campo de clave de administrador.
 * @return {boolean} true si la clave es válida, false de lo contrario.
 */
function validarClaveAdmin(claveIngresada) {
    if (!claveIngresada || typeof claveIngresada !== 'string') {
        return false;
    }
    
    // Normalizamos quitando espacios adicionales
    const claveLimpia = claveIngresada.trim();
    
    return CLAVES_ADMIN_AUTORIZADAS.includes(claveLimpia);
}

/* validar la clave si el rol seleccionado es Administrador.*/

function procesarRegistro(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    const btnAdmin = document.getElementById('btn-admin');
    const esAdmin = btnAdmin && btnAdmin.classList.contains('activo');

    if (esAdmin) {
        const inputClaveAdmin = document.getElementById('clave-admin');
        const clave = inputClaveAdmin ? inputClaveAdmin.value : '';

        if (!validarClaveAdmin(clave)) {
            alert("❌ Clave de administrador incorrecta. Registro denegado.\nConsulte con el encargado del taller.");
            if (inputClaveAdmin) {
                inputClaveAdmin.focus();
                inputClaveAdmin.select();
            }
            return false;
        }
    }

    alert("✅ Registro exitoso. ¡Bienvenido!");
    return true;
}