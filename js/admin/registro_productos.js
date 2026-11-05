
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const btnCancel = document.getElementById('btnCancel');
    const imageInput = document.getElementById('imagen');
    const imagePreview = document.getElementById('imagePreview');
    const imageFileName = document.getElementById('imageFileName');
    const historyRows = document.getElementById('productHistoryRows');
    const historyEmpty = document.getElementById('productHistoryEmpty');
    const productsKey = 'sanfer.products';
    const historyKey = 'sanfer.productHistory';
    let imageDataUrl = '';
    let imageReadPromise = Promise.resolve();

    const readStoredArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const renderHistory = () => {
        const history = readStoredArray(historyKey).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        historyRows.replaceChildren();
        history.slice(0, 50).forEach((entry) => {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            const date = new Date(entry.fecha);
            dateCell.textContent = Number.isNaN(date.getTime())
                ? 'Fecha desconocida'
                : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
            const typeCell = document.createElement('td');
            typeCell.textContent = entry.tipo === 'reposicion' ? 'Reposición de stock' : 'Producto registrado';
            const productCell = document.createElement('td');
            productCell.textContent = `${entry.nombre || 'Producto'}${entry.sku ? ` · ${entry.sku}` : ''}`;
            const detailCell = document.createElement('td');
            detailCell.textContent = entry.tipo === 'reposicion'
                ? `Stock: ${entry.stockAnterior} → ${entry.stockNuevo} ${entry.unidad || ''}`.trim()
                : `Stock inicial: ${entry.cantidad} ${entry.unidad || ''}`.trim();
            row.append(dateCell, typeCell, productCell, detailCell);
            historyRows.append(row);
        });
        historyEmpty.hidden = history.length !== 0;
    };

    const generateIdentifier = (products) => {
        const baseSku = `SAN-${Date.now().toString().slice(-6)}`;
        let sku = baseSku;
        let suffix = 1;
        while (products.some((product) => product.sku === sku)) {
            sku = `${baseSku}-${suffix}`;
            suffix += 1;
        }
        return sku;
    };

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        imageDataUrl = '';
        imagePreview.hidden = true;
        imagePreview.removeAttribute('src');

        if (!file) {
            imageReadPromise = Promise.resolve();
            imageFileName.textContent = 'Ninguna imagen seleccionada';
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Selecciona un archivo de imagen válido.');
            imageInput.value = '';
            imageReadPromise = Promise.resolve();
            imageFileName.textContent = 'Ninguna imagen seleccionada';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen debe pesar 2 MB o menos.');
            imageInput.value = '';
            imageReadPromise = Promise.resolve();
            imageFileName.textContent = 'Ninguna imagen seleccionada';
            return;
        }

        imageReadPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                imageDataUrl = reader.result;
                imagePreview.src = imageDataUrl;
                imagePreview.hidden = false;
                imageFileName.textContent = file.name;
                resolve();
            });
            reader.addEventListener('error', reject);
            reader.readAsDataURL(file);
        });
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await imageReadPromise;
        } catch {
            alert('No se pudo leer la imagen seleccionada. Intenta con otro archivo.');
            return;
        }

        const product = {
            nombre: document.getElementById('nombre').value.trim(),
            categoria: document.getElementById('categoria').value.trim(),
            unidad: document.getElementById('unidad').value.trim(),
            cantidad: Number(document.getElementById('cantidad').value),
            stockMinimo: Number(document.getElementById('stockMinimo').value),
            ubicacion: document.getElementById('ubicacion').value.trim(),
            imagen: imageDataUrl || null,
            alertaRevisada: false
        };

        const products = readStoredArray(productsKey);
        product.sku = generateIdentifier(products);
        products.push(product);
        try {
            const history = readStoredArray(historyKey);
            history.push({
                tipo: 'registro',
                fecha: new Date().toISOString(),
                sku: product.sku,
                nombre: product.nombre,
                cantidad: product.cantidad,
                unidad: product.unidad
            });
            localStorage.setItem(productsKey, JSON.stringify(products));
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch {
            alert('No se pudo guardar el producto o su historial. Reduce el tamaño de la imagen o libera espacio del navegador.');
            return;
        }
        renderHistory();
        const lowStockMessage = product.cantidad <= product.stockMinimo
            ? `\n\nStock bajo: se marcó como "Rellenar" y se creó una alerta para el administrador.`
            : '';
        alert(`Producto "${product.nombre}" registrado.\nUbicación: ${product.ubicacion} | Stock inicial: ${product.cantidad} ${product.unidad}${lowStockMessage}`);
        productForm.reset();
        imageDataUrl = '';
        imageReadPromise = Promise.resolve();
        imagePreview.hidden = true;
        imagePreview.removeAttribute('src');
        imageFileName.textContent = 'Ninguna imagen seleccionada';
    });

    btnCancel.addEventListener('click', () => {
        if (confirm('¿Desea cancelar el registro y limpiar los campos?')) {
            productForm.reset();
            imageDataUrl = '';
            imageReadPromise = Promise.resolve();
            imagePreview.hidden = true;
            imagePreview.removeAttribute('src');
            imageFileName.textContent = 'Ninguna imagen seleccionada';
        }
    });

    window.addEventListener('storage', (event) => {
        if (event.key === historyKey) renderHistory();
    });

    renderHistory();
});