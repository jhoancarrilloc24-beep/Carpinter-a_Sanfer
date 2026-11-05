document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.querySelector('.category-filters');
    const productsGrid = document.querySelector('.products-grid');
    const productsKey = 'sanfer.products';
    const categoriesKey = 'sanfer.categories';
    const deletedCategoriesKey = 'sanfer.deletedCategories';
    const defaultCategories = [
        'Sillas y Banquetas',
        'Mesas de Comedor',
        'Escritorios',
        'Estanterías',
        'Otros',
        'Muebles de dormitorio',
        'MDF'
    ];
    if (!filterContainer || !productsGrid) return;

    const readStoredArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const normalize = (value) => value.trim().toLocaleLowerCase('es');
    let selectedCategory = '*';

    const applyFilter = () => {
        const buttons = filterContainer.querySelectorAll('.filter-btn');
        buttons.forEach((button) => {
            button.classList.toggle('active', button.dataset.category === selectedCategory);
        });
        document.querySelectorAll('.product-card').forEach((card) => {
            const matchesCategory = selectedCategory === '*'
                || normalize(card.dataset.category || '') === normalize(selectedCategory);
            card.hidden = !matchesCategory;
        });
    };

    const renderRegisteredProducts = () => {
        productsGrid.querySelectorAll('[data-inventory-product]').forEach((card) => card.remove());
        readStoredArray(productsKey).forEach((product) => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.dataset.category = product.categoria || '';
            card.dataset.inventoryProduct = '';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'product-image-container';
            if (product.imagen) {
                const image = document.createElement('img');
                image.className = 'product-img';
                image.src = product.imagen;
                image.alt = product.nombre || 'Producto registrado';
                imageContainer.append(image);
            } else {
                const placeholder = document.createElement('span');
                placeholder.className = 'product-placeholder';
                placeholder.textContent = 'Carpintería Sanfer';
                imageContainer.append(placeholder);
            }

            const details = document.createElement('div');
            details.className = 'product-details';
            const category = document.createElement('span');
            category.className = 'product-category';
            category.textContent = product.categoria || 'Sin categoría';
            const title = document.createElement('h3');
            title.className = 'product-title';
            title.textContent = product.nombre || 'Producto registrado';
            const stock = document.createElement('p');
            stock.className = 'registered-product-stock';
            const quantity = Number(product.cantidad) || 0;
            stock.textContent = quantity > 0
                ? `Disponible: ${quantity} ${product.unidad || 'unidades'}`
                : 'Sin existencias';
            const price = document.createElement('p');
            price.className = 'current-price registered-product-price';
            const numericPrice = Number(product.precio);
            const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;
            price.textContent = hasPrice
                ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(numericPrice)
                : 'Precio pendiente';
            details.append(category, title, price, stock);
            if (hasPrice) {
                const addButton = document.createElement('button');
                addButton.className = 'btn btn-card';
                addButton.type = 'button';
                addButton.dataset.cartAdd = '';
                addButton.dataset.price = String(numericPrice);
                addButton.dataset.currency = 'COP';
                addButton.textContent = 'Añadir al carrito';
                details.append(addButton);
            }
            card.append(imageContainer, details);
            productsGrid.append(card);
        });
    };

    const renderCategoryButtons = () => {
        const removedNames = new Set(readStoredArray(deletedCategoriesKey)
            .filter((name) => typeof name === 'string')
            .map(normalize));
        const storedNames = [
            ...defaultCategories,
            ...readStoredArray(categoriesKey).map((category) => category.name),
            ...readStoredArray(productsKey).map((product) => product.categoria)
        ].filter((name) => typeof name === 'string' && name.trim());
        const categoryNames = [...new Map(storedNames
            .filter((name) => !removedNames.has(normalize(name)))
            .map((name) => [normalize(name), name.trim()])).values()];

        filterContainer.replaceChildren();
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn';
        allButton.type = 'button';
        allButton.textContent = 'Todos';
        allButton.dataset.category = '*';
        filterContainer.append(allButton);

        categoryNames.forEach((categoryName) => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.type = 'button';
            button.textContent = categoryName;
            button.dataset.category = categoryName;
            filterContainer.append(button);
        });

        if (![...filterContainer.querySelectorAll('.filter-btn')].some((button) => button.dataset.category === selectedCategory)) {
            selectedCategory = '*';
        }
        applyFilter();
    };

    filterContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.filter-btn');
        if (!button || !filterContainer.contains(button)) return;
        selectedCategory = button.dataset.category;
        applyFilter();
    });

    window.addEventListener('storage', (event) => {
        if ([categoriesKey, deletedCategoriesKey, productsKey].includes(event.key)) {
            renderCategoryButtons();
            renderRegisteredProducts();
        }
    });

    renderCategoryButtons();
    renderRegisteredProducts();
});