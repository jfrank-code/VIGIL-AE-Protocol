import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfReport = (searchPlate = '') => {
  const doc = new jsPDF();
  const now = new Date().toLocaleString('es-PE');

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
  doc.text(`Fecha de Emisión: ${now}`, 130, 28);

  // Resumen Ejecutivo
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Métricas Consolidadas de la Sesión', 14, 50);

  const metricsData = [
    ['Total Vehículos Monitoreados', '128 unidades'],
    ['Vehículos Mal Estacionados Detectados', '12 infracciones'],
    ['Nivel de Capacidad Vial Bloqueada', '38.5%'],
    ['Registros Confirmados en Arbitrum', '12 Hashes SHA-256'],
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Indicador de Control', 'Valor Registrado']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillStyle: [30, 58, 138] },
  });

  // Lista de Placas Objetivo
  const currentY = doc.lastAutoTable.finalY + 12;
  doc.text('2. Registro Detallado de Placas Detectadas', 14, currentY);

  const platesData = [
    ['ACTA-2026-001', 'P3A-891', 'Zona Rígida (Nodo 01)', 'EMITIDA', '0x8f2a...3e1b'],
    ['ACTA-2026-002', 'B7X-102', 'Berma Sur (Nodo 01)', 'ANULADA', '0x4c9e...9a2f'],
    ['ACTA-2026-003', 'F9K-441', 'Obstrucción Ciclovía (Nodo 02)', 'PAGADA', '0x1b7d...8a4c'],
  ];

  autoTable(doc, {
    startY: currentY + 5,
    head: [['ID Acta', 'Placa', 'Tipo Infracción', 'Estado', 'Hash Blockchain']],
    body: platesData,
    theme: 'grid',
    headStyles: { fillStyle: [15, 23, 42] },
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Documento generado automáticamente por VIGIL-AE Protocol - Registro Inmutable Arbitrum Sepolia', 14, pageHeight - 10);

  // Descargar archivo PDF
  doc.save(`VIGIL-AE_Reporte_${Date.now()}.pdf`);
};