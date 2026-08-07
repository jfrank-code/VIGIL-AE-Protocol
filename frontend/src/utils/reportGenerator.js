import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera el reporte PDF con datos reales provenientes de /api/stats
 * @param {Object} stats - Objeto retornado por el backend FastAPI (/api/stats)
 * @param {string} searchPlate - Filtro de placa opcional
 */
export const generatePdfReport = (stats = {}, searchPlate = '') => {
  const doc = new jsPDF();
  const now = new Date().toLocaleString('es-PE');

  // Extraer datos reales del objeto stats con valores por defecto
  const totalVehiculos = stats.conteo_total ?? 0;
  const registrosMultas = stats.registros_multas || [];
  const totalInfracciones = registrosMultas.length;
  const saturacionBerma = stats.saturacion_berma ?? 0.0;
  const tiempoMonitoreo = stats.tiempo_monitoreo ?? 0.0;

  // Encabezado
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(56, 189, 248); // Cyan
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VIGIL-AE PROTOCOL', 14, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Oficial de Fiscalización Vial & Auditoría IA', 14, 28);
  doc.text(`Fecha de Emisión: ${now}`, 120, 28);

  // 1. Resumen Ejecutivo (Métricas Reales)
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Métricas Consolidadas de la Sesión', 14, 50);

  const metricsData = [
    ['Tiempo Total Monitoreado', `${tiempoMonitoreo} min`],
    ['Total Vehículos Flujo Detectado', `${totalVehiculos} unidades`],
    ['Infracciones Confirmadas (>5s)', `${totalInfracciones} emitidas`],
    ['Saturación de Berma / Vía', `${saturacionBerma}%`],
    ['Autos / Camiones / Motos / Buses', `${stats.autos || 0} / ${stats.camiones || 0} / ${stats.motos || 0} / ${stats.buses || 0}`]
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Indicador de Control (En Tiempo Real)', 'Valor Registrado']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
  });

  // 2. Registros de Infracciones Reales
  const currentY = doc.lastAutoTable.finalY + 12;
  doc.text('2. Registro Detallado de Placas Fiscalizadas', 14, currentY);

  // Filtrar si el usuario buscó una placa en la UI
  const multasFiltradas = searchPlate 
    ? registrosMultas.filter(m => m.placa.toLowerCase().includes(searchPlate.toLowerCase()))
    : registrosMultas;

  // Formatear filas de la tabla con los datos del backend
  const platesData = multasFiltradas.length > 0 
    ? multasFiltradas.map((m, index) => [
        `ACTA-2026-${(index + 1).toString().padStart(3, '0')}`,
        m.hora || '--:--:--',
        m.placa || 'NO DETECTADA',
        m.vehiculo || 'Auto',
        m.origen || 'Nodo General',
        'CONFIRMADA'
      ])
    : [['--', '--:--:--', 'SIN INFRACCIONES', '--', '--', 'SIN REGISTROS']];

  autoTable(doc, {
    startY: currentY + 5,
    head: [['ID Acta', 'Hora', 'Placa Fiscalizada', 'Vehículo', 'Ubicación', 'Estado']],
    body: platesData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Documento generado automáticamente por VIGIL-AE Protocol - Registro Inmutable de Fiscalización', 14, pageHeight - 10);

  // Descargar archivo PDF
  doc.save(`VIGIL-AE_Reporte_${Date.now()}.pdf`);
};