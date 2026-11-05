
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');
    const rows = document.getElementById('categoryRows');
    const count = document.getElementById('categoryCount');
    const message = document.getElementById('categoryMessage');
    const storageKey = 'sanfer.categories';
    const deletedCategoriesKey = 'sanfer.deletedCategories';
    const productsKey = 'sanfer.products';
    const historyKey = 'sanfer.productHistory';
    const defaultCategories = [
        'Sillas y Banquetas',
        'Mesas de Comedor',
        'Escritorios',
        'Estanterías',
        'Otros',
        'Muebles de dormitorio',
        'MDF'
    ];

    const normalize = (value) => value.trim().toLocaleLowerCase('es');

    const readArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const readCategories = () => {
        const savedCategories = readArray(storageKey);
        const products = readArray(productsKey);
        const removedNames = new Set(readArray(deletedCategoriesKey)
            .filter((name) => typeof name === 'string')
            .map(normalize));
        const categories = new Map();

        [...defaultCategories.map((name) => ({ name, description: '' })), ...savedCategories].forEach((category) => {
            if (category && typeof category.name === 'string' && !removedNames.has(normalize(category.name))) {
                categories.set(normalize(category.name), category);
            }
        });

        products.forEach((product) => {
            if (typeof product.categoria !== 'string' || !product.categoria.trim()) return;
            const key = normalize(product.categoria);
            if (!removedNames.has(key) && !categories.has(key)) {
                categories.set(key, { name: product.categoria, description: '' });
            }
        });

        return [...categories.values()];
    };

    const renderCategories = () => {
        const categories = readCategories();
        const products = readArray(productsKey);
        rows.replaceChildren();

        categories.forEach((category) => {
            const row = document.createElement('tr');
            const categoryName = normalize(category.name);
            const referenceCount = products.filter((product) => normalize(product.categoria || '') === categoryName).length;
            [category.name, category.description || 'Sin descripción', String(referenceCount)].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'module-button secondary category-delete-button';
            deleteButton.type = 'button';
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteCategory(category));
            actionCell.append(deleteButton);
            row.append(actionCell);
            rows.append(row);
        });

        count.textContent = `${categories.length} categorías`;
    };

    const deleteCategory = (category) => {
        const categoryName = normalize(category.name);
        const products = readArray(productsKey);
        const removedProducts = products.filter((product) => normalize(product.categoria || '') === categoryName);
        const remainingProducts = products.filter((product) => normalize(product.categoria || '') !== categoryName);
        const removedSkus = new Set(removedProducts.map((product) => product.sku).filter(Boolean));
        const remainingNames = new Set(remainingProducts.map((product) => normalize(product.nombre || '')));
        const removedNames = new Set(removedProducts
            .map((product) => normalize(product.nombre || ''))
            .filter((name) => !remainingNames.has(name)));
        const referenceCount = removedProducts.length;
        const messageText = referenceCount
            ? `¿Eliminar la categoría "${category.name}" y sus ${referenceCount} producto(s)? También se quitarán del catálogo y la página principal, junto con sus movimientos del historial.`
            : `¿Eliminar la categoría "${category.name}"?`;
        if (!confirm(messageText)) return;

        const savedCategories = readArray(storageKey).filter((item) => normalize(item.name || '') !== categoryName);
        const deletedCategories = readArray(deletedCategoriesKey);
        if (!deletedCategories.some((name) => typeof name === 'string' && normalize(name) === categoryName)) {
            deletedCategories.push(category.name);
        }
        const history = readArray(historyKey);
        const remainingHistory = history.filter((entry) => {
            if (entry.sku && removedSkus.has(entry.sku)) return false;
            if (entry.sku) return true;
            return !removedNames.has(normalize(entry.nombre || ''));
        });

        const keys = [storageKey, deletedCategoriesKey, productsKey, historyKey];
        const previousValues = new Map(keys.map((key) => [key, localStorage.getItem(key)]));
        try {
            localStorage.setItem(storageKey, JSON.stringify(savedCategories));
            localStorage.setItem(deletedCategoriesKey, JSON.stringify(deletedCategories));
            localStorage.setItem(productsKey, JSON.stringify(remainingProducts));
            localStorage.setItem(historyKey, JSON.stringify(remainingHistory));
        } catch {
            keys.forEach((key) => {
                try {
                    const previousValue = previousValues.get(key);
                    if (previousValue === null) localStorage.removeItem(key);
                    else localStorage.setItem(key, previousValue);
                } catch {
                    // Best effort rollback; the user is still notified below.
                }
            });
            message.textContent = 'No se pudo eliminar la categoría. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }

        message.textContent = `Categoría "${category.name}" eliminada.`;
        renderCategories();
    };

    renderCategories();
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const categories = readArray(storageKey);

        if (readCategories().some((category) => normalize(category.name) === normalize(name))) {
            message.textContent = 'Esa categoría ya está registrada en este navegador.';
            return;
        }

        const deletedCategories = readArray(deletedCategoriesKey)
            .filter((categoryName) => typeof categoryName !== 'string' || normalize(categoryName) !== normalize(name));
        categories.push({ name, description });
        try {
            localStorage.setItem(storageKey, JSON.stringify(categories));
            localStorage.setItem(deletedCategoriesKey, JSON.stringify(deletedCategories));
        } catch {
            message.textContent = 'No se pudo guardar la categoría. Libera espacio del navegador e inténtalo de nuevo.';
            return;
        }
        renderCategories();
        form.reset();
        message.textContent = 'Categoría agregada.';
    });

    window.addEventListener('storage', (event) => {
        if ([storageKey, deletedCategoriesKey, productsKey].includes(event.key)) renderCategories();
    });
});
