import { jsPDF } from 'jspdf';

/**
 * Generates a proper finalized Bill PDF.
 */
export const printBillReceipt = (orderData, tableInfo, billingDetails, isReprint = false) => {
  const { kots, waiter, customer, cart } = orderData;
  const allItems = (kots && kots.length > 0)
    ? kots.flatMap(kot => (kot.items || []).filter(item => item.status !== 'cancelled'))
    : (cart || []);
  
  if (allItems.length === 0) return;

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // receipt width x estimated height (will expand if needed)
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yy style
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const cashierName = billingDetails?.billerName || 'Biller';
  const waiterName = waiter?.name || billingDetails?.waiterName || '';
  const billNo = orderData.orderNumber || billingDetails?.orderNumber || `T-${Math.floor(1000 + Math.random() * 9000)}`;
  const tokenNo = orderData.tokenNo || billingDetails?.tokenNo || '-';
  const { subTotal, tax, discount, total, orderType, appliedTaxes, storeInfo } = billingDetails;

  if (isReprint) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text('*** REPRINTED ***', 40, 4, { align: 'center' });
  }

  // Header Section - Restaurant Info
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('RETAIL INVOICE', 40, 8, { align: 'center' });
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  // Dynamic Store Name
  const storeName = storeInfo?.storeName || storeInfo?.name || 'MAMA FRANKY HOUSE';
  doc.text(storeName.toUpperCase(), 40, 13, { align: 'center' });
  
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  if (storeInfo?.legalName) {
    doc.text(`(${storeInfo.legalName})`, 40, 17, { align: 'center' });
  }

  // Dynamic Address
  const address = storeInfo?.address || 'A - 17, Shopping Arcade, Sadar Bazar';
  const city = storeInfo?.city ? `${storeInfo.city}, ${storeInfo.state || ''} - ${storeInfo.pincode || ''}` : 'Agra Cantt, U. P. - 282001';
  doc.text(address, 40, 21, { align: 'center' });
  doc.text(city, 40, 25, { align: 'center' });
  
  if (storeInfo?.phone) {
    doc.text(`Ph. No.. : +91 ${storeInfo.phone}`, 40, 29, { align: 'center' });
  } else {
    doc.text('Ph. No.. : +91 88991-99999', 40, 29, { align: 'center' });
  }

  const gstin = storeInfo?.gstNumber || storeInfo?.gstin || '09AAFFT9378RIZW';
  doc.text(`GSTIN : ${gstin}`, 40, 33, { align: 'center' });
  
  if (storeInfo?.fssai) {
    doc.text(`FSSAI NO. : ${storeInfo.fssai}`, 40, 37, { align: 'center' });
  }

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
  doc.text(`Cashier: ${cashierName}`, 5, 57);

  let headerShift = 4;
  const isCarService = orderType?.toLowerCase() === 'car-service';
  const tableLabel = isCarService ? `Car No : ${tableInfo?.name || ''}` : `Table  : ${tableInfo?.name || ''}`;
  doc.text(tableLabel, 5, 61);

  if (waiterName) {
    doc.text(`Waiter : ${waiterName}`, 5, 61 + headerShift);
    doc.setFont('courier', 'bold');
    doc.text(`Bill No.: ${billNo}`, 5, 65 + headerShift);
    doc.text(`Token No.: ${tokenNo}`, 45, 65 + headerShift);
    headerShift += 8;
  } else {
    doc.setFont('courier', 'bold');
    doc.text(`Bill No.: ${billNo}`, 5, 61 + headerShift);
    doc.text(`Token No.: ${tokenNo}`, 45, 61 + headerShift);
    headerShift += 4;
  }

  // Table Headers
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setLineWidth(0.2);
  doc.line(5, 64 + headerShift, 75, 64 + headerShift);
  doc.text('No.Item', 5, 68 + headerShift);
  doc.text('Qty.', 45, 68 + headerShift, { align: 'right' });
  doc.text('Price', 60, 68 + headerShift, { align: 'right' });
  doc.text('Amount', 75, 68 + headerShift, { align: 'right' });
  doc.line(5, 70 + headerShift, 75, 70 + headerShift);

  // Items List
  let y = 74 + headerShift;
  allItems.forEach((item, index) => {
    doc.text(`${index + 1} `, 5, y);
    const splitName = doc.splitTextToSize(item.name, 35);
    doc.text(splitName, 8, y);
    
    // Position price section at the same Y as the first line of multi-line name
    doc.text(`${item.quantity}`, 45, y, { align: 'right' });
    // Calculate base price for inclusive breakdown (subtract item discount first)
    const itemDiscount = item.discount?.amount || 0;
    const itemTotalInclusive = (item.price * item.quantity) - itemDiscount;
    const totalTaxRate = appliedTaxes?.reduce((sum, t) => sum + (t.rate || t.percentage), 0) || 0;
    const basePriceTotal = itemTotalInclusive / (1 + (totalTaxRate / 100));
    
    doc.text(`${item.price.toFixed(2)}`, 60, y, { align: 'right' });
    doc.text(`${itemTotalInclusive.toFixed(2)}`, 75, y, { align: 'right' });
    
    y += (splitName.length * 4.5);

    if (itemDiscount > 0) {
       doc.setFontSize(7);
       doc.text(`(Item Disc: -${itemDiscount.toFixed(2)})`, 8, y - 1);
       y += 3.5;
       doc.setFontSize(8);
    }

    // Print Variants if exist
    if (item.variantLabel) {
       doc.setFontSize(7);
       doc.setFont('courier', 'normal');
       const splitVariants = doc.splitTextToSize(`(${item.variantLabel})`, 35);
       doc.text(splitVariants, 8, y - 1);
       y += (splitVariants.length * 3.5);
       doc.setFontSize(8);
    }
    
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

  // Convert old exclusive subtotal to inclusive if detected
  const isExclusive = Math.abs(subTotal + tax - total) < 2.0;
  let displaySubTotal = subTotal;
  if (isExclusive) {
    displaySubTotal = subTotal + tax;
    if (Math.abs(displaySubTotal - total) < 1.0 && discount > 0) {
      displaySubTotal += discount;
    }
  }

  const calculatedGrandTotal = displaySubTotal - Number(discount);
  const finalWhole = Math.round(calculatedGrandTotal);
  const roundOff = (finalWhole - calculatedGrandTotal).toFixed(2);

  doc.text(`Total Qty: ${totalQty}`, 5, y);
  doc.text(`Sub Total`, 40, y);
  doc.text(`${displaySubTotal.toFixed(2)}`, 75, y, { align: 'right' });
  y += 4;

  if (discount > 0) {
    const coupon = orderData.discount?.couponCode;
    doc.text(`Discount:${coupon ? ' ('+coupon+')' : ''}`, 40, y);
    doc.text(`-${discount.toFixed(2)}`, 75, y, { align: 'right' });
    y += 4;
  }

  if (appliedTaxes && appliedTaxes.length > 0) {
    appliedTaxes.forEach(t => {
      doc.text(`${t.name} ${t.rate}%:`, 40, y);
      doc.text(`${t.amount.toFixed(2)}`, 75, y, { align: 'right' });
      y += 4;
    });
  } else if (tax > 0) {
    // Fallback for backward compatibility if appliedTaxes is missing
    const gstEach = (tax / 2).toFixed(2);
    doc.text('SGST 2.5%:', 40, y);
    doc.text(`${gstEach}`, 75, y, { align: 'right' });
    y += 4;
    doc.text('CGST 2.5%:', 40, y);
    doc.text(`${gstEach}`, 75, y, { align: 'right' });
    y += 4;
  }
  
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
