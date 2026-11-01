document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.category-filters .filter-btn');
    const productCards = document.querySelectorAll('.product-card'); // Asegúrate de que tus tarjetas de producto tengan esta clase en el HTML

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Quitar la clase 'active' de todos los botones y ponérsela al presionado
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.textContent.trim();

            // 2. Filtrar las tarjetas de productos
            productCards.forEach(card => {
                const productCategory = card.getAttribute('data-category'); // Debe coincidir con un atributo en tu HTML

                if (selectedCategory === 'Todos' || productCategory === selectedCategory) {
                    card.style.display = 'block'; // O 'flex' / 'grid' según tu diseño
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});