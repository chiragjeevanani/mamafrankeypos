import { jsPDF } from 'jspdf';

/**
 * Generates a combined PDF containing both Bill and KOT.
 * Page 1: Bill
 * Page 2: KOT
 */
export const downloadBillAndKOT = (orderData, tableInfo, billingDetails) => {
  const { kots, waiter, customer, cart } = orderData;
  const allItems = [
    ...(kots || []).flatMap(kot => kot.items),
    ...(cart || [])
  ];
  
  if (allItems.length === 0) return;

  // 1. Initialize doc
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 250] // receipt width x estimated height
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); 
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const cashierName = waiter?.name || billingDetails?.billerName || 'Biller';
  const billNo = Math.floor(200000 + Math.random() * 90000);
  const tokenNo = Math.floor(100 + Math.random() * 900);
  const { subTotal, tax, discount, total, orderType } = billingDetails;

  // --- BILL SECTION (Page 1) ---
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('RETAIL INVOICE', 40, 8, { align: 'center' });
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text('MAMA CHICKEN MAMA', 40, 13, { align: 'center' });
  doc.text('FRANKY HOUSE', 40, 17, { align: 'center' });
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('(M/S TIME TO EAT)', 40, 21, { align: 'center' });
  doc.text('A - 17, Shopping Arcade, Sadar', 40, 25, { align: 'center' });
  doc.text('Bazar, Agra Cantt, U. P. - 282001', 40, 29, { align: 'center' });
  doc.text('Ph. No.. : +91 88991-99999', 40, 33, { align: 'center' });
  doc.text('GSTIN : 09AAFFT9378RIZW', 40, 37, { align: 'center' });
  doc.text('FSSAI NO. : 12715001000797', 40, 41, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(5, 43, 75, 43);
  doc.line(5, 44, 75, 44);

  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text(`Date: ${dateStr}`, 5, 49);
  doc.setFont('courier', 'bold');
  doc.text(orderType?.toUpperCase() || 'PICKUP', 75, 49, { align: 'right' });
  
  doc.setFont('courier', 'normal');
  doc.text(`${timeStr}`, 5, 53);
  doc.text(`Cashier: ${cashierName.split(' ')[0]}`, 5, 57);
  doc.text(`Bill No.: ${billNo}`, 45, 57);
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(`Token No.: ${tokenNo}`, 5, 62);

  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setLineWidth(0.2);
  doc.line(5, 64, 75, 64);
  doc.text('No.Item', 5, 68);
  doc.text('Qty.', 45, 68, { align: 'right' });
  doc.text('Price', 60, 68, { align: 'right' });
  doc.text('Amount', 75, 68, { align: 'right' });
  doc.line(5, 70, 75, 70);

  let y = 74;
  allItems.forEach((item, index) => {
    doc.text(`${index + 1} `, 5, y);
    const splitName = doc.splitTextToSize(item.name, 35);
    doc.text(splitName, 8, y);
    doc.text(`${item.quantity}`, 45, y, { align: 'right' });
    doc.text(`${item.price.toFixed(2)}`, 60, y, { align: 'right' });
    doc.text(`${(item.price * item.quantity).toFixed(2)}`, 75, y, { align: 'right' });
    y += (splitName.length * 4.5);
  });

  doc.line(5, y, 75, y);
  y += 5;
  const totalQty = allItems.reduce((sum, i) => sum + i.quantity, 0);
  const gstEach = (tax / 2).toFixed(2);
  const calculatedGrandTotal = subTotal + Number(tax) - Number(discount);
  const finalWhole = Math.round(calculatedGrandTotal);
  const roundOff = (finalWhole - calculatedGrandTotal).toFixed(2);

  doc.text(`Total Qty: ${totalQty}`, 38, y, { align: 'right' });
  doc.text(`Sub`, 60, y, { align: 'center' });
  doc.text(`${subTotal.toFixed(2)}`, 75, y, { align: 'right' });
  y += 4;
  doc.text(`Total`, 60, y, { align: 'center' });
  y += 4;

  if (discount > 0) {
    doc.text('Disc:', 60, y, { align: 'right' });
    doc.text(`-${discount.toFixed(2)}`, 75, y, { align: 'right' });
    y += 4;
  }

  doc.text('SGST  2.5%:', 60, y, { align: 'right' });
  doc.text(`${gstEach}`, 75, y, { align: 'right' });
  y += 4;
  doc.text('CGST  2.5%:', 60, y, { align: 'right' });
  doc.text(`${gstEach}`, 75, y, { align: 'right' });
  y += 4;
  doc.line(5, y, 75, y);
  y += 5;
  doc.text('Round off', 60, y, { align: 'right' });
  doc.text(`${roundOff}`, 75, y, { align: 'right' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text('Grand Total', 30, y);
  doc.text(`₹ ${finalWhole}.00`, 75, y, { align: 'right' });
  y += 6;
  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.text('Thank You, Kindly Visit Again...!!', 40, y, { align: 'center' });

  // --- KOT SECTION (Page 2) ---
  doc.addPage([80, 150], 'portrait');
  
  const latestKot = orderData.kots?.[orderData.kots.length - 1];
  const kotNumber = latestKot?.id || Math.floor(100 + Math.random() * 900);
  const kotOrderType = orderType || 'Pickup';

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text('FRANKY ROLL STATION', 40, 12, { align: 'center' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`${dateStr} ${timeStr}`, 40, 17, { align: 'center' });
  doc.text(`KOT - ${kotNumber}`, 40, 22, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(kotOrderType.toUpperCase(), 40, 27, { align: 'center' });

  const drawDashedLine = (yPos) => {
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(5, yPos, 75, yPos);
    doc.setLineDashPattern([], 0);
  };

  drawDashedLine(30);
  doc.setFont('courier', 'normal');
  doc.setFontSize(11);
  doc.text(`Biller: ${cashierName}`, 5, 35);
  drawDashedLine(38);
  doc.setFontSize(10);
  doc.text('Item', 5, 43);
  doc.text('Qty.', 75, 43, { align: 'right' });

  let ky = 50;
  allItems.forEach(item => {
    doc.setFont('courier', 'bold');
    const splitName = doc.splitTextToSize(item.name, 60);
    doc.text(splitName, 5, ky);
    doc.setFont('courier', 'normal');
    doc.text(`${item.quantity}`, 75, ky, { align: 'right' });
    ky += (splitName.length * 5);
  });

  drawDashedLine(ky);
  ky += 6;
  doc.setFontSize(11);
  doc.text(`${totalQty}`, 75, ky, { align: 'right' });
  ky += 4;
  drawDashedLine(ky);

  // 3. Save combined PDF
  doc.save(`BILL_KOT_${tableInfo.name}_${now.getTime()}.pdf`);
};
