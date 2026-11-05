
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
    const categoriesKey = 'sanfer.categories';
    const deletedCategoriesKey = 'sanfer.deletedCategories';
    const categorySelect = document.getElementById('categoria');
    const defaultCategories = [
        'Sillas y Banquetas',
        'Mesas de Comedor',
        'Escritorios',
        'Estanterías',
        'Otros',
        'Muebles de dormitorio',
        'MDF'
    ];
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

    const renderCategoryOptions = () => {
        const selectedCategory = categorySelect.value;
        const categoryNames = [
            ...defaultCategories,
            ...readStoredArray(categoriesKey).map((category) => category.name),
            ...readStoredArray(productsKey).map((product) => product.categoria)
        ].filter((name) => typeof name === 'string' && name.trim());
        const removedNames = new Set(readStoredArray(deletedCategoriesKey)
            .filter((name) => typeof name === 'string')
            .map((name) => name.trim().toLocaleLowerCase('es')));
        const uniqueNames = [...new Map(categoryNames
            .filter((name) => !removedNames.has(name.trim().toLocaleLowerCase('es')))
            .map((name) => [name.trim().toLocaleLowerCase('es'), name.trim()])).values()];
        categorySelect.replaceChildren();

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Selecciona una categoría';
        categorySelect.append(placeholder);

        uniqueNames.forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            categorySelect.append(option);
        });

        if (uniqueNames.includes(selectedCategory)) categorySelect.value = selectedCategory;
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
            typeCell.textContent = entry.tipo === 'reposicion'
                ? 'Reposición de stock'
                : entry.tipo === 'precio'
                    ? 'Precio actualizado'
                    : entry.tipo === 'venta'
                        ? 'Venta a cliente'
                        : entry.tipo === 'pedido'
                            ? 'Pedido registrado'
                            : 'Producto registrado';
            const productCell = document.createElement('td');
            productCell.textContent = `${entry.nombre || 'Producto'}${entry.sku ? ` · ${entry.sku}` : ''}`;
            const detailCell = document.createElement('td');
            if (entry.tipo === 'reposicion') {
                detailCell.textContent = `Stock: ${entry.stockAnterior} → ${entry.stockNuevo} ${entry.unidad || ''}`.trim();
            } else if (entry.tipo === 'precio') {
                const oldPrice = entry.precioAnterior === null ? 'Sin precio' : formatPrice(entry.precioAnterior);
                detailCell.textContent = `Precio: ${oldPrice} → ${formatPrice(entry.precioNuevo)}`;
            } else if (entry.tipo === 'venta' || entry.tipo === 'pedido') {
                const stockDetail = entry.stockAnterior === null || entry.stockAnterior === undefined
                    ? ''
                    : ` · Stock: ${entry.stockAnterior} → ${entry.stockNuevo}`;
                const orderDetail = entry.orderId ? ` · Pedido ${entry.orderId}` : '';
                detailCell.textContent = `${entry.cantidad} ${entry.unidad || 'unidad(es)'} × ${formatPrice(entry.precio)}${stockDetail}${orderDetail}`;
            } else {
                const price = entry.precio === undefined ? 'Precio no registrado' : formatPrice(entry.precio);
                detailCell.textContent = `Stock inicial: ${entry.cantidad} ${entry.unidad || ''} · ${price}`.trim();
            }
            row.append(dateCell, typeCell, productCell, detailCell);
            historyRows.append(row);
        });
        historyEmpty.hidden = history.length !== 0;
    };

    const formatPrice = (price) => price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price))
        ? new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(price))
        : 'Sin asignar';

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
            precio: Number(document.getElementById('precio').value),
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
                precio: product.precio,
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
        alert(`Producto "${product.nombre}" registrado.\nUbicación: ${product.ubicacion} | Stock inicial: ${product.cantidad} ${product.unidad} | Precio: ${formatPrice(product.precio)}${lowStockMessage}`);
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
        if ([categoriesKey, deletedCategoriesKey, productsKey].includes(event.key)) renderCategoryOptions();
    });

    renderCategoryOptions();
    renderHistory();
});