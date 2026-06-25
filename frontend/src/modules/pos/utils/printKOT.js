import { jsPDF } from 'jspdf';

/**
 * Directly downloads the KOT as a PDF file using jsPDF.
 */
export const printKOTReceipt = (orderData, tableInfo, isReprint = false) => {
  // Extract items from orderData (direct items or latest KOT items) and filter out cancelled items
  const rawItems = orderData.items || (orderData.kots?.[orderData.kots.length - 1]?.items) || [];
  const items = rawItems.filter(item => item.status !== 'cancelled');
  
  if (items.length === 0) return;

  const latestKot = orderData.kots?.[orderData.kots.length - 1];
  const kotNumber = latestKot?.kotNumber || ((latestKot?._id || latestKot?.id)
    ? `${orderData.kots.length}-${String(latestKot._id || latestKot.id).slice(-4).toUpperCase()}`
    : Math.floor(100 + Math.random() * 900));
  const orderType = latestKot?.orderType || tableInfo?.orderType || 'Dine In';
  const billerName = tableInfo?.billerName || latestKot?.waiter?.name || 'Biller';
  const waiterName = tableInfo?.waiterName || latestKot?.waiter?.name || '';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const tableNo = tableInfo.name;

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150] // receipt width x height
  });

  if (isReprint) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text('*** REPRINTED ***', 40, 7, { align: 'center' });
  }

  // Header Section - Centered
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text('FRANKY ROLL STATION', 40, 12, { align: 'center' });
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`${dateStr} ${timeStr}`, 40, 17, { align: 'center' });
  doc.text(`KOT - ${kotNumber}`, 40, 22, { align: 'center' });
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  const displayOrderType = orderType.toLowerCase() === 'car-service' ? 'CAR SERVICE' : orderType.toUpperCase();
  doc.text(displayOrderType, 40, 27, { align: 'center' });

  // Helper for Drawing Dashed Lines
  const drawDashedLine = (yPos) => {
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(5, yPos, 75, yPos);
    doc.setLineDashPattern([], 0); // reset
  };

  // Separator 1
  drawDashedLine(30);

  // Biller / Car Info
  doc.setFont('courier', 'normal');
  doc.setFontSize(11);
  
  let headerShift = 0;
  if (orderType.toLowerCase() === 'car-service') {
    doc.text(`CAR NO: ${tableNo}`, 5, 35);
    doc.text(`WAITER: ${waiterName || 'Staff'}`, 5, 41);
    doc.text(`CASHIER: ${billerName}`, 5, 47);
    drawDashedLine(50);
    headerShift = 12;
  } else {
    doc.text(`WAITER: ${waiterName || 'Staff'}`, 5, 35);
    doc.text(`CASHIER: ${billerName}`, 5, 41);
    drawDashedLine(44);
    headerShift = 6;
  }

  // Column Headers
  doc.setFontSize(10);
  doc.text('Item', 5, 43 + headerShift);
  doc.text('Qty.', 75, 43 + headerShift, { align: 'right' });

  // Items List
  let y = 50 + headerShift;
  items.forEach(item => {
    doc.setFont('courier', 'bold');
    const splitName = doc.splitTextToSize(item.name, 60);
    doc.text(splitName, 5, y);
    
    doc.setFont('courier', 'normal');
    doc.text(`${item.quantity}`, 75, y, { align: 'right' });
    
    y += (splitName.length * 5);

    // Print Variants if exist
    if (item.variantLabel) {
       doc.setFont('courier', 'normal');
       doc.setFontSize(8);
       const splitVariants = doc.splitTextToSize(`(${item.variantLabel})`, 60);
       doc.text(splitVariants, 7, y - 1);
       y += (splitVariants.length * 4);
       doc.setFontSize(10);
    }
    
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
  doc.text(`Total Qty: ${totalQty}`, 75, y, { align: 'right' });
  y += 4;
  
  // Separator 4
  drawDashedLine(y);

  // Direct Download
  doc.save(`KOT_${tableNo || 'ORD'}_${now.getTime()}.pdf`);
};
