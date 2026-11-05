// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('supplierForm');
    const rows = document.getElementById('supplierRows');
    const count = document.getElementById('supplierCount');
    const message = document.getElementById('supplierMessage');
    const paymentForm = document.getElementById('supplierPaymentForm');
    const supplierSelect = document.getElementById('paymentSupplier');
    const paymentMessage = document.getElementById('supplierPaymentMessage');
    const paymentRows = document.getElementById('supplierPaymentRows');
    const paymentCount = document.getElementById('supplierPaymentCount');
    const paymentEmpty = document.getElementById('supplierPaymentEmpty');
    const monthlyPaymentsLabel = document.getElementById('monthlySupplierPayments');
    const suppliersKey = 'sanfer.suppliers';
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

    const saveArray = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
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

    const localDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const renderSuppliers = () => {
        const suppliers = readArray(suppliersKey);
        rows.replaceChildren();
        suppliers.forEach((supplier) => {
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
        });
        count.textContent = `${suppliers.length} activos`;

        const selectedSupplier = supplierSelect.value;
        supplierSelect.replaceChildren();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = suppliers.length ? 'Selecciona un proveedor' : 'Primero registra un proveedor';
        supplierSelect.append(placeholder);
        suppliers.forEach((supplier) => {
            const option = document.createElement('option');
            option.value = supplier.name;
            option.textContent = supplier.name;
            supplierSelect.append(option);
        });
        if (suppliers.some((supplier) => supplier.name === selectedSupplier)) {
            supplierSelect.value = selectedSupplier;
        }
    };

    const renderPayments = () => {
        const payments = [...readArray(paymentsKey)].sort((first, second) =>
            String(second.date || '').localeCompare(String(first.date || '')));
        paymentRows.replaceChildren();
        payments.forEach((payment) => {
            const row = document.createElement('tr');
            const date = payment.date ? new Date(`${payment.date}T00:00:00`) : null;
            const dateLabel = date && !Number.isNaN(date.getTime())
                ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
                : '—';
            [dateLabel, payment.supplierName || '—', payment.description || '—', currency.format(Number(payment.amount) || 0)]
                .forEach((value) => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.append(cell);
                });
            paymentRows.append(row);
        });

        const monthlyTotal = payments
            .filter((payment) => isCurrentMonth(payment.date))
            .reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
        monthlyPaymentsLabel.textContent = currency.format(monthlyTotal);
        paymentCount.textContent = `${payments.length} ${payments.length === 1 ? 'pago' : 'pagos'}`;
        paymentEmpty.hidden = payments.length !== 0;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const suppliers = readArray(suppliersKey);
        const supplier = {
            name: document.getElementById('supplierName').value.trim(),
            contact: document.getElementById('supplierContact').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim()
        };
        if (suppliers.some((entry) => entry.name.toLocaleLowerCase('es') === supplier.name.toLocaleLowerCase('es'))) {
            message.textContent = 'Ese proveedor ya está registrado.';
            return;
        }
        suppliers.push(supplier);
        if (!saveArray(suppliersKey, suppliers)) {
            message.textContent = 'No se pudo guardar el proveedor. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }
        form.reset();
        renderSuppliers();
        message.textContent = 'Proveedor guardado en este navegador.';
    });

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const supplierName = supplierSelect.value;
        const amount = Number(document.getElementById('supplierPaymentAmount').value);
        const date = document.getElementById('supplierPaymentDate').value;
        if (!readArray(suppliersKey).some((supplier) => supplier.name === supplierName)
            || !Number.isInteger(amount) || amount <= 0 || !date) {
            paymentMessage.textContent = 'Selecciona un proveedor e ingresa un valor y fecha válidos.';
            return;
        }

        const payments = readArray(paymentsKey);
        payments.push({
            id: `PAG-${Date.now().toString().slice(-6)}`,
            supplierName,
            amount,
            date,
            description: document.getElementById('supplierPaymentDescription').value.trim()
        });
        if (!saveArray(paymentsKey, payments)) {
            paymentMessage.textContent = 'No se pudo guardar el pago. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }

        paymentForm.reset();
        document.getElementById('supplierPaymentDate').value = localDate();
        renderPayments();
        paymentMessage.textContent = 'Pago registrado en el historial de proveedores.';
    });

    renderSuppliers();
    document.getElementById('supplierPaymentDate').value = localDate();
    renderPayments();
    window.addEventListener('storage', (event) => {
        if (event.key === suppliersKey) renderSuppliers();
        if (event.key === paymentsKey) renderPayments();
    });
});
