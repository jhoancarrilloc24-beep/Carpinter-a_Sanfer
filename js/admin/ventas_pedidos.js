// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('orderForm');
    const rows = document.getElementById('orderRows');
    const message = document.getElementById('orderMessage');
    const countLabel = document.getElementById('orderCount');
    const openOrdersLabel = document.getElementById('openOrders');
    const monthlySalesLabel = document.getElementById('monthlySales');
    const pendingDeliveriesLabel = document.getElementById('pendingDeliveries');
    const storageKey = 'sanfer.orders';
    const productsKey = 'sanfer.products';
    const productHistoryKey = 'sanfer.productHistory';
    const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    const readArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const saveValues = (entries) => {
        const keys = Object.keys(entries);
        const previousValues = new Map(keys.map((key) => [key, localStorage.getItem(key)]));
        try {
            keys.forEach((key) => localStorage.setItem(key, JSON.stringify(entries[key])));
        } catch {
            keys.forEach((key) => {
                try {
                    const previousValue = previousValues.get(key);
                    if (previousValue === null) localStorage.removeItem(key);
                    else localStorage.setItem(key, previousValue);
                } catch {
                    // Best effort rollback; the caller reports the save failure.
                }
            });
            return false;
        }
        return true;
    };

    const isCurrentMonth = (dateValue) => {
        if (!dateValue) return false;
        const now = new Date();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return dateValue.slice(0, 7) === currentMonth;
        }
        const date = new Date(dateValue);
        return !Number.isNaN(date.getTime())
            && date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth();
    };

    const updateSummary = (orders) => {
        countLabel.textContent = `${orders.length} ${orders.length === 1 ? 'registro' : 'registros'}`;
        openOrdersLabel.textContent = String(orders.filter((order) => order.status !== 'Entregado').length);
        pendingDeliveriesLabel.textContent = String(orders.filter((order) => order.status !== 'Entregado').length);
        const monthlyTotal = orders
            .filter((order) => (order.type === 'venta' || !order.type) && isCurrentMonth(order.createdAt || order.fecha))
            .reduce((total, order) => total + (Number(order.value ?? order.total) || 0), 0);
        monthlySalesLabel.textContent = currency.format(monthlyTotal);
    };

    const prependOrder = (order) => {
        const row = document.createElement('tr');
        const date = order.createdAt ? new Date(order.createdAt) : null;
        const dateText = date && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
            : '—';
        const typeText = order.type === 'pedido' ? 'Pedido' : 'Venta';
        [order.id, dateText, typeText, order.customer, order.product, currency.format(Number(order.value) || 0)]
            .forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value || '—';
                row.append(cell);
            });
        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = order.status === 'Entregado' ? 'module-badge success' : 'module-badge warning';
        badge.textContent = order.status || 'Por confirmar';
        statusCell.append(badge);
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'module-button secondary';
        deleteButton.type = 'button';
        deleteButton.textContent = 'Eliminar';
        deleteButton.setAttribute('aria-label', `Eliminar ${typeText.toLocaleLowerCase('es')} ${order.id}`);
        deleteButton.addEventListener('click', () => deleteOrder(order.id));
        actionCell.append(deleteButton);
        row.append(statusCell, actionCell);
        rows.append(row);
    };

    const renderOrders = () => {
        const orders = readArray(storageKey);
        rows.replaceChildren();
        [...orders].reverse().forEach(prependOrder);
        updateSummary(orders);
    };

    const recordManualOrder = (event) => {
        event.preventDefault();
        const orders = readArray(storageKey);
        const products = readArray(productsKey);
        const history = readArray(productHistoryKey);
        const type = document.getElementById('orderType').value;
        const quantity = Number(document.getElementById('orderQuantity').value);
        const productName = document.getElementById('orderProduct').value.trim();
        const customer = document.getElementById('customerName').value.trim();
        const value = Number(document.getElementById('orderValue').value);

        if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(value) || value <= 0) {
            message.textContent = 'Ingresa una cantidad y un valor total válidos.';
            return;
        }

        const productIndex = products.findIndex((product) =>
            product.nombre?.trim().toLocaleLowerCase('es') === productName.toLocaleLowerCase('es'));
        const product = productIndex >= 0 ? products[productIndex] : null;
        if (type === 'venta' && product && Number(product.cantidad) < quantity) {
            message.textContent = `Existencias insuficientes para "${product.nombre}". Disponibles: ${product.cantidad} ${product.unidad || 'unidades'}.`;
            return;
        }

        const baseOrderId = `SF-${Date.now().toString().slice(-6)}`;
        let orderId = baseOrderId;
        let suffix = 1;
        while (orders.some((existingOrder) => existingOrder.id === orderId)) {
            orderId = `${baseOrderId}-${suffix}`;
            suffix += 1;
        }
        const createdAt = new Date().toISOString();
        const order = {
            id: orderId,
            customer,
            product: `${productName} × ${quantity}`,
            items: [{
                sku: product?.sku || '',
                name: product?.nombre || productName,
                category: product?.categoria || '',
                quantity,
                price: value / quantity,
                unit: product?.unidad || ''
            }],
            value,
            status: document.getElementById('orderStatus').value,
            type,
            metodoPago: 'Registro administrativo',
            createdAt
        };
        const previousQuantity = product ? Number(product.cantidad) || 0 : null;
        if (type === 'venta' && product) product.cantidad = previousQuantity - quantity;
        history.push({
            tipo: type,
            fecha: createdAt,
            orderId: order.id,
            sku: product?.sku || undefined,
            nombre: product?.nombre || productName,
            categoria: product?.categoria || '',
            cantidad: quantity,
            unidad: product?.unidad || '',
            precio: value / quantity,
            total: value,
            stockAnterior: type === 'venta' ? previousQuantity : null,
            stockNuevo: type === 'venta' && product ? product.cantidad : null,
            cliente: customer
        });
        orders.push(order);

        if (!saveValues({ [storageKey]: orders, [productsKey]: products, [productHistoryKey]: history })) {
            message.textContent = 'No se pudo guardar la venta o pedido. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }

        renderOrders();
        form.reset();
        message.textContent = `${type === 'venta' ? 'Venta' : 'Pedido'} registrada en el historial.`;
    };

    const deleteOrder = (orderId) => {
        const orders = readArray(storageKey);
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
            message.textContent = 'No se encontró la venta o pedido seleccionado. Actualiza la lista e inténtalo de nuevo.';
            return;
        }
        const orderType = order.type === 'pedido' ? 'pedido' : 'venta';
        if (!confirm(`¿Eliminar ${orderType} ${order.id}? Se quitará su registro del historial, pero el inventario no cambiará.`)) return;

        const remainingOrders = orders.filter((entry) => entry.id !== orderId);
        const remainingHistory = readArray(productHistoryKey)
            .filter((entry) => entry.orderId !== orderId);
        if (!saveValues({ [storageKey]: remainingOrders, [productHistoryKey]: remainingHistory })) {
            message.textContent = 'No se pudo eliminar el registro. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }

        renderOrders();
        message.textContent = `${orderType === 'pedido' ? 'Pedido' : 'Venta'} eliminado. El inventario no fue modificado.`;
    };

    renderOrders();
    form.addEventListener('submit', recordManualOrder);

    window.addEventListener('storage', (event) => {
        if ([storageKey, productHistoryKey].includes(event.key)) renderOrders();
    });
});
