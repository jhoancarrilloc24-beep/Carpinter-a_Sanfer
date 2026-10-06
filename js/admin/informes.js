
// SECCIÓN: LÓGICA GENERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportReport');
    const message = document.getElementById('reportMessage');
    const reportTable = document.getElementById('reportTable');

    exportButton.addEventListener('click', () => {
        const rows = [...reportTable.querySelectorAll('tr')].map((row) =>
            [...row.children].map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(',')
        );
        const csv = `\uFEFF${rows.join('\r\n')}`;
        const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'informe-inventario-sanfer.csv';
        downloadLink.click();
        URL.revokeObjectURL(url);
        message.textContent = 'Informe descargado en formato CSV.';
    });
});
