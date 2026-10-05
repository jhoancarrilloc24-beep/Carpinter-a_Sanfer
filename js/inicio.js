
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const dateLabel = document.getElementById('todayLabel');
    if (dateLabel) {
        dateLabel.innerHTML = `<i class="fa-regular fa-calendar"></i> ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date())}`;
    }

    const productsCount = document.getElementById('homeProducts');
    try {
        const products = JSON.parse(localStorage.getItem('sanfer.products') || '[]');
        if (productsCount && products.length) productsCount.textContent = String(5 + products.length);
    } catch {
        if (productsCount) productsCount.textContent = '5';
    }

    if (new URLSearchParams(window.location.search).get('sesion') === 'cerrada') {
        const pageDescription = document.querySelector('.dashboard-header p');
        if (pageDescription) pageDescription.textContent = 'La sesión local se cerró. Puedes continuar en el panel.';
    }
});
