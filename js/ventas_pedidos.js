
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('orderForm');
    const rows = document.getElementById('orderRows');
    const message = document.getElementById('orderMessage');
    const countLabel = document.getElementById('orderCount');
    const openOrdersLabel = document.getElementById('openOrders');
    const monthlySalesLabel = document.getElementById('monthlySales');
    const storageKey = 'sanfer.orders';
    const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    const readOrders = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch {
            return [];
        }
    };

    const prependOrder = (order) => {
        const row = document.createElement('tr');
        [order.id, order.customer, order.product, currency.format(order.value)].forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        });
        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'module-badge warning';
        badge.textContent = order.status;
        statusCell.append(badge);
        row.append(statusCell);
        rows.prepend(row);
    };

    const updateSummary = (orders) => {
        countLabel.textContent = `${3 + orders.length} pedidos`;
        openOrdersLabel.textContent = String(3 + orders.filter((order) => order.status !== 'Entregado').length);
        const monthlyTotal = 2450000 + orders.reduce((total, order) => total + (Number(order.value) || 0), 0);
        monthlySalesLabel.textContent = currency.format(monthlyTotal);
    };

    const savedOrders = readOrders();
    savedOrders.forEach(prependOrder);
    updateSummary(savedOrders);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const orders = readOrders();
        const order = {
            id: `SF-${1050 + orders.length}`,
            customer: document.getElementById('customerName').value.trim(),
            product: document.getElementById('orderProduct').value.trim(),
            value: Number(document.getElementById('orderValue').value),
            status: document.getElementById('orderStatus').value
        };
        orders.push(order);
        localStorage.setItem(storageKey, JSON.stringify(orders));
        prependOrder(order);
        updateSummary(orders);
        form.reset();
        message.textContent = 'Pedido agregado a la lista local.';
    });
});
