
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

    const formatPrice = (price) => price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price))
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price))
        : 'Sin asignar';

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
            [product.sku || `SAN-${String(index + 1).padStart(3, '0')}`, product.nombre, product.categoria, product.unidad, quantity, formatPrice(product.precio)]
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
            actionCell.className = 'product-actions';
            const priceButton = document.createElement('button');
            priceButton.className = 'module-button secondary';
            priceButton.type = 'button';
            priceButton.textContent = 'Modificar precio';
            priceButton.addEventListener('click', () => updateProductPrice(index));
            actionCell.append(priceButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'module-button secondary';
            deleteButton.type = 'button';
            deleteButton.textContent = 'Eliminar producto';
            deleteButton.addEventListener('click', () => deleteProduct(index));
            actionCell.append(deleteButton);

            if (needsRestock) {
                const restockButton = document.createElement('button');
                restockButton.className = 'module-button secondary';
                restockButton.type = 'button';
                restockButton.textContent = 'Reponer stock';
                restockButton.addEventListener('click', () => restockProduct(index));
                actionCell.append(restockButton);
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

    const updateProductPrice = (productIndex) => {
        const products = readProducts();
        const product = products[productIndex];
        if (!product) {
            alert('No se encontró el producto seleccionado. Actualiza el catálogo e inténtalo de nuevo.');
            return;
        }

        const input = prompt(`Ingresa el nuevo precio de "${product.nombre}" en pesos colombianos:`, product.precio ?? '');
        if (input === null) return;
        const newPrice = Number(input);
        if (!Number.isInteger(newPrice) || newPrice <= 0) {
            alert('Ingresa un precio entero mayor que cero.');
            return;
        }

        const previousPrice = Number.isFinite(Number(product.precio)) ? Number(product.precio) : null;
        const history = (() => {
            try {
                const value = JSON.parse(localStorage.getItem(historyKey) || '[]');
                return Array.isArray(value) ? value : [];
            } catch {
                return [];
            }
        })();
        history.push({
            tipo: 'precio',
            fecha: new Date().toISOString(),
            sku: product.sku || `SAN-${String(productIndex + 1).padStart(3, '0')}`,
            nombre: product.nombre,
            precioAnterior: previousPrice,
            precioNuevo: newPrice
        });
        product.precio = newPrice;

        try {
            localStorage.setItem(productsKey, JSON.stringify(products));
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch {
            alert('No se pudo guardar el precio. Libera espacio del navegador e inténtalo de nuevo.');
            return;
        }

        renderProducts();
    };

    const deleteProduct = (productIndex) => {
        const products = readProducts();
        const product = products[productIndex];
        if (!product) {
            alert('No se encontró el producto seleccionado. Actualiza el catálogo e inténtalo de nuevo.');
            return;
        }
        if (!confirm(`¿Eliminar "${product.nombre}" del inventario y del catálogo público? Su historial de movimientos se conservará.`)) return;

        products.splice(productIndex, 1);
        try {
            localStorage.setItem(productsKey, JSON.stringify(products));
        } catch {
            alert('No se pudo eliminar el producto. Libera espacio del navegador e inténtalo de nuevo.');
            return;
        }

        renderProducts();
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
