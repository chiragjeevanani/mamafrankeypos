import { jsPDF } from 'jspdf';

/**
 * Directly downloads the KOT as a PDF file using jsPDF.
 */
export const printKOTReceipt = (orderData, tableInfo) => {
  // Extract items from orderData (direct items or latest KOT items)
  const items = orderData.items || (orderData.kots?.[orderData.kots.length - 1]?.items) || [];
  const latestKot = orderData.kots?.[orderData.kots.length - 1];
  const kotNumber = latestKot?.id || Math.floor(100 + Math.random() * 900);
  const orderType = latestKot?.orderType || tableInfo?.orderType || 'Dine In';
  const billerName = latestKot?.waiter?.name || tableInfo?.billerName || 'Biller';

  if (items.length === 0) return;

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150] // receipt width x height
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const tableNo = tableInfo.name;

  // Header Section - Centered (Matching image)
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text('FRANKY ROLL STATION', 40, 12, { align: 'center' });
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`${dateStr} ${timeStr}`, 40, 17, { align: 'center' });
  doc.text(`KOT - ${kotNumber}`, 40, 22, { align: 'center' });
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(orderType.toUpperCase(), 40, 27, { align: 'center' });

  // Helper for Drawing Dashed Lines
  const drawDashedLine = (yPos) => {
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(5, yPos, 75, yPos);
    doc.setLineDashPattern([], 0); // reset
  };

  // Separator 1
  drawDashedLine(30);

  // Biller Info
  doc.setFont('courier', 'normal');
  doc.setFontSize(11);
  doc.text(`Biller: ${billerName}`, 5, 35);
  
  // Separator 2
  drawDashedLine(38);

  // Column Headers
  doc.setFontSize(10);
  doc.text('Item', 5, 43);
  doc.text('Qty.', 75, 43, { align: 'right' });

  // Items List
  let y = 50;
  items.forEach(item => {
    doc.setFont('courier', 'bold');
    const splitName = doc.splitTextToSize(item.name, 60);
    doc.text(splitName, 5, y);
    
    doc.setFont('courier', 'normal');
    doc.text(`${item.quantity}`, 75, y, { align: 'right' });
    
    y += (splitName.length * 5);
    
    if (y > 130) {
      doc.addPage();
      y = 10;
    }
  });

  // Footer Totals
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  
  // Separator 3
  drawDashedLine(y);
  y += 6;
  
  doc.setFontSize(11);
  doc.text(`${totalQty}`, 75, y, { align: 'right' });
  y += 4;
  
  // Separator 4
  drawDashedLine(y);

  // Direct Download
  doc.save(`KOT_${tableNo || 'ORD'}_${now.getTime()}.pdf`);
};
