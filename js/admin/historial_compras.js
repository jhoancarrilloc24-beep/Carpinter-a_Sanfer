
// =========================================
// Historial de compras - lógica del módulo
// =========================================

const ordersTableBody = document.querySelector('#ordersTableBody');
const orderSearch = document.querySelector('#orderSearch');
const statusFilter = document.querySelector('#statusFilter');
const totalCompras = document.querySelector('#totalCompras');
const ventasTotales = document.querySelector('#ventasTotales');
const enviosPendientes = document.querySelector('#enviosPendientes');
const ordersEmpty = document.querySelector('#ordersEmpty');

const ORDERS_STORAGE_KEY = 'sanfer.orders';

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

// =========================================
// Funciones de render y filtros
// =========================================
function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function getStatusKey(status) {
  const normalizedStatus = String(status || '').trim().toLocaleLowerCase('es');
  if (normalizedStatus === 'entregado') return 'entregado';
  if (normalizedStatus === 'enviado' || normalizedStatus === 'listo para entrega') return 'enviado';
  return 'pendiente';
}

function getStatusClass(status) {
  const classMap = {
    pendiente: 'pending',
    enviado: 'shipped',
    entregado: 'delivered'
  };

  return classMap[status] || 'pending';
}

function renderSalesSummary(filteredPurchases) {
  totalCompras.textContent = String(filteredPurchases.length);

  const totalVentas = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  ventasTotales.textContent = formatPrice(totalVentas);

  const pendientes = filteredPurchases.filter(item => item.estado === 'pendiente').length;
  enviosPendientes.textContent = String(pendientes);
}

function renderOrders() {
  const query = orderSearch.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredPurchases = readOrders().map(order => ({
    id: order.id || '—',
    tipo: order.type === 'pedido' ? 'Pedido' : 'Venta',
    fecha: order.createdAt || order.fecha,
    cliente: order.customer || order.cliente || '—',
    productos: Array.isArray(order.items)
      ? order.items.map(item => `${item.name || item.nombre || 'Producto'} × ${Number(item.quantity) || 1}`)
      : Array.isArray(order.productos)
        ? order.productos
        : [order.product || order.producto || '—'],
    total: Number(order.value ?? order.total) || 0,
    metodo: order.metodoPago || order.metodo || '—',
    estado: getStatusKey(order.status || order.estado),
    estadoLabel: order.status || order.estado || 'Por confirmar',
    direccion: order.direccion || '—'
  })).filter(purchase => {
    const matchesStatus = selectedStatus === 'all' || purchase.estado === selectedStatus;
    const searchableText = `${purchase.id} ${purchase.tipo} ${purchase.cliente} ${purchase.productos.join(' ')}`.toLowerCase();
    const matchesSearch = searchableText.includes(query);
    return matchesStatus && matchesSearch;
  });

  if (!filteredPurchases.length) {
    ordersTableBody.replaceChildren();
    ordersEmpty.hidden = false;
    renderSalesSummary([]);
    return;
  }

  ordersEmpty.hidden = true;
  renderSalesSummary(filteredPurchases);

  ordersTableBody.replaceChildren();
  filteredPurchases.forEach(purchase => {
    const row = document.createElement('tr');
    const date = purchase.fecha ? new Date(purchase.fecha) : null;
    const dateLabel = date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
      : '—';
    [dateLabel, purchase.id, purchase.tipo, purchase.cliente, purchase.productos.join(', '), formatPrice(purchase.total), purchase.metodo]
      .forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = `module-badge ${getStatusClass(purchase.estado)}`;
    status.textContent = purchase.estadoLabel;
    statusCell.append(status);
    const addressCell = document.createElement('td');
    addressCell.textContent = purchase.direccion;
    row.append(statusCell, addressCell);
    ordersTableBody.append(row);
  });
}

// =========================================
// Eventos de búsqueda y filtros
// =========================================
orderSearch.addEventListener('input', renderOrders);
statusFilter.addEventListener('change', renderOrders);
window.addEventListener('storage', event => {
  if (event.key === ORDERS_STORAGE_KEY) renderOrders();
});

renderOrders();
