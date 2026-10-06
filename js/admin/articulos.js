
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const rowsContainer = document.getElementById('articleRows');
    const searchInput = document.getElementById('articleSearch');
    const stockFilter = document.getElementById('stockFilter');
    const countLabel = document.getElementById('articleCount');
    const emptyMessage = document.getElementById('articleEmpty');

    try {
        const products = JSON.parse(localStorage.getItem('sanfer.products') || '[]');
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.dataset.stock = 'ok';
            [product.sku || `SAN-${String(index + 1).padStart(3, '0')}`, product.nombre, product.categoria, product.unidad, product.cantidad]
                .forEach((value) => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.append(cell);
                });
            const statusCell = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'module-badge success';
            badge.textContent = 'Registrado';
            statusCell.append(badge);
            row.append(statusCell);
            rowsContainer.append(row);
        });
    } catch {
        localStorage.removeItem('sanfer.products');
    }

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

    searchInput.addEventListener('input', filterRows);
    stockFilter.addEventListener('change', filterRows);
});
