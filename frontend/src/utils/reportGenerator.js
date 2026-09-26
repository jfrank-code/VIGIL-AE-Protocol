// src/services/reportGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../config/apiConfig';

/**
 * Generates the VIGIL-AE road enforcement PDF report.
 *
 * @param {Object|null} statsData - Data from the /api/stats endpoint (optional)
 * @param {Array} multasData - List of infraction cases registered on Arbitrum Sepolia (optional)
 * @param {string} panoramaIA - Diagnostic/overview paragraph written by the AI Copilot (optional)
 */
export const generatePdfReport = async (statsData = null, multasData = [], panoramaIA = '') => {
  let stats = statsData || {};
  let registros = Array.isArray(multasData) && multasData.length > 0 ? multasData : [];

  // Fallback request to the FastAPI backend in case no parameters were passed in
  if (!statsData || Object.keys(stats).length === 0 || registros.length === 0) {
    try {
      const [resStats, resExp] = await Promise.all([
        fetch(`${API_URL}/api/stats`),
        fetch(`${API_URL}/api/expedientes`)
      ]);

      if (resStats.ok && !statsData) {
        stats = await resStats.json();
      }
      if (resExp.ok && registros.length === 0) {
        registros = await resExp.json();
      }
    } catch (err) {
      console.error("Error syncing data for the PDF:", err);
    }
  }

  // Fallback to registros_multas inside the stats object
  if (registros.length === 0 && Array.isArray(stats.registros_multas)) {
    registros = stats.registros_multas;
  }

  const now = new Date().toLocaleString('es-PE');
  const doc = new jsPDF();

  // ----------------------------------------------------
  // MAIN HEADER
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
  doc.text('Smart Enforcement System & Web3 Oracle (Arbitrum Sepolia)', 14, 26);
  doc.text(`Date/Time: ${now}`, 120, 26);

  let currentY = 46;

  // ----------------------------------------------------
  // 1. AI COPILOT DIAGNOSTIC PARAGRAPH
  // ----------------------------------------------------
  if (panoramaIA && panoramaIA.trim() !== '') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Operational Overview & AI Diagnostics', 14, currentY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    // Dynamic line wrapping for the chatbot text within the page margins
    const splitText = doc.splitTextToSize(panoramaIA, 182);
    doc.text(splitText, 14, currentY + 6);

    currentY += 10 + (splitText.length * 4.2);
  }

  // ----------------------------------------------------
  // 2. SYSTEM STATISTICS (/api/stats)
  // ----------------------------------------------------
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const numSecStats = panoramaIA ? '2' : '1';
  doc.text(`${numSecStats}. Traffic Operations Metrics`, 14, currentY);

  const totalActas = registros.length;
  const totalVehiculos = Math.max(
    stats.conteo_total || 0,
    totalActas,
    (stats.autos || 0) + (stats.camiones || 0) + (stats.motos || 0) + (stats.buses || 0)
  );

  const statsTableData = [
    ['Active Monitoring Time', `${stats.tiempo_monitoreo || 0} min`],
    ['Roadway/Shoulder Obstruction Time', `${stats.tiempo_total_obstruido || 0} min`],
    ['Total Vehicle Flow Recorded', `${totalVehiculos} units`],
    ['Port Shoulder Saturation', `${stats.saturacion_berma || 0}%`],
    ['Road Capacity Loss', `${stats.perdida_capacidad || 0}%`],
    ['Breakdown by Type (Cars / Trucks / Motorcycles / Buses)', `${stats.autos || 0} / ${stats.camiones || 0} / ${stats.motos || 0} / ${stats.buses || 0}`]
  ];

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Control Indicator', 'Current Value']],
    body: statsTableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 8.5 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // ----------------------------------------------------
  // 3. INFRACTION TABLE ON ARBITRUM SEPOLIA
  // ----------------------------------------------------
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const numSecTable = panoramaIA ? '3' : '2';
  doc.text(`${numSecTable}. Infractions Registered on Arbitrum Sepolia`, 14, currentY);

  // Never fabricate a placeholder tx hash: a case with no confirmed
  // on-chain hash yet is shown as "Pending", not as a fake-looking 0x000...
  const tableRows = registros.length > 0 
    ? registros.map((m) => {
        const txHash = m.hash || m.txHash || '';
        const txCorto = txHash && txHash.startsWith('0x') && txHash.length > 14 
          ? `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 4)}` 
          : (txHash || 'Pending');

        return [
          m.actaId || m.id || 'N/A',
          m.hora || '--:--:--',
          m.placa || 'NOT DETECTED',
          m.infraccion || m.tipoInfraccion || 'Restricted Zone',
          m.vehiculo || 'Auto',
          m.estado || 'REGISTRADA',
          txCorto
        ];
      })
    : [['--', '--:--:--', 'NO INFRACTIONS', '--', '--', '--', 'N/A']];

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Case ID', 'Time', 'Plate', 'Infraction', 'Vehicle', 'Status', 'Sepolia Tx Hash']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8, font: 'courier' }
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Document generated by VIGIL-AE Protocol - Immutable Web3 Enforcement Record', 14, pageHeight - 8);

  doc.save(`VIGIL-AE_Report_Sepolia_${Date.now()}.pdf`);
};