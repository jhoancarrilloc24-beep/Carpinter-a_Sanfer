
// SECCIÓN: LÓGICA GENERAL
// =========================================
const CART_STORAGE_KEY = 'sanferCarrito';
const USER_STORAGE_KEY = 'sanferEnvioData';
const ORDER_STORAGE_KEY = 'sanfer.orders';
const checkoutItems = document.querySelector('#checkoutItems');
const checkoutTotal = document.querySelector('#checkoutTotal');
const paymentForm = document.querySelector('#paymentForm');
const successMessage = document.querySelector('#successMessage');
const guardarDatosCheckbox = document.querySelector('#guardarDatos');
const paymentRadios = paymentForm.querySelectorAll('input[name="metodoPago"]');
const paymentPanels = paymentForm.querySelectorAll('[data-payment-panel]');

function getCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
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

function renderSummary() {
  const cart = getCart();
  let subtotal = 0;

  if (!cart.length) {
    checkoutItems.innerHTML = '<div class="checkout-item"><span>Tu carrito está vacío</span></div>';
    checkoutTotal.textContent = '$ 0 COP';
    paymentForm.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  checkoutItems.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="checkout-item">
        <span>${item.name} × ${item.quantity}</span>
        <strong>${formatPrice(itemTotal)}</strong>
      </div>
    `;
  }).join('');

  checkoutTotal.textContent = formatPrice(subtotal);
}

function loadSavedUserData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    if (!savedData) return;

    Object.entries(savedData).forEach(([key, value]) => {
      const input = paymentForm.querySelector(`[name="${key}"]`);
      if (input) input.value = value;
    });

    if (savedData.metodoPago) {
      const radio = paymentForm.querySelector(`input[name="metodoPago"][value="${savedData.metodoPago}"]`);
      if (radio) radio.checked = true;
    }

    togglePaymentPanels();
  } catch (error) {
    return;
  }
}

function togglePaymentPanels() {
  const selectedMethod = paymentForm.querySelector('input[name="metodoPago"]:checked')?.value || 'Tarjeta de crédito';

  paymentPanels.forEach(panel => {
    const isActive = panel.dataset.paymentPanel === selectedMethod;
    panel.classList.toggle('active', isActive);
  });
}

paymentRadios.forEach(radio => {
  radio.addEventListener('change', togglePaymentPanels);
});

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const cart = getCart();
  if (!cart.length) return;

  const formData = Object.fromEntries(new FormData(paymentForm).entries());
  if (guardarDatosCheckbox.checked) {
    const { nombre, correo, telefono, direccion, metodoPago } = formData;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ nombre, correo, telefono, direccion, metodoPago }));
  }

  const order = {
    id: `SF-${Date.now().toString().slice(-6)}`,
    customer: formData.nombre,
    product: cart.map(item => `${item.name} × ${item.quantity}`).join(', '),
    value: cart.reduce((total, item) => total + item.price * item.quantity, 0),
    status: 'Por confirmar',
    metodoPago: formData.metodoPago,
    createdAt: new Date().toISOString(),
  };
  let orders = [];
  try {
    const savedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
    orders = Array.isArray(savedOrders) ? savedOrders : [];
  } catch (error) {
    orders = [];
  }
  orders.push(order);
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  localStorage.removeItem(CART_STORAGE_KEY);

  successMessage.textContent = `¡Pedido ${order.id} confirmado! Ya aparece en Ventas y pedidos.`;
  successMessage.hidden = false;
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderSummary();
});

renderSummary();
loadSavedUserData();
