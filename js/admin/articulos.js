
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const rowsContainer = document.getElementById('articleRows');
    const searchInput = document.getElementById('articleSearch');
    const stockFilter = document.getElementById('stockFilter');
    const countLabel = document.getElementById('articleCount');
    const emptyMessage = document.getElementById('articleEmpty');
    const productsKey = 'sanfer.products';
    const historyKey = 'sanfer.productHistory';

    const readProducts = () => {
        try {
            const products = JSON.parse(localStorage.getItem(productsKey) || '[]');
            return Array.isArray(products) ? products : [];
        } catch {
            return [];
        }
    };

    const renderProducts = () => {
        rowsContainer.replaceChildren();
        readProducts().forEach((product, index) => {
            const quantity = Number(product.cantidad) || 0;
            const minimum = Number(product.stockMinimo ?? 5);
            const needsRestock = quantity <= minimum;
            const row = document.createElement('tr');
            row.dataset.stock = needsRestock ? 'low' : 'ok';
            [product.sku || `SAN-${String(index + 1).padStart(3, '0')}`, product.nombre, product.categoria, product.unidad, quantity]
                .forEach((value) => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.append(cell);
                });
            const statusCell = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = needsRestock ? 'module-badge warning' : 'module-badge success';
            badge.textContent = needsRestock ? 'Rellenar' : 'Disponible';
            statusCell.append(badge);
            const actionCell = document.createElement('td');
            if (needsRestock) {
                const restockButton = document.createElement('button');
                restockButton.className = 'module-button secondary';
                restockButton.type = 'button';
                restockButton.textContent = 'Reponer stock';
                restockButton.addEventListener('click', () => restockProduct(index));
                actionCell.append(restockButton);
            } else {
                actionCell.textContent = '—';
            }
            row.append(statusCell, actionCell);
            rowsContainer.append(row);
        });
        filterRows();
    };

    const filterRows = () => {
        const query = searchInput.value.trim().toLocaleLowerCase('es');
        const stockStatus = stockFilter.value;
        let visibleCount = 0;

        rowsContainer.querySelectorAll('tr').forEach((row) => {
            const matchesQuery = row.textContent.toLocaleLowerCase('es').includes(query);
            const matchesStock = stockStatus === 'all' || row.dataset.stock === stockStatus;
            row.hidden = !matchesQuery || !matchesStock;
            if (!row.hidden) visibleCount += 1;
        });

        countLabel.textContent = String(visibleCount);
        emptyMessage.hidden = visibleCount !== 0;
    };

    const restockProduct = (productIndex) => {
        const products = readProducts();
        const product = products[productIndex];
        if (!product) {
            alert('No se encontró el producto seleccionado. Actualiza el catálogo e inténtalo de nuevo.');
            return;
        }

        const input = prompt(`¿Cuántas unidades agregar a "${product.nombre}"?`, '1');
        if (input === null) return;
        const amount = Number(input);
        if (!Number.isInteger(amount) || amount <= 0) {
            alert('Ingresa una cantidad entera mayor que cero.');
            return;
        }

        const previousQuantity = Number(product.cantidad) || 0;
        const newQuantity = previousQuantity + amount;
        const history = (() => {
            try {
                const value = JSON.parse(localStorage.getItem(historyKey) || '[]');
                return Array.isArray(value) ? value : [];
            } catch {
                return [];
            }
        })();
        history.push({
            tipo: 'reposicion',
            fecha: new Date().toISOString(),
            sku: product.sku || `SAN-${String(productIndex + 1).padStart(3, '0')}`,
            nombre: product.nombre,
            stockAnterior: previousQuantity,
            stockNuevo: newQuantity,
            unidad: product.unidad
        });
        product.cantidad = newQuantity;
        product.alertaRevisada = false;

        try {
            localStorage.setItem(productsKey, JSON.stringify(products));
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch {
            alert('No se pudo guardar la reposición. Libera espacio del navegador e inténtalo de nuevo.');
            return;
        }

        renderProducts();
    };

    searchInput.addEventListener('input', filterRows);
    stockFilter.addEventListener('change', filterRows);
    window.addEventListener('storage', (event) => {
        if (event.key === productsKey) renderProducts();
    });
    renderProducts();
});
