// src/services/reportGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera el reporte PDF de fiscalización vial VIGIL-AE.
 * 
 * @param {Object|null} statsData - Datos del endpoint /api/stats (opcional)
 * @param {Array} multasData - Lista de multas/actas registradas en Arbitrum Sepolia (opcional)
 * @param {string} panoramaIA - Párrafo de diagnóstico/panorama redactado por el Copiloto IA (opcional)
 */
export const generatePdfReport = async (statsData = null, multasData = [], panoramaIA = '') => {
  let stats = statsData || {};
  let registros = Array.isArray(multasData) && multasData.length > 0 ? multasData : [];

  // Petición de resguardo al backend FastAPI en caso de no recibir parámetros
  if (!statsData || Object.keys(stats).length === 0 || registros.length === 0) {
    try {
      const [resStats, resExp] = await Promise.all([
        fetch('http://localhost:8000/api/stats'),
        fetch('http://localhost:8000/api/expedientes')
      ]);

      if (resStats.ok && !statsData) {
        stats = await resStats.json();
      }
      if (resExp.ok && registros.length === 0) {
        registros = await resExp.json();
      }
    } catch (err) {
      console.error("Error al sincronizar datos para el PDF:", err);
    }
  }

  // Fallback a registros_multas dentro del objeto stats
  if (registros.length === 0 && Array.isArray(stats.registros_multas)) {
    registros = stats.registros_multas;
  }

  const now = new Date().toLocaleString('es-PE');
  const doc = new jsPDF();

  // ----------------------------------------------------
  // ENCABEZADO PRINCIPAL
  // ----------------------------------------------------
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 38, 'F');
  
  doc.setTextColor(56, 189, 248); // Cyan 400
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VIGIL-AE PROTOCOL', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema Inteligente de Fiscalización & Oráculo Web3 (Arbitrum Sepolia)', 14, 26);
  doc.text(`Fecha/Hora: ${now}`, 120, 26);

  let currentY = 46;

  // ----------------------------------------------------
  // 1. PÁRRAFO DE DIAGNÓSTICO DEL COPILOTO IA
  // ----------------------------------------------------
  if (panoramaIA && panoramaIA.trim() !== '') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Panorama Operativo & Diagnóstico IA', 14, currentY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    // Ajuste dinámico de líneas para el texto del chatbot dentro de los márgenes
    const splitText = doc.splitTextToSize(panoramaIA, 182);
    doc.text(splitText, 14, currentY + 6);

    currentY += 10 + (splitText.length * 4.2);
  }

  // ----------------------------------------------------
  // 2. ESTADÍSTICAS DEL SISTEMA (/api/stats)
  // ----------------------------------------------------
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const numSecStats = panoramaIA ? '2' : '1';
  doc.text(`${numSecStats}. Métricas Operativas de Tráfico`, 14, currentY);

  const totalActas = registros.length;
  const totalVehiculos = Math.max(
    stats.conteo_total || 0,
    totalActas,
    (stats.autos || 0) + (stats.camiones || 0) + (stats.motos || 0) + (stats.buses || 0)
  );

  const statsTableData = [
    ['Tiempo de Monitoreo Activo', `${stats.tiempo_monitoreo || 0} min`],
    ['Tiempo Calzada/Berma Obstruida', `${stats.tiempo_total_obstruido || 0} min`],
    ['Flujo Vehicular Total Registrado', `${totalVehiculos} unidades`],
    ['Saturación de Berma Portuaria', `${stats.saturacion_berma || 0}%`],
    ['Pérdida de Capacidad Vial', `${stats.perdida_capacidad || 0}%`],
    ['Desglose por Tipo (Autos / Camiones / Motos / Buses)', `${stats.autos || 0} / ${stats.camiones || 0} / ${stats.motos || 0} / ${stats.buses || 0}`]
  ];

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Indicador de Control', 'Valor Actual']],
    body: statsTableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 8.5 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // ----------------------------------------------------
  // 3. TABLA DE MULTAS EN ARBITRUM SEPOLIA
  // ----------------------------------------------------
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const numSecTable = panoramaIA ? '3' : '2';
  doc.text(`${numSecTable}. Infracciones Registradas en Arbitrum Sepolia`, 14, currentY);

  const tableRows = registros.length > 0 
    ? registros.map((m) => {
        const txHash = m.hash || m.txHash || '0x000...';
        const txCorto = txHash.startsWith('0x') && txHash.length > 14 
          ? `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 4)}` 
          : txHash;

        return [
          m.actaId || m.id || 'N/A',
          m.hora || '--:--:--',
          m.placa || 'NO DETECTADA',
          m.infraccion || m.tipoInfraccion || 'Zona Rígida',
          m.vehiculo || 'Auto',
          m.estado || 'REGISTRADA',
          txCorto
        ];
      })
    : [['--', '--:--:--', 'SIN INFRACCIONES', '--', '--', '--', 'N/A']];

  autoTable(doc, {
    startY: currentY + 4,
    head: [['ID Acta', 'Hora', 'Placa', 'Infracción', 'Vehículo', 'Estado', 'Tx Hash Sepolia']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8, font: 'courier' }
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento generado por VIGIL-AE Protocol - Registro Inmutable de Fiscalización Web3', 14, pageHeight - 8);

  doc.save(`VIGIL-AE_Reporte_Sepolia_${Date.now()}.pdf`);
};