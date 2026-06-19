import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Printer, Plus, Trash2, Calendar, Clock, 
  User, FileText, RefreshCw, AlertCircle, ShoppingBag, Utensils, Search
} from 'lucide-react';
import api from '../../../utils/api';
import { playClickSound } from '../../pos/utils/sounds';
import { jsPDF } from 'jspdf';

export default function CustomBillCreator() {
  const [storeSettings, setStoreSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected items in the custom bill
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Selected menu item to add
  const [itemToAdd, setItemToAdd] = useState('');
  
  // Searchable dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered menu items based on search input
  const filteredMenuItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return menuItems;
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.price.toString().includes(q)
    );
  }, [menuItems, searchQuery]);

  // Form inputs state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    orderType: 'DINE-IN',
    billNo: '',
    tokenNo: '-',
    cashierName: 'Admin',
    waiterName: '',
    tableName: 'Table 1',
    discount: 0,
    couponCode: '',
    
    // Editable store overrides
    storeName: 'MAMA FRANKY HOUSE',
    storeLegal: '',
    storeAddress: 'A - 17, Shopping Arcade, Sadar Bazar',
    storeCity: 'Agra Cantt, U. P. - 282001',
    storePhone: '88991-99999',
    storeGst: '09AAFFT9378RIZW',
    storeFssai: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [settingsRes, itemsRes] = await Promise.all([
          api.get('/settings/store'),
          api.get('/menu/items')
        ]);
        
        const settings = settingsRes.data || {};
        setStoreSettings(settings);
        
        // Populate active menu items
        setMenuItems((itemsRes.data || []).filter(item => item.active !== false));
        
        // Generate a random bill number default
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        
        setFormData(prev => ({
          ...prev,
          billNo: `M-${randomNum}`,
          storeName: settings.name || prev.storeName,
          storeLegal: settings.legalName || prev.storeLegal,
          storeAddress: settings.address || prev.storeAddress,
          storeCity: settings.city ? `${settings.city}, ${settings.state || ''} - ${settings.pincode || ''}` : prev.storeCity,
          storePhone: settings.phone || prev.storePhone,
          storeGst: settings.gstin || prev.storeGst,
          storeFssai: settings.fssai || prev.storeFssai
        }));
      } catch (err) {
        console.error("Failed to load initial settings:", err);
        setError('Failed to fetch store configurations or menu items.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' ? Math.max(0, Number(value) || 0) : value
    }));
  };

  const handleAddItem = () => {
    if (!itemToAdd) return;
    playClickSound();
    
    const menuItem = menuItems.find(item => item._id === itemToAdd);
    if (!menuItem) return;

    // Check if item is already added
    const existingIndex = selectedItems.findIndex(i => i._id === menuItem._id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          _id: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          discount: 0,
          variantLabel: menuItem.variantLabel || ''
        }
      ]);
    }
    
    setItemToAdd('');
    setSearchQuery('');
  };

  const handleRemoveItem = (index) => {
    playClickSound();
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index, value) => {
    const qty = Math.max(1, Number(value) || 1);
    setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  const handleItemDiscountChange = (index, value) => {
    const disc = Math.max(0, Number(value) || 0);
    setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, discount: disc } : item));
  };

  const handleItemVariantChange = (index, value) => {
    setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, variantLabel: value } : item));
  };

  const handleReset = () => {
    playClickSound();
    setSelectedItems([]);
    setItemToAdd('');
    setSearchQuery('');
    setIsOpen(false);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      orderType: 'DINE-IN',
      billNo: `M-${randomNum}`,
      tokenNo: '-',
      cashierName: 'Admin',
      waiterName: '',
      tableName: 'Table 1',
      discount: 0,
      couponCode: '',
      
      storeName: storeSettings?.name || 'MAMA FRANKY HOUSE',
      storeLegal: storeSettings?.legalName || '',
      storeAddress: storeSettings?.address || 'A - 17, Shopping Arcade, Sadar Bazar',
      storeCity: storeSettings?.city ? `${storeSettings.city}, ${storeSettings.state || ''} - ${storeSettings.pincode || ''}` : 'Agra Cantt, U. P. - 282001',
      storePhone: storeSettings?.phone || '88991-99999',
      storeGst: storeSettings?.gstin || '09AAFFT9378RIZW',
      storeFssai: storeSettings?.fssai || ''
    }));
  };

  // Calculations (Exact Inclusive Matching)
  const activeTaxes = useMemo(() => {
    return (storeSettings?.taxes || []).filter(t => t.active);
  }, [storeSettings]);

  const totals = useMemo(() => {
    const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = selectedItems.reduce((sum, item) => {
      const itemDiscount = Number(item.discount || 0);
      return sum + (Number(item.price || 0) * item.quantity) - itemDiscount;
    }, 0);

    const discountAmount = Number(formData.discount || 0);
    const grandTotalRaw = Math.max(0, subTotal - discountAmount);
    
    // Tax is inclusive. Break it down based on raw total:
    const totalTaxRate = activeTaxes.reduce((sum, t) => sum + (t.percentage || t.rate || 0), 0);
    const baseAmount = grandTotalRaw / (1 + (totalTaxRate / 100));
    
    const taxesList = activeTaxes.map(t => {
      const rate = Number(t.percentage || t.rate || 0);
      return {
        name: t.name,
        rate: rate,
        amount: Number(((baseAmount * rate) / 100).toFixed(2))
      };
    });
    
    const finalWhole = Math.round(grandTotalRaw);
    const roundOff = (finalWhole - grandTotalRaw).toFixed(2);

    return {
      totalQty,
      subTotal,
      discountAmount,
      taxesList,
      finalWhole,
      roundOff
    };
  }, [selectedItems, formData.discount, activeTaxes]);

  const handlePrintPDF = () => {
    if (selectedItems.length === 0) {
      alert("Please add at least one item to the bill before printing.");
      return;
    }
    
    playClickSound();

    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 220] // receipt width x estimated height
    });

    const dateParts = formData.date.split('-'); // yyyy-mm-dd
    const dateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // dd/mm/yyyy
    const timeStr = formData.time;

    // Header Section - Restaurant Info
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('RETAIL INVOICE', 40, 8, { align: 'center' });
    
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text(formData.storeName.toUpperCase(), 40, 13, { align: 'center' });
    
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    if (formData.storeLegal) {
      doc.text(`(${formData.storeLegal})`, 40, 17, { align: 'center' });
    }

    doc.text(formData.storeAddress, 40, 21, { align: 'center' });
    doc.text(formData.storeCity, 40, 25, { align: 'center' });
    doc.text(`Ph. No.. : +91 ${formData.storePhone}`, 40, 29, { align: 'center' });
    doc.text(`GSTIN : ${formData.storeGst}`, 40, 33, { align: 'center' });
    
    if (formData.storeFssai) {
      doc.text(`FSSAI NO. : ${formData.storeFssai}`, 40, 37, { align: 'center' });
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
    
    // Label type based on selections
    const displayType = formData.orderType === 'DINE-IN' ? `DINE-IN - ${formData.tableName}` : formData.orderType;
    doc.text(displayType.toUpperCase(), 75, 49, { align: 'right' });
    
    doc.setFont('courier', 'normal');
    doc.text(`${timeStr}`, 5, 53);
    doc.text(`Cashier: ${formData.cashierName}`, 5, 57);

    let headerShift = 0;
    if (formData.waiterName) {
      doc.text(`Waiter : ${formData.waiterName}`, 5, 61);
      doc.setFont('courier', 'bold');
      doc.text(`Bill No.: ${formData.billNo}`, 5, 65);
      doc.text(`Token No.: ${formData.tokenNo}`, 45, 65);
      headerShift = 8;
    } else {
      doc.setFont('courier', 'bold');
      doc.text(`Bill No.: ${formData.billNo}`, 5, 61);
      doc.text(`Token No.: ${formData.tokenNo}`, 45, 61);
      headerShift = 4;
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
    selectedItems.forEach((item, index) => {
      doc.text(`${index + 1} `, 5, y);
      const splitName = doc.splitTextToSize(item.name, 35);
      doc.text(splitName, 8, y);
      
      doc.text(`${item.quantity}`, 45, y, { align: 'right' });
      
      const itemDiscount = Number(item.discount || 0);
      const itemTotalInclusive = (Number(item.price) * item.quantity) - itemDiscount;
      
      doc.text(`${Number(item.price).toFixed(2)}`, 60, y, { align: 'right' });
      doc.text(`${itemTotalInclusive.toFixed(2)}`, 75, y, { align: 'right' });
      
      y += (splitName.length * 4.5);

      if (itemDiscount > 0) {
         doc.setFontSize(7);
         doc.text(`(Item Disc: -${itemDiscount.toFixed(2)})`, 8, y - 1);
         y += 3.5;
         doc.setFontSize(8);
      }

      if (item.variantLabel) {
         doc.setFontSize(7);
         const splitVariants = doc.splitTextToSize(`(${item.variantLabel})`, 35);
         doc.text(splitVariants, 8, y - 1);
         y += (splitVariants.length * 3.5);
         doc.setFontSize(8);
      }
      
      if (y > 190) {
        doc.addPage();
        y = 10;
      }
    });

    // Footer Totals
    doc.line(5, y, 75, y);
    y += 5;

    doc.text(`Total Qty: ${totals.totalQty}`, 5, y);
    doc.text(`Sub Total`, 40, y);
    doc.text(`${totals.subTotal.toFixed(2)}`, 75, y, { align: 'right' });
    y += 4;

    if (totals.discountAmount > 0) {
      doc.text(`Discount:${formData.couponCode ? ' ('+formData.couponCode+')' : ''}`, 40, y);
      doc.text(`-${totals.discountAmount.toFixed(2)}`, 75, y, { align: 'right' });
      y += 4;
    }

    totals.taxesList.forEach(t => {
      doc.text(`${t.name} ${t.rate}%:`, 40, y);
      doc.text(`${t.amount.toFixed(2)}`, 75, y, { align: 'right' });
      y += 4;
    });

    doc.setLineWidth(0.2);
    doc.line(40, y - 0.5, 75, y - 0.5);
    doc.line(40, y + 0.5, 75, y + 0.5);
    y += 4;
    
    doc.text('Round off', 40, y);
    doc.text(`${totals.roundOff}`, 75, y, { align: 'right' });
    y += 6;
    
    doc.setFontSize(10);
    doc.setFont('courier', 'bold');
    doc.text('GRAND TOTAL', 5, y);
    doc.text(`Rs. ${totals.finalWhole}.00`, 75, y, { align: 'right' });
    
    y += 6;
    doc.setLineWidth(0.2);
    doc.line(5, y, 75, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text('Thank You, Kindly Visit Again...!!', 40, y, { align: 'center' });

    // Save and Trigger browser download
    const fileNameSuffix = formData.orderType === 'DINE-IN' ? formData.tableName : formData.orderType;
    doc.save(`Bill_${fileNameSuffix.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin text-[#E1261C]"><RefreshCw size={32} /></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-h-screen overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Printer size={20} className="text-[#E1261C]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">Custom Bill Creator</h1>
          </div>
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
            Create and print off-ledger receipts with identical POS formats & settings
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-[10px] font-black text-stone-600 uppercase tracking-widest transition-all"
        >
          Reset Form
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-rose-600 text-xs font-bold uppercase tracking-wider">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 space-y-5 shadow-sm">
          
          {/* Section: Bill Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-1.5">
              1. Bill Details & Header Info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Date</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 pl-8 pr-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Time</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="text" 
                    name="time"
                    placeholder="12:00"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 pl-8 pr-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Order Type</label>
                <select 
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                >
                  <option value="DINE-IN">Dine-in</option>
                  <option value="CAR-SERVICE">Car Service</option>
                  <option value="TAKEAWAY">Takeaway</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Bill Number</label>
                <input 
                  type="text" 
                  name="billNo"
                  placeholder="e.g. M-101"
                  value={formData.billNo}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Token Number</label>
                <input 
                  type="text" 
                  name="tokenNo"
                  placeholder="e.g. 5"
                  value={formData.tokenNo}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">
                  {formData.orderType === 'DINE-IN' ? 'Table Name' : 'Destination / Car No'}
                </label>
                <input 
                  type="text" 
                  name="tableName"
                  placeholder={formData.orderType === 'DINE-IN' ? 'e.g. Table 4' : 'e.g. UP 80 AX 1234'}
                  value={formData.tableName}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Cashier Name</label>
                <input 
                  type="text" 
                  name="cashierName"
                  placeholder="e.g. Admin"
                  value={formData.cashierName}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Waiter Name (Optional)</label>
                <input 
                  type="text" 
                  name="waiterName"
                  placeholder="e.g. Ramesh"
                  value={formData.waiterName}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Add Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-1.5">
              2. Add Items from Menu
            </h3>
            
            <div className="flex gap-2">
              <div ref={dropdownRef} className="flex-1 relative">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="text"
                    placeholder="Search & choose menu item..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setItemToAdd(''); // Clear selection if typing
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                  />
                </div>
                {isOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-lg z-50 py-1 font-sans text-xs">
                    {filteredMenuItems.length === 0 ? (
                      <div className="px-3 py-2 text-stone-400 italic">No menu items found</div>
                    ) : (
                      filteredMenuItems.map(item => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => {
                            setItemToAdd(item._id);
                            setSearchQuery(`${item.name} (₹${item.price.toFixed(0)})`);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-stone-50 transition-colors flex justify-between items-center text-stone-700 hover:text-stone-900 border-b border-stone-50 last:border-0"
                        >
                          <span className="font-bold uppercase tracking-tight">{item.name}</span>
                          <span className="text-[10px] text-[#E1261C] font-black bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                            ₹{item.price.toFixed(0)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={handleAddItem}
                disabled={!itemToAdd}
                className="px-4 bg-[#E1261C] hover:bg-[#4E342E] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Section: Added Items Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-1.5 flex justify-between items-center">
              <span>3. Selected Items</span>
              <span className="text-[10px] font-bold text-stone-400 lowercase">{selectedItems.length} added</span>
            </h3>
            
            {selectedItems.length === 0 ? (
              <div className="p-8 border border-dashed border-stone-200 rounded-xl text-center text-stone-400 text-[10px] font-black uppercase tracking-widest">
                No items added to custom bill yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-800 uppercase truncate leading-none mb-0.5">{item.name}</p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                          Unit Price: ₹{item.price.toFixed(2)} (Locked)
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(idx)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded py-1 px-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Variant Label</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Spicy"
                          value={item.variantLabel}
                          onChange={(e) => handleItemVariantChange(idx, e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded py-1 px-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Item Disc (₹)</label>
                        <input 
                          type="number" 
                          min="0"
                          value={item.discount}
                          onChange={(e) => handleItemDiscountChange(idx, e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded py-1 px-1.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Discounts */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-1.5">
              4. Overall Discounts & Taxes
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Coupon Code (Optional)</label>
                <input 
                  type="text" 
                  name="couponCode"
                  placeholder="e.g. SPECIAL10"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1">Discount Amount (₹)</label>
                <input 
                  type="number" 
                  name="discount"
                  min="0"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Displaying Locked taxes */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-1.5">
              <span className="block text-[9px] font-black text-stone-400 uppercase tracking-wider">Taxes (Locked from Store Configuration)</span>
              {activeTaxes.length === 0 ? (
                <span className="text-[10px] font-bold text-stone-500 uppercase">No active taxes configured.</span>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {activeTaxes.map((tax, i) => (
                    <span key={i} className="text-[10px] font-bold text-stone-600 bg-white border border-stone-200 rounded px-2 py-0.5 uppercase tracking-wide">
                      {tax.name} : {tax.percentage || tax.rate}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Store Settings Panel */}
          <details className="group border border-stone-200 rounded-lg overflow-hidden transition-all bg-stone-50/50">
            <summary className="px-4 py-3 text-xs font-black uppercase tracking-wider text-stone-600 cursor-pointer flex justify-between items-center hover:bg-stone-50 list-none">
              <span>5. Custom Store Invoice Header Info (Optional)</span>
              <span className="text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 border-t border-stone-200 space-y-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Store Name</label>
                  <input 
                    type="text" 
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Legal Entity Name</label>
                  <input 
                    type="text" 
                    name="storeLegal"
                    placeholder="e.g. (Mama Franky Retail Ltd)"
                    value={formData.storeLegal}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Address</label>
                <input 
                  type="text" 
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">City / State / Pin</label>
                  <input 
                    type="text" 
                    name="storeCity"
                    value={formData.storeCity}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Phone Number</label>
                  <input 
                    type="text" 
                    name="storePhone"
                    value={formData.storePhone}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">GSTIN Number</label>
                  <input 
                    type="text" 
                    name="storeGst"
                    value={formData.storeGst}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-stone-400 uppercase tracking-wider mb-0.5">FSSAI License No</label>
                <input 
                  type="text" 
                  name="storeFssai"
                  placeholder="e.g. 12093847593284"
                  value={formData.storeFssai}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded py-1.5 px-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Right Column: Live Onscreen Invoice Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Live Receipt Preview</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm min-h-[460px] flex flex-col justify-between">
            
            {/* Onscreen Invoice Layout Mockup */}
            <div className="bg-stone-50 border border-stone-150 rounded-lg p-5 font-mono text-[10px] text-stone-700 space-y-3 select-none leading-relaxed">
              
              {/* Header */}
              <div className="text-center space-y-0.5">
                <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Retail Invoice</div>
                <div className="text-xs font-extrabold text-stone-900 uppercase">{formData.storeName}</div>
                {formData.storeLegal && <div className="text-[8px] text-stone-500">({formData.storeLegal})</div>}
                <div className="text-[8px] text-stone-500 leading-tight">
                  {formData.storeAddress} <br /> {formData.storeCity}
                </div>
                <div className="text-[8px] text-stone-500">Ph. No: +91 {formData.storePhone}</div>
                <div className="text-[8px] text-stone-500 font-bold">GSTIN: {formData.storeGst}</div>
                {formData.storeFssai && <div className="text-[8px] text-stone-500 font-bold">FSSAI NO: {formData.storeFssai}</div>}
              </div>

              {/* Double Solid Line */}
              <div className="border-t-2 border-double border-stone-300 my-1.5" />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-y-0.5 text-stone-600">
                <div>DATE: {formData.date.split('-').reverse().join('/')}</div>
                <div className="text-right font-bold uppercase">
                  {formData.orderType === 'DINE-IN' ? `Dine-in - ${formData.tableName}` : formData.orderType}
                </div>
                <div>TIME: {formData.time}</div>
                <div className="text-right font-bold">BILL NO: {formData.billNo || 'Pending'}</div>
                <div>CASHIER: {formData.cashierName}</div>
                <div className="text-right font-bold">TOKEN NO: {formData.tokenNo}</div>
                {formData.waiterName && <div className="col-span-2">WAITER: {formData.waiterName}</div>}
              </div>

              {/* Single Solid Line */}
              <div className="border-t border-stone-300 my-1.5" />

              {/* Items List */}
              <div className="space-y-1">
                <div className="flex font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                  <span className="w-6">NO.</span>
                  <span className="flex-1">ITEM</span>
                  <span className="w-8 text-right">QTY</span>
                  <span className="w-12 text-right">PRICE</span>
                  <span className="w-14 text-right">AMOUNT</span>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 italic">No items added</div>
                ) : (
                  <div className="space-y-1">
                    {selectedItems.map((item, idx) => {
                      const itemDiscount = Number(item.discount || 0);
                      const itemTotal = (Number(item.price) * item.quantity) - itemDiscount;
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex items-start">
                            <span className="w-6 text-stone-400">{idx + 1}</span>
                            <span className="flex-1 font-bold text-stone-800 uppercase truncate pr-1">{item.name}</span>
                            <span className="w-8 text-right">{item.quantity}</span>
                            <span className="w-12 text-right">{Number(item.price).toFixed(2)}</span>
                            <span className="w-14 text-right">{itemTotal.toFixed(2)}</span>
                          </div>
                          {item.variantLabel && (
                            <div className="pl-6 text-[8px] text-stone-500 italic">({item.variantLabel})</div>
                          )}
                          {itemDiscount > 0 && (
                            <div className="pl-6 text-[8px] text-emerald-600 font-bold">(Item Disc: -{itemDiscount.toFixed(2)})</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Single Solid Line */}
              <div className="border-t border-stone-300 my-1.5" />

              {/* Calculations Block */}
              <div className="space-y-0.5 text-stone-700">
                <div className="flex justify-between">
                  <span>TOTAL QTY: {totals.totalQty}</span>
                  <div className="w-1/2 flex justify-between">
                    <span>SUB TOTAL</span>
                    <span className="font-bold">{totals.subTotal.toFixed(2)}</span>
                  </div>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="flex justify-end">
                    <div className="w-1/2 flex justify-between text-emerald-600 font-bold">
                      <span>DISCOUNT{formData.couponCode ? ` (${formData.couponCode})` : ''}</span>
                      <span>-{totals.discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {totals.taxesList.map((t, index) => (
                  <div key={index} className="flex justify-end">
                    <div className="w-1/2 flex justify-between">
                      <span className="uppercase">{t.name} {t.rate}%</span>
                      <span>{t.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <div className="w-1/2 flex justify-between border-t border-stone-200 pt-0.5">
                    <span>ROUND OFF</span>
                    <span>{totals.roundOff}</span>
                  </div>
                </div>

                <div className="border-t-2 border-double border-stone-300 pt-1.5 flex justify-between items-center text-stone-900 font-bold text-xs">
                  <span>GRAND TOTAL</span>
                  <span className="text-sm font-extrabold text-[#E1261C]">₹ {totals.finalWhole}.00</span>
                </div>
              </div>

              {/* Single Solid Line */}
              <div className="border-t border-stone-300 my-1.5" />

              {/* Footer msg */}
              <div className="text-center text-[8px] text-stone-500 uppercase tracking-wide">
                Thank You, Kindly Visit Again...!!
              </div>

            </div>

            {/* Print Action Trigger */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <button 
                onClick={handlePrintPDF}
                disabled={selectedItems.length === 0}
                className="w-full py-3 bg-[#E1261C] hover:bg-[#4E342E] text-white rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Printer size={15} /> Download PDF Receipt
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
