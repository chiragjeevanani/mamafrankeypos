import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function OnscreenInvoice({ order, storeSettings: propStoreSettings }) {
  const [storeSettings, setStoreSettings] = useState(propStoreSettings || null);

  useEffect(() => {
    if (!storeSettings && !propStoreSettings) {
      const fetchSettings = async () => {
        try {
          const { data } = await api.get('/settings/store');
          setStoreSettings(data);
        } catch (err) {
          console.error('Failed to load store settings for invoice preview:', err);
        }
      };
      fetchSettings();
    }
  }, [propStoreSettings, storeSettings]);

  // Use props if provided, otherwise local state
  const settings = propStoreSettings || storeSettings;

  if (!order) return null;

  const kots = order.kots || [];
  const cart = order.cart || [];
  const allItems = (kots && kots.length > 0)
    ? kots.flatMap(kot => kot.items || [])
    : cart;
  const filteredItems = allItems.filter(item => item.status !== 'cancelled');

  const cashierName = order.biller?.name || order.billerName || 'Cashier';
  const waiterName = order.waiter?.name || order.waiterName || '';
  const billNo = order.orderNumber || 'Pending';
  const tokenNo = order.tokenNo || '-';
  const orderType = order.orderType || 'DINE-IN';

  const totalAmount = order.totalAmount || 0;

  // Calculate subtotal and taxes dynamically if they are empty/zero (e.g. for active running orders)
  let subTotal = order.subtotal || 0;
  let taxes = order.taxes || [];

  const discountAmount = order.discount?.amount || 0;
  const couponCode = order.discount?.couponCode || '';
  
  if ((!subTotal || taxes.length === 0) && totalAmount > 0) {
    const activeTaxes = (settings?.taxes || []).filter(t => t.active);
    if (activeTaxes.length > 0) {
      const totalTaxRate = activeTaxes.reduce((sum, t) => sum + (t.percentage || t.rate || 0), 0);
      const baseAmount = totalAmount / (1 + (totalTaxRate / 100));
      subTotal = totalAmount + discountAmount;
      taxes = activeTaxes.map(t => ({
        name: t.name,
        rate: t.percentage || t.rate,
        percentage: t.percentage || t.rate,
        amount: Number(((baseAmount * (t.percentage || t.rate)) / 100).toFixed(2))
      }));
    } else {
      subTotal = totalAmount;
    }
  }

  const totalTaxAmount = taxes.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Convert old exclusive subtotal to inclusive if detected
  let displaySubTotal = subTotal;
  const isExclusive = displaySubTotal > 0 && Math.abs(displaySubTotal + totalTaxAmount - totalAmount) < 2.0;
  if (isExclusive) {
    displaySubTotal += totalTaxAmount;
    if (Math.abs(displaySubTotal - totalAmount) < 1.0 && discountAmount > 0) {
      displaySubTotal += discountAmount;
    }
  }

  const calculatedGrandTotal = displaySubTotal - discountAmount;
  const finalWhole = Math.round(order.totalAmount || calculatedGrandTotal);
  const roundOff = (finalWhole - (order.totalAmount || calculatedGrandTotal)).toFixed(2);

  const storeName = settings?.storeName || settings?.name || 'MAMA FRANKY HOUSE';
  const storeLegal = settings?.legalName || '';
  const storeAddress = settings?.address || 'A - 17, Shopping Arcade, Sadar Bazar';
  const storeCity = settings?.city ? `${settings.city}, ${settings.state || ''} - ${settings.pincode || ''}` : 'Agra Cantt, U.P. - 282001';
  const storePhone = settings?.phone || '88991-99999';
  const storeGst = settings?.gstNumber || settings?.gstin || '09AAFFT9378RIZW';
  const storeFssai = settings?.fssai || '';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md font-mono text-slate-800 text-xs max-w-sm mx-auto select-none">
      {/* Header section */}
      <div className="text-center space-y-1 mb-4">
        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Retail Invoice</div>
        <h2 className="text-sm font-extrabold text-slate-900 uppercase">{storeName}</h2>
        {storeLegal && <p className="text-[9px] text-slate-500">({storeLegal})</p>}
        <p className="text-[9px] text-slate-500 leading-tight">{storeAddress}<br />{storeCity}</p>
        <p className="text-[9px] text-slate-500">Ph. No: +91 {storePhone}</p>
        <p className="text-[9px] text-slate-500 font-bold">GSTIN: {storeGst}</p>
        {storeFssai && <p className="text-[9px] text-slate-500 font-bold">FSSAI NO: {storeFssai}</p>}
      </div>

      {/* Double Divider */}
      <div className="border-t-2 border-double border-slate-900 my-2" />

      {/* Meta details */}
      <div className="space-y-0.5 text-[10px] text-slate-600 mb-2">
        <div className="flex justify-between">
          <span>Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
          <span className="font-bold uppercase">{orderType}</span>
        </div>
        <div>{new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
        <div>Cashier: {cashierName}</div>
        {waiterName && <div>Waiter : {waiterName}</div>}
        <div className="flex justify-between">
          <span className="font-bold">Bill No.: {billNo}</span>
          <span className="font-bold">Token No.: {tokenNo}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-1 text-[10px]">
        {/* Table Headers */}
        <div className="flex font-bold text-slate-900 border-t border-b border-slate-800 py-1 uppercase">
          <span className="flex-1">No.Item</span>
          <span className="w-10 text-right">Qty.</span>
          <span className="w-14 text-right">Price</span>
          <span className="w-16 text-right">Amount</span>
        </div>

        {/* Items Rows */}
        <div className="space-y-1 py-1">
          {filteredItems.map((item, idx) => {
            const itemDiscount = item.discount?.amount || 0;
            const itemTotalInclusive = (item.price * item.quantity) - itemDiscount;

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-start">
                  <span className="flex-1 font-bold text-slate-800 uppercase leading-tight">
                    {idx + 1} {item.name}
                  </span>
                  <span className="w-10 text-right">{item.quantity}</span>
                  <span className="w-14 text-right">{Number(item.price).toFixed(2)}</span>
                  <span className="w-16 text-right">{itemTotalInclusive.toFixed(2)}</span>
                </div>
                {item.variantLabel && (
                  <div className="pl-4 text-[9px] text-slate-500 italic">({item.variantLabel})</div>
                )}
                {itemDiscount > 0 && (
                  <div className="pl-4 text-[9px] text-emerald-600 font-bold">(Item Disc: -{itemDiscount.toFixed(2)})</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Solid Divider */}
      <div className="border-t border-slate-800 my-2" />

      {/* Summary Section */}
      <div className="space-y-1 text-[10px] text-slate-800">
        <div className="flex justify-between">
          <span>Total Qty: {filteredItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
          <div className="w-1/2 flex justify-between">
            <span>Sub Total</span>
            <span>{displaySubTotal.toFixed(2)}</span>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-end">
            <div className="w-1/2 flex justify-between text-rose-600 font-bold">
              <span>Discount{couponCode ? ` (${couponCode})` : ''}</span>
              <span>-{discountAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {taxes.map((t, index) => (
          <div key={index} className="flex justify-end">
            <div className="w-1/2 flex justify-between font-normal text-slate-600">
              <span className="uppercase">{t.name} {t.rate || t.percentage}%:</span>
              <span>{Number(t.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <div className="w-1/2 flex justify-between border-t border-slate-300 pt-1">
            <span>Round off</span>
            <span>{roundOff}</span>
          </div>
        </div>

        <div className="border-t-2 border-double border-slate-800 pt-2 flex justify-between items-center text-slate-900">
          <span className="text-xs font-extrabold uppercase">Grand Total</span>
          <span className="text-sm font-extrabold">Rs. {finalWhole}.00</span>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center text-[9px] text-slate-500 mt-6 border-t border-slate-800 pt-4 uppercase tracking-wider">
        Thank You, Kindly Visit Again...!!
      </div>
    </div>
  );
}
