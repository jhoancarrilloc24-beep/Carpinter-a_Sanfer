
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
  cartItemsContainer.replaceChildren();

  if (!cart.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    const title = document.createElement('h3');
    title.textContent = 'Tu carrito está vacío';
    const message = document.createElement('p');
    message.textContent = 'Aún no has agregado productos a tu compra.';
    const browseLink = document.createElement('a');
    browseLink.className = 'secondary-btn';
    browseLink.href = '../../index.html#catalogo';
    browseLink.textContent = 'Explorar productos';
    emptyState.append(title, message, browseLink);
    cartItemsContainer.append(emptyState);
    itemsCount.textContent = '0';
    subtotalValue.textContent = '$ 0 COP';
    totalValue.textContent = '$ 0 COP';
    btnPago.disabled = true;
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;
    const itemTotal = price * quantity;
    subtotal += itemTotal;
    totalItems += quantity;

    const cartItem = document.createElement('article');
    cartItem.className = 'cart-item';

    const thumbnail = document.createElement('div');
    thumbnail.className = 'item-thumb';
    thumbnail.setAttribute('aria-hidden', 'true');
    thumbnail.textContent = String(item.name || 'PR').slice(0, 2).toUpperCase();

    const info = document.createElement('div');
    info.className = 'item-info';
    const name = document.createElement('h3');
    name.textContent = item.name || 'Producto';
    const unitPrice = document.createElement('p');
    unitPrice.className = 'unit-price';
    unitPrice.textContent = `${formatPrice(price)} por unidad`;

    const controls = document.createElement('div');
    controls.className = 'quantity-control';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', `Cantidad de ${item.name || 'producto'}`);
    const decreaseButton = document.createElement('button');
    decreaseButton.className = 'quantity-btn';
    decreaseButton.type = 'button';
    decreaseButton.dataset.quantity = String(index);
    decreaseButton.dataset.change = '-1';
    decreaseButton.setAttribute('aria-label', `Disminuir cantidad de ${item.name || 'producto'}`);
    decreaseButton.textContent = '−';
    const quantityLabel = document.createElement('span');
    quantityLabel.className = 'quantity-value';
    quantityLabel.textContent = String(quantity);
    const increaseButton = document.createElement('button');
    increaseButton.className = 'quantity-btn';
    increaseButton.type = 'button';
    increaseButton.dataset.quantity = String(index);
    increaseButton.dataset.change = '1';
    increaseButton.setAttribute('aria-label', `Aumentar cantidad de ${item.name || 'producto'}`);
    increaseButton.textContent = '+';
    decreaseButton.disabled = quantity <= 1;
    controls.append(decreaseButton, quantityLabel, increaseButton);
    info.append(name, unitPrice, controls);

    const itemTotalBlock = document.createElement('div');
    itemTotalBlock.className = 'item-total';
    const priceLabel = document.createElement('span');
    priceLabel.className = 'item-total-label';
    priceLabel.textContent = 'Total';
    const priceValue = document.createElement('strong');
    priceValue.className = 'item-price';
    priceValue.textContent = formatPrice(itemTotal);
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.type = 'button';
    removeButton.dataset.remove = String(index);
    removeButton.setAttribute('aria-label', `Quitar ${item.name || 'producto'} del carrito`);
    removeButton.textContent = 'Quitar';
    itemTotalBlock.append(priceLabel, priceValue, removeButton);

    cartItem.append(thumbnail, info, itemTotalBlock);
    cartItemsContainer.append(cartItem);
  });

  itemsCount.textContent = String(totalItems);
  subtotalValue.textContent = formatPrice(subtotal);
  totalValue.textContent = formatPrice(subtotal);
  btnPago.disabled = false;
}

cartItemsContainer.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    const cart = getCart();
    cart.splice(Number(removeButton.dataset.remove), 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
    return;
  }

  const quantityButton = event.target.closest('[data-quantity]');
  if (!quantityButton) return;

  const cart = getCart();
  const item = cart[Number(quantityButton.dataset.quantity)];
  if (!item) return;
  item.quantity = Math.max(1, (Number(item.quantity) || 1) + Number(quantityButton.dataset.change));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  renderCart();
});

btnPago.addEventListener('click', () => {
  window.location.href = 'metodo_pago.html';
});

renderCart();
