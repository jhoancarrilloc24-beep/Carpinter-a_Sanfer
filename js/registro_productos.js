
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const btnCancel = document.getElementById('btnCancel');

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const product = {
            nombre: document.getElementById('nombre').value.trim(),
            categoria: document.getElementById('categoria').value.trim(),
            unidad: document.getElementById('unidad').value.trim(),
            cantidad: Number(document.getElementById('cantidad').value),
            ubicacion: document.getElementById('ubicacion').value.trim(),
            sku: `SAN-${Date.now().toString().slice(-6)}`
        };

        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('sanfer.products') || '[]');
            if (!Array.isArray(products)) products = [];
        } catch {
            products = [];
        }

        products.push(product);
        localStorage.setItem('sanfer.products', JSON.stringify(products));
        alert(`Producto "${product.nombre}" registrado.\nUbicación: ${product.ubicacion} | Stock inicial: ${product.cantidad} ${product.unidad}`);
        productForm.reset();
    });

    btnCancel.addEventListener('click', () => {
        if (confirm('¿Desea cancelar el registro y limpiar los campos?')) {
            productForm.reset();
        }
    });
});