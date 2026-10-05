
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

// =========================================
// Datos de ejemplo para historial de compras
// =========================================
const compras = [
  {
    id: 'PED-1042',
    cliente: 'María Castaño',
    productos: ['Repisa Premium Gris x2', 'Soporte de madera x1'],
    total: 180000,
    metodo: 'Tarjeta de crédito',
    estado: 'pendiente',
    direccion: 'Calle 12 # 3-45, Cúcuta'
  },
  {
    id: 'PED-1048',
    cliente: 'Luis Ortega',
    productos: ['Set x3 repisas', 'Accesorios de montaje'],
    total: 260000,
    metodo: 'Nequi',
    estado: 'enviado',
    direccion: 'Av. 4 # 5-70, Los patios'
  },
  {
    id: 'PED-1053',
    cliente: 'Ana Salazar',
    productos: ['Repisa flotante blanca x1'],
    total: 80000,
    metodo: 'Efectivo',
    estado: 'entregado',
    direccion: 'Cra 6 # 10-22, Villa del Rosario'
  },
  {
    id: 'PED-1061',
    cliente: 'Daniel Rueda',
    productos: ['Mueble de madera x1', 'Kit de herrajes x2'],
    total: 312000,
    metodo: 'Tarjeta de crédito',
    estado: 'pendiente',
    direccion: 'Calle 9 # 14-34, Cúcuta'
  }
];

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
