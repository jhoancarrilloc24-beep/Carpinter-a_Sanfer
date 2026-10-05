const CART_STORAGE_KEY = 'sanferCarrito';
const cartWrapper = document.querySelector('.cart-wrapper');
const cartToggle = document.querySelector('.cart-toggle');
const cartDropdown = document.querySelector('#cart-dropdown');
const cartItems = document.querySelector('.cart-items');
const cartBadge = document.querySelector('.cart-badge');
const cartSubtotal = document.querySelector('.cart-subtotal');

function readCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
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
  const cart = readCart();
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  cartBadge.textContent = String(itemCount);
  cartToggle.setAttribute('aria-label', `Ver carrito, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`);
  cartItems.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'cart-empty';
    emptyMessage.textContent = 'Tu carrito está vacío.';
    cartItems.append(emptyMessage);
    cartSubtotal.hidden = true;
    return;
  }

  for (const item of cart) {
    const row = document.createElement('p');
    row.className = 'cart-item';
    row.textContent = `${item.name} · ${item.quantity} × ${formatPrice(item.price)}`;
    cartItems.append(row);
  }

  cartSubtotal.textContent = `Subtotal: ${formatPrice(subtotal)}`;
  cartSubtotal.hidden = false;
}

function setCartOpen(isOpen) {
  cartDropdown.hidden = !isOpen;
  cartToggle.setAttribute('aria-expanded', String(isOpen));
}

cartToggle.addEventListener('click', () => {
  setCartOpen(cartDropdown.hidden);
});

document.addEventListener('click', event => {
  if (!cartWrapper.contains(event.target)) setCartOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setCartOpen(false);
});

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-cart-add]');
  if (!addButton) return;

  const name = addButton.closest('.product-card').querySelector('.product-title').textContent.trim();
  const price = Number(addButton.dataset.price);
  const cart = readCart();
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCart();
  setCartOpen(true);
});

renderCart();