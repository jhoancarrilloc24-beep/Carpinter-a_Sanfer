
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

const compras = [];

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

function getStatusLabel(status) {
  const statusMap = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    entregado: 'Entregado'
  };

  return statusMap[status] || status;
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

  const filteredPurchases = compras.filter(purchase => {
    const matchesStatus = selectedStatus === 'all' || purchase.estado === selectedStatus;
    const searchableText = `${purchase.id} ${purchase.cliente} ${purchase.productos.join(' ')}`.toLowerCase();
    const matchesSearch = searchableText.includes(query);
    return matchesStatus && matchesSearch;
  });

  if (!filteredPurchases.length) {
    ordersTableBody.innerHTML = '';
    ordersEmpty.hidden = false;
    renderSalesSummary([]);
    return;
  }

  ordersEmpty.hidden = true;
  renderSalesSummary(filteredPurchases);

  ordersTableBody.innerHTML = filteredPurchases.map(purchase => `
    <tr>
      <td><strong>${purchase.id}</strong></td>
      <td>${purchase.cliente}</td>
      <td>${purchase.productos.join('<br>')}</td>
      <td>${formatPrice(purchase.total)}</td>
      <td>${purchase.metodo}</td>
      <td><span class="module-badge ${getStatusClass(purchase.estado)}">${getStatusLabel(purchase.estado)}</span></td>
      <td>${purchase.direccion}</td>
    </tr>
  `).join('');
}

// =========================================
// Eventos de búsqueda y filtros
// =========================================
orderSearch.addEventListener('input', renderOrders);
statusFilter.addEventListener('change', renderOrders);

renderOrders();
