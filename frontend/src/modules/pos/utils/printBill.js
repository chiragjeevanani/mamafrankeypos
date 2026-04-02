import { jsPDF } from 'jspdf';

/**
 * Generates a proper finalized Bill PDF.
 */
export const printBillReceipt = (orderData, tableInfo, billingDetails) => {
  const { kots, waiter, customer, cart } = orderData;
  const allItems = [
    ...(kots || []).flatMap(kot => kot.items),
    ...(cart || [])
  ];
  
  if (allItems.length === 0) return;

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // receipt width x estimated height (will expand if needed)
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yy style
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const cashierName = waiter?.name || billingDetails?.billerName || 'Biller';
  const billNo = Math.floor(200000 + Math.random() * 90000);
  const tokenNo = Math.floor(100 + Math.random() * 900);
  const { subTotal, tax, discount, total, orderType } = billingDetails;

  // Header Section - Restaurant Info (Centered as per image)
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

  // Double Solid Divider
  doc.setLineWidth(0.5);
  doc.line(5, 43, 75, 43);
  doc.line(5, 44, 75, 44);

  // Bill Meta Info
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text(`Date: ${dateStr}`, 5, 49);
  doc.setFont('courier', 'bold');
  doc.text(orderType?.toUpperCase() || 'DINE IN', 75, 49, { align: 'right' });
  
  doc.setFont('courier', 'normal');
  doc.text(`${timeStr}`, 5, 53);
  doc.text(`Cashier: ${cashierName.split(' ')[0]}`, 5, 57);
  doc.text(`Bill No.: ${billNo}`, 45, 57);
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(`Token No.: ${tokenNo}`, 5, 62);

  // Table Headers
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setLineWidth(0.2);
  doc.line(5, 64, 75, 64);
  doc.text('No.Item', 5, 68);
  doc.text('Qty.', 45, 68, { align: 'right' });
  doc.text('Price', 60, 68, { align: 'right' });
  doc.text('Amount', 75, 68, { align: 'right' });
  doc.line(5, 70, 75, 70);

  // Items List
  let y = 74;
  allItems.forEach((item, index) => {
    doc.text(`${index + 1} `, 5, y);
    const splitName = doc.splitTextToSize(item.name, 35);
    doc.text(splitName, 8, y);
    
    // Position price section at the same Y as the first line of multi-line name
    doc.text(`${item.quantity}`, 45, y, { align: 'right' });
    doc.text(`${item.price.toFixed(2)}`, 60, y, { align: 'right' });
    doc.text(`${(item.price * item.quantity).toFixed(2)}`, 75, y, { align: 'right' });
    
    y += (splitName.length * 4.5);
    
    if (y > 180) {
      doc.addPage();
      y = 10;
    }
  });

  // Footer Totals (Start from current y)
  doc.line(5, y, 75, y);
  y += 5;
  
  const totalQty = allItems.reduce((sum, i) => sum + i.quantity, 0);
  const gstEach = (tax / 2).toFixed(2);
  const calculatedGrandTotal = subTotal + Number(tax) - Number(discount);
  const finalWhole = Math.round(calculatedGrandTotal);
  const roundOff = (finalWhole - calculatedGrandTotal).toFixed(2);

  doc.text(`Total Qty: ${totalQty}`, 5, y);
  doc.text(`Sub Total`, 40, y);
  doc.text(`${subTotal.toFixed(2)}`, 75, y, { align: 'right' });
  y += 4;

  if (discount > 0) {
    doc.text('Discount:', 40, y);
    doc.text(`-${discount.toFixed(2)}`, 75, y, { align: 'right' });
    y += 4;
  }

  doc.text('SGST 2.5%:', 40, y);
  doc.text(`${gstEach}`, 75, y, { align: 'right' });
  y += 4;
  doc.text('CGST 2.5%:', 40, y);
  doc.text(`${gstEach}`, 75, y, { align: 'right' });
  y += 4;
  
  doc.setLineWidth(0.2);
  doc.line(40, y - 0.5, 75, y - 0.5);
  doc.line(40, y + 0.5, 75, y + 0.5);
  y += 4;
  
  doc.text('Round off', 40, y);
  doc.text(`${roundOff}`, 75, y, { align: 'right' });
  y += 6;
  
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text('GRAND TOTAL', 5, y);
  doc.text(`Rs. ${finalWhole}.00`, 75, y, { align: 'right' });
  
  y += 6;
  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.text('Thank You, Kindly Visit Again...!!', 40, y, { align: 'center' });

  // Direct Download
  doc.save(`Bill_${tableInfo.name}_${new Date().getTime()}.pdf`);
};
