
// SECCIÓN: LÓGICA GENERAL
// =========================================
const STORAGE_KEY = 'sanferCarrito';
const cartItemsContainer = document.querySelector('#cartItems');
const itemsCount = document.querySelector('#itemsCount');
const subtotalValue = document.querySelector('#subtotalValue');
const totalValue = document.querySelector('#totalValue');
const btnPago = document.querySelector('#btnPago');

function getCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch (error) {
    return [];
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    cartItemsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Tu carrito está vacío</h3>
        <p>Aún no has agregado productos a tu compra.</p>
      </div>
    `;
    itemsCount.textContent = '0';
    subtotalValue.textContent = '$ 0 COP';
    totalValue.textContent = '$ 0 COP';
    btnPago.disabled = true;
    btnPago.style.opacity = '0.55';
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cartItemsContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;

    return `
      <article class="cart-item">
        <div class="item-thumb">${item.name.slice(0, 2).toUpperCase()}</div>
        <div class="item-info">
          <h3>${item.name}</h3>
          <p>Cantidad: ${item.quantity}</p>
          <div class="item-meta">
            <span class="item-price">${formatPrice(itemTotal)}</span>
            <button class="remove-btn" type="button" data-name="${item.name}">Quitar</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  itemsCount.textContent = String(totalItems);
  subtotalValue.textContent = formatPrice(subtotal);
  totalValue.textContent = formatPrice(subtotal);
  btnPago.disabled = false;
  btnPago.style.opacity = '1';

  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.name;
      const updatedCart = getCart().filter(item => item.name !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
      renderCart();
    });
  });
}

btnPago.addEventListener('click', () => {
  window.location.href = 'metodo_pago.html';
});

renderCart();
