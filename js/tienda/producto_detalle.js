
// SECCIÓN: LÓGICA GENERAL
// =========================================
const cartWrapper = document.querySelector('.cart-wrapper');
const cartButton = document.querySelector('.cart-btn');
const cartDropdown = document.querySelector('.cart-dropdown');
const cartItems = document.querySelector('.cart-items');
const cartBadge = document.querySelector('.cart-badge');
const cartTotal = document.querySelector('.cart-total');
const checkoutButton = document.querySelector('.btn-cart-checkout');
const quantityInput = document.querySelector('#product-quantity');
const CART_STORAGE_KEY = 'sanferCarrito';
const cart = loadCart();
const product = { name: 'Repisas Premium Gris', price: 60000 };

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function setCartOpen(isOpen) {
  cartDropdown.hidden = !isOpen;
  cartDropdown.classList.toggle('is-open', isOpen);
  cartButton.setAttribute('aria-expanded', String(isOpen));
}

function formatPrice(price) {
  return `$ ${price.toLocaleString('es-CO')} COP`;
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  cartBadge.textContent = itemCount;
  cartButton.setAttribute('aria-label', `Ver carrito, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`);
  saveCart();

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    cartTotal.hidden = true;
    checkoutButton.hidden = true;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-price">${item.quantity} × ${formatPrice(item.price)}</p>
      </div>
    </div>
  `).join('');
  cartTotal.textContent = `Subtotal: ${formatPrice(subtotal)}`;
  cartTotal.hidden = false;
  checkoutButton.hidden = false;
}

cartButton.addEventListener('click', () => {
  setCartOpen(cartDropdown.hidden);
});

document.addEventListener('click', event => {
  if (!cartWrapper.contains(event.target)) setCartOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setCartOpen(false);
});

checkoutButton.addEventListener('click', () => {
  window.location.href = 'lista_carrito.html';
});

document.querySelector('.btn-add-cart').addEventListener('click', event => {
  event.stopPropagation();
  const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
  quantityInput.value = quantity;
  const existingItem = cart.find(item => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  renderCart();
  setCartOpen(true);
});

document.querySelector('.quantity-decrease').addEventListener('click', () => {
  quantityInput.value = Math.max(1, (Number.parseInt(quantityInput.value, 10) || 1) - 1);
});

document.querySelector('.quantity-increase').addEventListener('click', () => {
  quantityInput.value = (Number.parseInt(quantityInput.value, 10) || 1) + 1;
});
