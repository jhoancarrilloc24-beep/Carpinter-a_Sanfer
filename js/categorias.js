
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');
    const rows = document.getElementById('categoryRows');
    const count = document.getElementById('categoryCount');
    const message = document.getElementById('categoryMessage');
    const storageKey = 'sanfer.categories';

    const readCategories = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch {
            return [];
        }
    };

    const appendCategory = (category) => {
        const row = document.createElement('tr');
        [category.name, category.description || 'Sin descripción', '0'].forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        });
        rows.append(row);
    };

    const savedCategories = readCategories();
    savedCategories.forEach(appendCategory);
    count.textContent = `${4 + savedCategories.length} categorías`;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const categories = readCategories();

        if (categories.some((category) => category.name.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))) {
            message.textContent = 'Esa categoría ya está registrada en este navegador.';
            return;
        }

        categories.push({ name, description });
        localStorage.setItem(storageKey, JSON.stringify(categories));
        appendCategory({ name, description });
        count.textContent = `${4 + categories.length} categorías`;
        form.reset();
        message.textContent = 'Categoría agregada.';
    });
});
