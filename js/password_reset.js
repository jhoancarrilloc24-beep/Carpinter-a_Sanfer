const RESET_SESSION_KEY = 'sanfer.passwordReset';
const REGISTERED_USERS_KEY = 'usuarios_sanfer';

function readResetSession() {
  try {
    return JSON.parse(sessionStorage.getItem(RESET_SESSION_KEY));
  } catch {
    return null;
  }
}

function readRegisteredUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function issueResetCode(email, notify = true) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  sessionStorage.setItem(RESET_SESSION_KEY, JSON.stringify({
    email,
    code,
    verified: false,
    expiresAt: Date.now() + 10 * 60 * 1000,
  }));

  if (notify) {
    alert(`Código de demostración: ${code}. Esta versión no envía correos.`);
  }
}

const requestForm = document.querySelector('#formulario');
if (requestForm && document.querySelector('#email')) {
  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#email').value.trim().toLowerCase();
    const userExists = readRegisteredUsers().some((user) => user.email === email);

    if (!userExists) {
      alert('No hay una cuenta registrada con ese correo.');
      return;
    }

    issueResetCode(email);
    window.location.href = 'verify-code.html';
  });
}

const verificationForm = document.querySelector('#formulario_verificacion');
if (verificationForm) {
  verificationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const resetSession = readResetSession();

    if (!resetSession || resetSession.expiresAt < Date.now()) {
      alert('El código venció. Solicita uno nuevo.');
      window.location.href = 'request_reset.html';
      return;
    }

    const code = Array.from(document.querySelectorAll('.otp-input'), (input) => input.value).join('');
    if (code !== resetSession.code) {
      alert('El código ingresado no es válido.');
      return;
    }

    resetSession.verified = true;
    sessionStorage.setItem(RESET_SESSION_KEY, JSON.stringify(resetSession));
    window.location.href = 'new_password.html';
  });
}

function resendCode() {
  const resetSession = readResetSession();
  if (!resetSession) {
    alert('Primero solicita el restablecimiento de contraseña.');
    window.location.href = 'request_reset.html';
    return;
  }

  issueResetCode(resetSession.email);
}

const newPasswordForm = document.querySelector('#formulario_nueva_password');
if (newPasswordForm) {
  const resetSession = readResetSession();
  if (!resetSession?.verified || resetSession.expiresAt < Date.now()) {
    window.location.href = 'request_reset.html';
  } else {
    newPasswordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const password = document.querySelector('#password').value;
      const confirmation = document.querySelector('#confirm_password').value;

      if (password !== confirmation) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      const users = readRegisteredUsers();
      const user = users.find((registeredUser) => registeredUser.email === resetSession.email);
      if (!user) {
        alert('No se encontró la cuenta. Solicita nuevamente el restablecimiento.');
        window.location.href = 'request_reset.html';
        return;
      }

      user.password = password;
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      sessionStorage.removeItem(RESET_SESSION_KEY);
      alert('Contraseña actualizada. Inicia sesión con la nueva contraseña.');
      window.location.href = 'login.html';
    });
  }
}