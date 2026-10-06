
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('supplierForm');
    const rows = document.getElementById('supplierRows');
    const message = document.getElementById('supplierMessage');
    const storageKey = 'sanfer.suppliers';

    const readSuppliers = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch {
            return [];
        }
    };

    const appendSupplier = (supplier) => {
        const row = document.createElement('tr');
        [supplier.name, supplier.contact || '—', supplier.email || '—', supplier.phone || '—'].forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        });
        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'module-badge success';
        badge.textContent = 'Activo';
        statusCell.append(badge);
        row.append(statusCell);
        rows.append(row);
    };

    readSuppliers().forEach(appendSupplier);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const suppliers = readSuppliers();
        suppliers.push({
            name: document.getElementById('supplierName').value.trim(),
            contact: document.getElementById('supplierContact').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim()
        });
        localStorage.setItem(storageKey, JSON.stringify(suppliers));
        appendSupplier(suppliers[suppliers.length - 1]);
        form.reset();
        message.textContent = 'Proveedor guardado en este navegador.';
    });
});
