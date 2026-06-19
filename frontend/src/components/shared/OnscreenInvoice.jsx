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
  const allItems = [
    ...kots.flatMap(kot => kot.items || []),
    ...cart
  ].filter(item => item.status !== 'cancelled');

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

      {/* Solid Divider */}
      <div className="border-t-2 border-double border-slate-200 my-2" />

      {/* Meta details */}
      <div className="grid grid-cols-2 gap-y-1 text-[10px] text-slate-600 mb-2">
        <div>DATE: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}</div>
        <div className="text-right font-bold uppercase">{orderType}</div>
        <div>TIME: {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
        <div className="text-right font-bold">BILL NO: {billNo}</div>
        <div>CASHIER: {cashierName}</div>
        <div className="text-right font-bold">TOKEN NO: {tokenNo}</div>
        {waiterName && <div>WAITER: {waiterName}</div>}
      </div>

      {/* Solid Divider */}
      <div className="border-t border-slate-200 my-2" />

      {/* Items Table */}
      <div className="space-y-2 text-[10px]">
        {/* Table Headers */}
        <div className="flex font-bold text-slate-900 border-b border-slate-200 pb-1">
          <span className="w-8">NO.</span>
          <span className="flex-1">ITEM</span>
          <span className="w-10 text-right">QTY</span>
          <span className="w-14 text-right">PRICE</span>
          <span className="w-16 text-right">AMOUNT</span>
        </div>

        {/* Items Rows */}
        <div className="space-y-2">
          {allItems.map((item, idx) => {
            const itemDiscount = item.discount?.amount || 0;
            const itemTotalInclusive = (item.price * item.quantity) - itemDiscount;
            const totalTaxRate = taxes?.reduce((sum, t) => sum + (t.rate || t.percentage || 0), 0) || 0;
            const basePriceTotal = itemTotalInclusive / (1 + (totalTaxRate / 100));

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-start">
                  <span className="w-8 text-slate-400">{idx + 1}</span>
                  <span className="flex-1 font-bold text-slate-800 uppercase leading-tight">{item.name}</span>
                  <span className="w-10 text-right">{item.quantity}</span>
                  <span className="w-14 text-right">{Number(item.price).toFixed(2)}</span>
                  <span className="w-16 text-right">{itemTotalInclusive.toFixed(2)}</span>
                </div>
                {item.variantLabel && (
                  <div className="pl-8 text-[9px] text-slate-500 italic">({item.variantLabel})</div>
                )}
                {itemDiscount > 0 && (
                  <div className="pl-8 text-[9px] text-emerald-600 font-bold">(Item Disc: -{itemDiscount.toFixed(2)})</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Solid Divider */}
      <div className="border-t border-slate-200 my-2" />

      {/* Summary Section */}
      <div className="space-y-1 text-[10px] text-slate-700">
        <div className="flex justify-between">
          <span>TOTAL QTY: {allItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
          <div className="w-1/2 flex justify-between">
            <span>SUB TOTAL</span>
            <span className="font-bold">{displaySubTotal.toFixed(2)}</span>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-end">
            <div className="w-1/2 flex justify-between text-emerald-600 font-bold">
              <span>DISCOUNT{couponCode ? ` (${couponCode})` : ''}</span>
              <span>-{discountAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {taxes.map((t, index) => (
          <div key={index} className="flex justify-end">
            <div className="w-1/2 flex justify-between">
              <span className="uppercase">{t.name} {t.rate || t.percentage}%</span>
              <span>{Number(t.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <div className="w-1/2 flex justify-between border-t border-slate-100 pt-1">
            <span>ROUND OFF</span>
            <span>{roundOff}</span>
          </div>
        </div>

        <div className="border-t-2 border-double border-slate-200 pt-2 flex justify-between items-center text-slate-900">
          <span className="text-xs font-extrabold uppercase">Grand Total</span>
          <span className="text-sm font-extrabold">₹ {finalWhole}.00</span>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center text-[9px] text-slate-500 mt-6 border-t border-slate-100 pt-4 uppercase tracking-wider">
        Thank You, Kindly Visit Again...!!
      </div>
    </div>
  );
}
