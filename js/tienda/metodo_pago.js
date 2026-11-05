
// SECCIÓN: LÓGICA GENERAL
// =========================================
const CART_STORAGE_KEY = 'sanferCarrito';
const USER_STORAGE_KEY = 'sanferEnvioData';
const ORDER_STORAGE_KEY = 'sanfer.orders';
const PRODUCTS_STORAGE_KEY = 'sanfer.products';
const PRODUCT_HISTORY_STORAGE_KEY = 'sanfer.productHistory';
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

function getStoredArray(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCheckoutData(values) {
  const keys = [ORDER_STORAGE_KEY, PRODUCTS_STORAGE_KEY, PRODUCT_HISTORY_STORAGE_KEY];
  const previousValues = new Map(keys.map(key => [key, localStorage.getItem(key)]));
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(values.orders));
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(values.products));
    localStorage.setItem(PRODUCT_HISTORY_STORAGE_KEY, JSON.stringify(values.history));
  } catch {
    keys.forEach(key => {
      try {
        const previousValue = previousValues.get(key);
        if (previousValue === null) localStorage.removeItem(key);
        else localStorage.setItem(key, previousValue);
      } catch {
        // The original save error is reported to the customer below.
      }
    });
    return false;
  }
  return true;
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
  const products = getStoredArray(PRODUCTS_STORAGE_KEY);
  const history = getStoredArray(PRODUCT_HISTORY_STORAGE_KEY);
  const items = [];
  const saleMovements = [];

  for (const cartItem of cart) {
    const quantity = Math.max(1, Number(cartItem.quantity) || 1);
    const productIndex = products.findIndex(product => cartItem.sku
      ? product.sku === cartItem.sku
      : product.nombre?.trim().toLocaleLowerCase('es') === String(cartItem.name || '').trim().toLocaleLowerCase('es'));
    const product = productIndex >= 0 ? products[productIndex] : null;

    if (cartItem.sku && !product) {
      successMessage.textContent = `El producto "${cartItem.name}" ya no está disponible en el inventario. Actualiza el carrito e inténtalo de nuevo.`;
      successMessage.hidden = false;
      return;
    }

    const availableQuantity = product ? Number(product.cantidad) || 0 : null;
    if (product && availableQuantity < quantity) {
      successMessage.textContent = `Existencias insuficientes para "${product.nombre}". Disponibles: ${availableQuantity} ${product.unidad || 'unidades'}.`;
      successMessage.hidden = false;
      return;
    }

    const item = {
      sku: product?.sku || cartItem.sku || '',
      name: product?.nombre || cartItem.name,
      category: product?.categoria || cartItem.category || '',
      quantity,
      price: Number(cartItem.price) || 0,
      unit: product?.unidad || ''
    };
    items.push(item);

    const previousQuantity = availableQuantity;
    if (product) product.cantidad = previousQuantity - quantity;
    saleMovements.push({
      tipo: 'venta',
      fecha: new Date().toISOString(),
      orderId: '',
      sku: item.sku || undefined,
      nombre: item.name,
      categoria: item.category,
      cantidad: quantity,
      unidad: item.unit,
      precio: item.price,
      total: item.price * quantity,
      stockAnterior: previousQuantity,
      stockNuevo: product ? product.cantidad : null,
      cliente: formData.nombre
    });
  }

  const order = {
    id: `SF-${Date.now().toString().slice(-6)}`,
    customer: formData.nombre,
    correo: formData.correo,
    telefono: formData.telefono,
    direccion: formData.direccion,
    product: items.map(item => `${item.name} × ${item.quantity}`).join(', '),
    items,
    value: items.reduce((total, item) => total + item.price * item.quantity, 0),
    status: 'Por confirmar',
    type: 'venta',
    metodoPago: formData.metodoPago,
    createdAt: new Date().toISOString(),
  };
  saleMovements.forEach(movement => {
    movement.orderId = order.id;
    history.push(movement);
  });
  const orders = getStoredArray(ORDER_STORAGE_KEY);
  orders.push(order);

  if (!saveCheckoutData({ orders, products, history })) {
    successMessage.textContent = 'No se pudo guardar la compra. Libera espacio del navegador e inténtalo de nuevo.';
    successMessage.hidden = false;
    return;
  }

  if (guardarDatosCheckbox.checked) {
    const { nombre, correo, telefono, direccion, metodoPago } = formData;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ nombre, correo, telefono, direccion, metodoPago }));
    } catch {
      successMessage.textContent = 'La compra se guardó, pero no se pudieron guardar tus datos para futuras compras.';
      successMessage.hidden = false;
      localStorage.removeItem(CART_STORAGE_KEY);
      renderSummary();
      return;
    }
  }

  localStorage.removeItem(CART_STORAGE_KEY);

  successMessage.textContent = `¡Pedido ${order.id} confirmado! Ya aparece en Ventas y pedidos.`;
  successMessage.hidden = false;
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderSummary();
});

renderSummary();
loadSavedUserData();
