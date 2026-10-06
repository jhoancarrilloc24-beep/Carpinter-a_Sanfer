
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.querySelector('.btn-action');
    const updatedLabel = document.querySelector('.updated-label');
    const metricValues = document.querySelectorAll('.metrics-grid .metric-card strong');

    try {
        const savedProducts = JSON.parse(localStorage.getItem('sanfer.products') || '[]');
        const products = Array.isArray(savedProducts) ? savedProducts : [];
        const units = products.reduce((total, product) => total + (Number(product.cantidad) || 0), 0);

        if (metricValues[0]) metricValues[0].textContent = String(5 + products.length);
        if (metricValues[1]) metricValues[1].textContent = String(54 + units);
    } catch {
        if (metricValues[0]) metricValues[0].textContent = '5';
        if (metricValues[1]) metricValues[1].textContent = '54';
    }

    if (!refreshButton || !updatedLabel) return;

    refreshButton.addEventListener('click', () => {
        const currentTime = new Intl.DateTimeFormat('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date());

        updatedLabel.innerHTML = `<i class="fa-regular fa-clock"></i> Actualizado a las ${currentTime}`;
    });
});