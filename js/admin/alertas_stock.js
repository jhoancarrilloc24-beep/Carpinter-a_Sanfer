
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const alertList = document.getElementById('alertList');
    const counter = document.getElementById('activeAlertCount');
    const criticalCounter = document.getElementById('criticalAlertCount');
    const emptyMessage = document.getElementById('noAlerts');
    const lastReviewDate = document.getElementById('lastReviewDate');
    const productsKey = 'sanfer.products';
    const lastReviewKey = 'sanfer.stock.lastReviewedAt';

    const readProducts = () => {
        try {
            const products = JSON.parse(localStorage.getItem(productsKey) || '[]');
            return Array.isArray(products) ? products : [];
        } catch {
            return [];
        }
    };

    const updateLastReview = () => {
        const reviewedAt = localStorage.getItem(lastReviewKey);
        lastReviewDate.textContent = reviewedAt
            ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(reviewedAt))
            : 'Sin datos';
    };

    const renderAlerts = () => {
        const products = readProducts();
        const pendingProducts = products
            .map((product, index) => ({ product, index }))
            .filter(({ product }) => {
                const quantity = Number(product.cantidad) || 0;
                const minimum = Number(product.stockMinimo ?? 5);
                return quantity <= minimum && !product.alertaRevisada;
            });

        alertList.replaceChildren();
        pendingProducts.forEach(({ product, index }) => {
            const quantity = Number(product.cantidad) || 0;
            const minimum = Number(product.stockMinimo ?? 5);
            const alert = document.createElement('article');
            alert.className = 'module-alert';
            alert.dataset.alert = '';

            const icon = document.createElement('span');
            icon.className = 'module-alert-icon';
            icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>';

            const content = document.createElement('div');
            content.className = 'module-alert-content';
            const title = document.createElement('strong');
            title.textContent = `${product.nombre || 'Producto'} · Stock bajo`;
            const details = document.createElement('p');
            details.textContent = `Quedan ${quantity} ${product.unidad || 'unidades'}; el límite configurado es ${minimum}.`;
            const badge = document.createElement('span');
            badge.className = quantity === 0 ? 'module-badge danger' : 'module-badge warning';
            badge.textContent = quantity === 0 ? 'Agotado · Rellenar' : 'Rellenar';
            content.append(title, details, badge);

            const reviewButton = document.createElement('button');
            reviewButton.className = 'module-button secondary';
            reviewButton.type = 'button';
            reviewButton.textContent = 'Marcar revisada';
            reviewButton.addEventListener('click', () => {
                const currentProducts = readProducts();
                if (!currentProducts[index]) return;
                currentProducts[index].alertaRevisada = true;
                localStorage.setItem(productsKey, JSON.stringify(currentProducts));
                localStorage.setItem(lastReviewKey, new Date().toISOString());
                renderAlerts();
            });

            alert.append(icon, content, reviewButton);
            alertList.append(alert);
        });

        counter.textContent = String(pendingProducts.length);
        criticalCounter.textContent = String(pendingProducts.filter(({ product }) => Number(product.cantidad) === 0).length);
        emptyMessage.hidden = pendingProducts.length !== 0;
        updateLastReview();
    };

    window.addEventListener('storage', (event) => {
        if (event.key === productsKey || event.key === lastReviewKey) renderAlerts();
    });

    renderAlerts();
});

