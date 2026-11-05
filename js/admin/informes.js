
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportReport');
    const message = document.getElementById('reportMessage');
    const reportTable = document.getElementById('reportTable');
    const reportEmpty = reportTable.parentElement.querySelector('.module-empty');
    const productsKey = 'sanfer.products';
    const ordersKey = 'sanfer.orders';
    const paymentsKey = 'sanfer.supplierPayments';
    const currency = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    });

    const readArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const isCurrentMonth = (dateValue) => {
        if (typeof dateValue !== 'string' || !dateValue) return false;
        const now = new Date();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue.slice(0, 7) === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        const date = new Date(dateValue);
        return !Number.isNaN(date.getTime())
            && date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth();
    };

    const renderReport = () => {
        const products = readArray(productsKey);
        const sales = readArray(ordersKey)
            .filter((order) => (order.type === 'venta' || !order.type) && isCurrentMonth(order.createdAt || order.fecha))
            .reduce((total, order) => total + (Number(order.value ?? order.total) || 0), 0);
        const supplierPayments = readArray(paymentsKey)
            .filter((payment) => isCurrentMonth(payment.date))
            .reduce((total, payment) => total + (Number(payment.amount) || 0), 0);

        document.getElementById('reportProductCount').textContent = String(products.length);
        document.getElementById('reportStockCount').textContent = String(products.reduce(
            (total, product) => total + (Number(product.cantidad) || 0),
            0
        ));
        document.getElementById('reportMonthlySales').textContent = currency.format(sales);
        document.getElementById('reportSupplierPayments').textContent = currency.format(supplierPayments);
        document.getElementById('reportMonthlyProfit').textContent = currency.format(sales - supplierPayments);

        const body = reportTable.tBodies[0];
        body.replaceChildren();
        products.forEach((product) => {
            const row = document.createElement('tr');
            const quantity = Number(product.cantidad) || 0;
            const price = Number(product.precio);
            const estimatedValue = Number.isFinite(price) ? quantity * price : null;
            [
                product.nombre || '—',
                product.categoria || '—',
                String(quantity),
                estimatedValue === null ? 'Sin precio' : currency.format(estimatedValue)
            ].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });
            body.append(row);
        });
        reportEmpty.hidden = products.length !== 0;
        message.textContent = '';
    };

    exportButton.addEventListener('click', () => {
        const rows = [...reportTable.querySelectorAll('tr')].map((row) =>
            [...row.children].map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(',')
        );
        const csv = `\uFEFF${rows.join('\r\n')}`;
        const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'informe-inventario-sanfer.csv';
        downloadLink.click();
        URL.revokeObjectURL(url);
        message.textContent = 'Informe descargado en formato CSV.';
    });

    renderReport();
    window.addEventListener('storage', (event) => {
        if ([productsKey, ordersKey, paymentsKey].includes(event.key)) renderReport();
    });
});
