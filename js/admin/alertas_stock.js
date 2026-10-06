
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const alerts = document.querySelectorAll('[data-alert]');
    const counter = document.getElementById('activeAlertCount');
    const emptyMessage = document.getElementById('noAlerts');
    let remaining = alerts.length;

    const updateState = () => {
        counter.textContent = String(remaining);
        emptyMessage.hidden = remaining !== 0;
    };

    alerts.forEach((alert) => {
        alert.querySelector('[data-resolve]').addEventListener('click', () => {
            alert.remove();
            remaining -= 1;
            updateState();
        });
    });

    updateState();
});
