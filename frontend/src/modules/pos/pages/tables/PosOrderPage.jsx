import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Minus, Trash2, Receipt, ArrowLeft, 
  ChevronDown, User, Users, Edit3, Bell, 
  ChevronUp, Star, Wine, Soup, Apple, Zap, RefreshCw,
  Save, Printer, FileText, Send, PauseCircle, Split, 
  Ticket, Wallet, CheckCircle2, ShoppingBag, Truck, X, Check, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { POS_CATEGORIES, POS_MENU_ITEMS } from '../../data/posMenu';
import { TABLE_SECTIONS } from '../../data/tablesMockData';
import PosTopNavbar from '../../components/PosTopNavbar';
import { usePos } from '../../context/PosContext';
import { printKOTReceipt } from '../../utils/printKOT';
import { printBillReceipt } from '../../utils/printBill';
import { downloadBillAndKOT } from '../../utils/printCombined';
import { playClickSound } from '../../utils/sounds';


import { ALL_STAFF as MOCK_WAITERS } from '../../data/staff';

export default function PosOrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { 
    placeKOT, saveOrder, settleOrder, holdOrder, clearTable,
    orders, isCustomerSectionOpen, toggleCustomerSection, user
  } = usePos();
  
  const [categories, setCategories] = useState(POS_CATEGORIES);
  const [menuItems, setMenuItems] = useState(POS_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('fav');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortCode, setShortCode] = useState('');

  // Fetch and parse CSV data
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/data/mama franky menu.csv');
        const text = await response.text();
        const lines = text.split('\n');
        
        if (lines.length < 2) return;

        const parseRow = (row) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const csvItems = [];
        const csvCategories = new Set();
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const row = parseRow(line);
          if (row.length < 11) continue;

          const name = row[0].replace(/^"|"$/g, '');
          const category = row[8].replace(/^"|"$/g, '') || 'General';
          const price = parseFloat(row[10]) || 0;
          const code = row[3].replace(/^"|"$/g, '') || '';

          csvCategories.add(category);
          csvItems.push({
            id: `csv-${i}`,
            catId: category,
            name: name,
            price: price,
            code: code,
            shortcut: code,
            image: ''
          });
        }

        const newCategories = Array.from(csvCategories).map((cat, index) => ({
          id: cat,
          name: cat,
          icon: 'Utensils',
          color: index % 2 === 0 ? '#E1261C' : '#00BCD4'
        }));

        // Add Favorites at top
        newCategories.unshift({ id: 'fav', name: 'Favorite Items', icon: 'Star', color: '#4CAF50' });
        
        setCategories(newCategories);
        setMenuItems(csvItems);
        setSelectedCategory(newCategories[0].id);
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };

    fetchCSV();
  }, []);
  
  // Initialize cart from existing order if any
  const [cart, setCart] = useState(() => orders[tableId]?.items || []);
  const [orderType, setOrderType] = useState('dine-in'); // dine-in, delivery, pickup
  
  // States for interactive checkboxes/radios
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isBogoActive, setIsBogoActive] = useState(false);
  const [isSplitActive, setIsSplitActive] = useState(false);
  const [isSalesReturn, setIsSalesReturn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoyalty, setIsLoyalty] = useState(true);
  
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitPayments, setSplitPayments] = useState([]);
  const [selectedWaiter, setSelectedWaiter] = useState(MOCK_WAITERS[1]); // Default to Peter
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);

  // Billing summary states
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // or 'fixed'
  const [discountReason, setDiscountReason] = useState('');
  const [couponCode, setCouponCode] = useState('');
  
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [containerCharge, setContainerCharge] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [customerPaid, setCustomerPaid] = useState(0);
  const [manualReturnAmount, setManualReturnAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isOtherPaymentModalOpen, setIsOtherPaymentModalOpen] = useState(false);
  const [otherPaymentDetails, setOtherPaymentDetails] = useState({ type: 'UPI', note: '' });

  // Sync waiter and order data from shared context
  useEffect(() => {
    const existingOrder = orders[tableId];
    if (existingOrder) {
       if (existingOrder.waiter) {
          // Find matching waiter in MOCK_WAITERS or create a new one for display
          const matched = MOCK_WAITERS.find(w => w.id === existingOrder.waiter.id || w.name === existingOrder.waiter.name);
          setSelectedWaiter(matched || existingOrder.waiter);
       }
       if (existingOrder.customer) {
          setCustomer(existingOrder.customer);
       }
    }
  }, [tableId, orders]);

  // Customer Section States
  const [customer, setCustomer] = useState({
     mobile: '',
     name: '',
     address: '',
     locality: '',
     extra: ''
  });

  // Find table details
  const tableInfo = useMemo(() => {
    for (const section of TABLE_SECTIONS) {
      const table = section.tables.find(t => t.id === tableId);
      if (table) return { name: table.name, section: section.label };
    }
    return { name: tableId, section: 'AC' };
  }, [tableId]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const query = searchQuery.toLowerCase();
      const codeQuery = shortCode.toLowerCase();
      
      const matchesSearch = item.name.toLowerCase().includes(query) || 
                           item.code.toLowerCase().includes(query);
      
      const matchesShortCode = shortCode === '' || 
                              item.code.toLowerCase() === codeQuery ||
                              item.shortcut.toLowerCase() === codeQuery;
      
      // If searching, show all matches globally
      const matchesCategory = (shortCode !== '' || searchQuery !== '') 
        ? true 
        : (selectedCategory === 'fav' ? true : item.catId === selectedCategory);

      return matchesCategory && matchesSearch && matchesShortCode;
    });
  }, [selectedCategory, searchQuery, shortCode, menuItems]);

  const addToCart = (item) => {
    playClickSound();
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    playClickSound();
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    playClickSound();
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const { total, subTotal, totalItemCount, tax, appliedTaxes, roundOff, changeToReturn, bogoDiscount } = useMemo(() => {
    const cartItems = cart || [];
    const kotItems = orders[tableId]?.kots?.flatMap(kot => kot.items) || [];
    const allItems = [...cartItems, ...kotItems];
    
    const count = allItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // BOGO LOGIC: Buy 1 Get 1
    let bDiscount = 0;
    if (isBogoActive) {
      allItems.forEach(item => {
        bDiscount += Math.floor(item.quantity / 2) * item.price;
      });
    }

    const sTotal = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - bDiscount;
    
    const taxVal = Number((sTotal * 0.05).toFixed(2)); // 5% GST example
    
    // Intermediate Total
    const iTotal = (sTotal + taxVal + Number(deliveryCharge) + Number(containerCharge) + Number(serviceCharge)) - Number(discount);
    
    // Automatic Rounding
    const fTotalWhole = Math.round(iTotal);
    const rOff = Number((fTotalWhole - iTotal).toFixed(2));
    
    // Change to return
    const cToReturn = Math.max(0, Number(customerPaid) - fTotalWhole);
    
    return { 
      total: fTotalWhole, 
      subTotal: sTotal + bDiscount, 
      totalItemCount: count, 
      tax: taxVal, 
      appliedTaxes: [
        { name: 'Home Tax', rate: 5, base: sTotal, amount: taxVal }
      ],
      roundOff: rOff, 
      changeToReturn: cToReturn,
      bogoDiscount: bDiscount
    };
  }, [cart, orders, tableId, deliveryCharge, containerCharge, serviceCharge, discount, customerPaid, isBogoActive]);

  // Sync manual return amount with calculated change
  useMemo(() => {
    setManualReturnAmount(Number(changeToReturn.toFixed(2)));
  }, [changeToReturn]);

  const handleShortCodeSubmit = (e) => {
    if (e.key === 'Enter') {
      const code = shortCode.toUpperCase();
      const item = menuItems.find(i => 
        i.code.toUpperCase() === code || i.shortcut.toUpperCase() === code
      );
      
      if (item) {
        addToCart(item);
        setShortCode(''); // Clear input
      }
    }
  };

  // --- ACTIONS ---
  const handleKOT = (isPrint = false) => {
    playClickSound();
    if (cart.length === 0 || total <= 0) {
       alert("No items in cart to place KOT!");
       return;
    }
    placeKOT(tableId, cart, total, selectedWaiter);
    if (isPrint) printKOTReceipt({ items: cart }, { name: tableInfo.name, orderType, billerName: user?.name });
    setTimeout(() => {
      setCart([]); // Reset local cart after placing
      navigate('/pos/tables');
    }, 300);
  };

  const handleSave = (isPrint = false) => {
    playClickSound();
    const existingKots = orders[tableId]?.kots || [];
    if (cart.length === 0 && existingKots.length === 0) {
       alert("Cannot generate bill for an empty table!");
       return;
    }
    if (total <= 0) {
       alert("Bill amount cannot be zero!");
       return;
    }

    if (isPaid) {
       settleOrder(tableId, paymentMode);
    } else {
       saveOrder(tableId);
    }
    
    if (isPrint) {
      const orderData = orders[tableId];
      if (orderData || cart.length > 0) {
        printBillReceipt(
          { ...orderData, cart }, 
          { name: tableInfo.name }, 
          { total, subTotal, tax, discount, orderType, billerName: user?.name }
        );
      }
    }
    navigate('/pos/tables');
  };

  const handleHold = () => {
    playClickSound();
    holdOrder(tableId);
    navigate('/pos/tables');
  };

  const handleClearTable = () => {
    playClickSound();
    if (window.confirm("Are you sure you want to mark this table as empty?")) {
      clearTable(tableId);
      navigate('/pos/tables');
    }
  };
  
  const handleDownloadBillAndKOT = () => {
    playClickSound();
    const orderData = orders[tableId];
    if (!orderData && cart.length === 0) {
      alert("No active order data to download!");
      return;
    }
    downloadBillAndKOT(
      { ...orderData, cart }, 
      { name: tableInfo.name }, 
      { total, subTotal, tax, discount, orderType, billerName: user?.name }
    );
  };

  return (
    <div className="h-screen bg-[#F4F4F7] flex flex-col font-sans text-gray-800 overflow-hidden">
      <PosTopNavbar />
      {/* ... (rest of JSX) */}

      <div className="flex-1 flex overflow-hidden">
        {/* 1. Categories Sidebar (Left - 12%) */}
        <div className="w-[12%] bg-[#6D6D6D] flex flex-col shrink-0">
          <button className="bg-[#E1261C] text-white p-3 flex items-center justify-between font-bold text-xs uppercase tracking-wider">
            <span>{POS_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Menu'}</span>
            <ChevronDown size={14} />
          </button>
          
          <div className="flex-1 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                   playClickSound();
                   setSelectedCategory(cat.id);
                }}
                className={`w-full p-4 text-left font-bold text-[11px] uppercase tracking-wider border-b border-white/10 transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-white text-gray-800 border-r-4 border-r-[#E1261C]' 
                    : 'text-white hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Menu Items Area (Middle - 48%) */}
        <div className="flex-1 flex flex-col bg-[#E0E0E0] border-r border-gray-300">
          {/* Top Search Bars */}
          <div className="p-2 flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search Item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-gray-400 rounded-md text-sm font-bold placeholder:text-gray-300 focus:outline-none"
              />
            </div>
            <div className="w-[40%]">
              <input 
                type="text"
                placeholder="Short Code"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                onKeyDown={handleShortCodeSubmit}
                className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-md text-sm font-bold placeholder:text-gray-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white p-3 rounded-sm shadow-sm border border-gray-300 text-left transition-all hover:shadow-md flex items-center relative group min-h-[70px]"
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"
                    style={{ backgroundColor: categories.find(c => c.id === item.catId)?.color || '#4CAF50' }}
                  />
                  <div className="flex flex-col ml-2 overflow-hidden">
                    <span className="text-[11px] font-bold text-gray-700 leading-tight truncate">{item.name}</span>
                    <span className="text-[10px] font-black text-orange-600 mt-1">₹{item.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Order Summary & Controls (Right - 40%) */}
        <div className="w-[40%] flex flex-col bg-white shrink-0">
          {/* Top Tabs */}
          <div className="flex h-12 shrink-0">
            <button 
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 font-bold text-sm flex items-center justify-center transition-all ${orderType === 'dine-in' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
            >
              Dine In
            </button>
            <button 
              onClick={() => setOrderType('delivery')}
              className={`flex-1 font-bold text-sm flex items-center justify-center transition-all border-x border-white/10 ${orderType === 'delivery' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
            >
              Delivery
            </button>
            <button 
              onClick={() => setOrderType('pickup')}
              className={`flex-1 font-bold text-sm flex items-center justify-center transition-all ${orderType === 'pickup' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
            >
              Pick Up
            </button>
          </div>

          {/* Table Details Bar */}
          <div className="flex h-12 bg-white border-b border-gray-200 divide-x divide-gray-100 shrink-0">
            <div onClick={playClickSound} className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center">
                <Soup size={18} className="text-gray-400" />
                <span className="text-[10px] font-bold text-[#E1261C] uppercase tracking-tighter">{tableInfo.name}</span>
              </div>
            </div>
            <div onClick={() => { playClickSound(); toggleCustomerSection(); }} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
              <User size={20} className={`${isCustomerSectionOpen ? 'text-[#E1261C]' : 'text-gray-400'} group-hover:text-[#E1261C] transition-colors`} />
            </div>
            <div onClick={() => { playClickSound(); setIsWaiterModalOpen(true); }} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group relative">
              <Users size={20} className={`${selectedWaiter ? 'text-[#E1261C]' : 'text-gray-400'} group-hover:text-[#E1261C] transition-colors`} />
              {selectedWaiter && (
                 <span className="absolute bottom-0.5 text-[8px] font-black text-[#E1261C] uppercase">
                    {selectedWaiter.name.split(' ')[0]}
                 </span>
              )}
            </div>
            <div onClick={playClickSound} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
              <Edit3 size={20} className="text-gray-400 group-hover:text-[#E1261C] transition-colors" />
            </div>
            <div onClick={playClickSound} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
              <Bell size={20} className="text-gray-400 group-hover:text-[#E1261C] transition-colors" />
            </div>
            <div className="flex-1 flex items-center justify-center"></div>
            <div className="w-[20%] bg-[#FFD600] flex items-center justify-center font-bold text-sm shadow-inner">{tableInfo.section}</div>
          </div>

          {/* Customer Details Section (Animated) */}
          <AnimatePresence>
            {isCustomerSectionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white border-b border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="p-4 space-y-2.5">
                   {/* Row: Mobile */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500 w-16 text-right">Mobile:</span>
                      <input 
                        type="text" 
                        value={customer.mobile}
                        onChange={(e) => { playClickSound(); setCustomer({...customer, mobile: e.target.value}); }}
                        className="flex-1 p-1 bg-white border border-gray-200 rounded text-xs font-bold focus:border-[#E1261C] outline-none w-1/3" 
                        placeholder="..."
                      />
                   </div>

                   {/* Row: Name */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500 w-16 text-right">Name:</span>
                      <div className="flex-1 flex items-center gap-3">
                         <input 
                           type="text" 
                           value={customer.name}
                           onChange={(e) => { playClickSound(); setCustomer({...customer, name: e.target.value}); }}
                           className="flex-1 p-1 bg-white border border-gray-200 rounded text-xs font-bold focus:border-[#E1261C] outline-none" 
                         />
                         <div className="flex items-center gap-1.5 opacity-60">
                            <FileText size={16} className="text-gray-400 hover:text-[#E1261C] cursor-pointer" onClick={playClickSound} />
                            <Save size={16} className="text-gray-400 hover:text-[#E1261C] cursor-pointer" onClick={playClickSound} />
                            <ClipboardList size={16} className="text-gray-400 hover:text-[#E1261C] cursor-pointer" onClick={playClickSound} />
                            <Wallet size={16} className="bg-cyan-500 text-white rounded p-0.5" onClick={playClickSound} />
                            <Trash2 size={16} className="text-gray-300 hover:text-[#E1261C] cursor-pointer" onClick={playClickSound} />
                         </div>
                      </div>
                   </div>

                   {/* Row: Add (Address) */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500 w-16 text-right">Add:</span>
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={customer.address}
                          onChange={(e) => { playClickSound(); setCustomer({...customer, address: e.target.value}); }}
                          className="w-full p-1 bg-white border border-gray-200 rounded text-xs font-bold focus:border-[#E1261C] outline-none" 
                        />
                        {customer.address && <X size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer" onClick={() => { playClickSound(); setCustomer({...customer, address: ''}); }} />}
                      </div>
                   </div>

                   {/* Row: Locality */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500 w-16 text-right">Locality:</span>
                      <input 
                        type="text" 
                        value={customer.locality}
                        onChange={(e) => { playClickSound(); setCustomer({...customer, locality: e.target.value}); }}
                        className="flex-1 p-1 bg-white border border-gray-200 rounded text-xs font-bold focus:border-[#E1261C] outline-none" 
                      />
                   </div>

                   {/* Row: Extra Information */}
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500 w-16 text-right">Extra Info:</span>
                      <input 
                        type="text" 
                        value={customer.extra}
                        onChange={(e) => { playClickSound(); setCustomer({...customer, extra: e.target.value}); }}
                        className="flex-1 p-1 bg-white border border-gray-200 rounded text-xs font-bold focus:border-[#E1261C] outline-none" 
                      />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Column Headers */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center text-[10px] font-bold text-gray-400 tracking-wider">
            <span className="w-[45%]">ITEMS</span>
            <span className="w-[25%] text-center uppercase">CHECK ITEMS</span>
            <span className="w-[15%] text-center uppercase">QTY.</span>
            <span className="w-[15%] text-right uppercase">PRICE</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* 1. Placed KOTs (History) */}
            {orders[tableId]?.kots?.map((kot) => (
              <div key={kot.id}>
                 <div className="bg-[#616161] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                    <span>KOT - {kot.id} Time - {kot.time}</span>
                 </div>
                 {kot.items.map(item => (
                   <CartItem key={`${kot.id}-${item.id}`} item={item} isPlaced={true} />
                 ))}
              </div>
            ))}

            {/* 2. New KOT (Items currently being added) */}
            {cart.length > 0 && (
              <div>
                 <div className="bg-[#BDBDBD] text-gray-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">
                    NEW KOT
                 </div>
                 {cart.map(item => (
                   <CartItem 
                     key={`new-${item.id}`} 
                     item={item} 
                     isPlaced={false} 
                     onRemove={() => removeFromCart(item.id)}
                     onUpdateQty={(delta) => updateQuantity(item.id, delta)}
                   />
                 ))}
              </div>
            )}

            {/* Empty State */}
            {(!orders[tableId]?.kots?.length && cart.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 p-8">
                <p className="font-bold text-sm text-gray-400">No Item Selected</p>
                <p className="text-[10px] text-gray-300">Please Select Item from Left Menu Item</p>
                <div className="w-16 h-16 opacity-10">
                   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8h2.5V2c-2.76 0-5 2.24-5 4z"/></svg>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Area (Sticky) */}
          <div className="bg-[#424242] shrink-0 flex flex-col relative">
            {/* Arrow Extender Tab (Now for Extra Menu) */}
            <button 
              onClick={() => { playClickSound(); setIsExtraMenuOpen(!isExtraMenuOpen); }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#424242] text-white p-1 rounded-t-md border-t border-x border-white/10 hover:brightness-125 transition-all shadow-lg z-20 flex items-center justify-center w-8 h-4"
            >
              <ChevronUp size={14} className={`transition-transform duration-300 ${isExtraMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Extra Menu (Summary Panel Revealed by Extender) */}
            <AnimatePresence>
              {isExtraMenuOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#424242] border-b border-white/10 overflow-hidden z-10"
                >
                  <div className="flex flex-col text-white/90 text-[11px] font-bold divide-y divide-white/5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    {/* Sub Total */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Sub Total</span>
                      <span className="text-gray-300 ml-auto mr-12">{totalItemCount}</span>
                      <span className="tabular-nums font-black">{subTotal.toFixed(2)}</span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Discount</span>
                        <button 
                          onClick={() => { playClickSound(); setIsDiscountModalOpen(true); }} 
                          className="text-[#00BCD4] underline underline-offset-2 hover:text-[#E1261C] text-[10px]"
                        >
                          More
                        </button>
                      </div>
                      <span className="tabular-nums text-gray-400">({(discount + bogoDiscount).toFixed(2)})</span>
                    </div>

                    {/* Delivery Charge */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Delivery Charge</span>
                      <input 
                        type="number" 
                        value={deliveryCharge || ''}
                        placeholder="0"
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#00BCD4] outline-none font-black tabular-nums"
                      />
                    </div>

                    {/* Container Charges */}
                    <div className="flex items-center justify-between px-4 py-2.5 group">
                      <div className="flex items-center gap-2">
                        <Plus size={12} className="text-gray-500 border border-gray-500 rounded-full p-0.5" />
                        <span className="text-gray-400">Container Charges</span>
                      </div>
                      <input 
                        type="number" 
                        value={containerCharge || ''}
                        placeholder="0"
                        onChange={(e) => setContainerCharge(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#00BCD4] outline-none font-black tabular-nums"
                      />
                    </div>

                    {/* Service Charge */}
                    <div className="flex items-center justify-between px-4 py-2.5 group">
                      <div className="flex items-center gap-2">
                         <div className="rotate-45 text-gray-400"><RefreshCw size={12} strokeWidth={3} /></div>
                         <span className="text-gray-400">Service Charge</span>
                      </div>
                      <input 
                        type="number" 
                        value={serviceCharge || ''}
                        placeholder="0"
                        onChange={(e) => setServiceCharge(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#00BCD4] outline-none font-black tabular-nums"
                      />
                    </div>

                    {/* Tax */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                         <span className="text-gray-400">Tax</span>
                          <button 
                            onClick={() => { playClickSound(); setIsTaxModalOpen(true); }} 
                            className="text-[#00BCD4] underline underline-offset-2 hover:text-[#E1261C] text-[10px]"
                          >
                            More
                          </button>
                      </div>
                      <span className="tabular-nums">{tax.toFixed(2)}</span>
                    </div>

                    {/* Round Off */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Round Off</span>
                      <span className="tabular-nums">{roundOff < 0 ? roundOff.toFixed(2) : `+${roundOff.toFixed(2)}`}</span>
                    </div>

                    {/* Customer Paid */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Customer Paid</span>
                      <input 
                        type="number" 
                        value={customerPaid || ''}
                        placeholder="0"
                        onChange={(e) => setCustomerPaid(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#00BCD4] outline-none font-black tabular-nums"
                      />
                    </div>

                    {/* Return to Customer */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Return to Customer</span>
                      <input 
                        type="number" 
                        value={manualReturnAmount || ''}
                        placeholder="0.00"
                        onChange={(e) => setManualReturnAmount(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#2EB886] outline-none font-black tabular-nums text-[#2EB886]"
                      />
                    </div>

                    {/* Tip */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-gray-400">Tip</span>
                      <input 
                        type="number" 
                        value={tipAmount || ''}
                        placeholder="0.00"
                        onChange={(e) => setTipAmount(e.target.value)}
                        className="bg-[#555555] border-none rounded w-16 px-2 py-1 text-right text-xs focus:ring-1 focus:ring-[#00BCD4] outline-none font-black tabular-nums text-[#00BCD4]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FIXED ROWS (Row 1-3) */}
            <div className="p-2 flex flex-col gap-2">
              {/* Row 1: Promo / Split / Return */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { playClickSound(); setIsBogoActive(!isBogoActive); }}
                  className={`${isBogoActive ? 'bg-[#4E342E]' : 'bg-[#E1261C]'} text-white px-3 py-1.5 rounded-sm font-bold text-[10px] uppercase transition-colors`}
                >
                  Bogo Offer
                </button>
                <button 
                  onClick={() => { playClickSound(); setIsSplitModalOpen(true); }}
                  className={`${isSplitActive ? 'bg-[#4E342E]' : 'bg-[#E1261C]'} text-white px-3 py-1.5 rounded-sm font-bold text-[10px] uppercase transition-colors`}
                >
                  Split
                </button>
                <label className="flex items-center gap-1.5 ml-1 cursor-pointer select-none">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded-sm" 
                     checked={isSalesReturn}
                     onChange={(e) => { playClickSound(); setIsSalesReturn(e.target.checked); }}
                   />
                   <span className="text-white font-bold text-[10px] uppercase tracking-tighter">Sales Return</span>
                </label>
                
                <div className="ml-auto bg-[#FFD600] text-[#424242] px-3 py-1 flex items-center gap-2 rounded-sm shadow-inner">
                   <div className="bg-[#E1261C] text-white p-0.5 rounded-full"><Receipt size={10} strokeWidth={3} /></div>
                   <span className="text-[10px] font-bold uppercase">Total</span>
                   <span className="text-base font-black italic tracking-tighter">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Row 2: Payment Methods */}
              <div className="flex items-center justify-between px-2 py-1 border-y border-white/5">
                {['Cash', 'Card', 'Due', 'Other', 'Part'].map(method => (
                  <label key={method} className="flex items-center gap-1.5 cursor-pointer group">
                     <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 flex items-center justify-center p-0.5">
                        <div className={`w-full h-full rounded-full ${paymentMode === method ? 'bg-white' : 'group-hover:bg-white/10'}`} />
                     </div>
                     <input 
                       type="radio" 
                       className="hidden" 
                       name="payment" 
                       value={method} 
                       checked={paymentMode === method}
                       onChange={() => { 
                         playClickSound(); 
                         setPaymentMode(method);
                         if (method === 'Other') setIsOtherPaymentModalOpen(true);
                       }}
                     />
                     <span className={`font-bold text-[10px] transition-colors ${paymentMode === method ? 'text-white' : 'text-white/60'}`}>{method}</span>
                  </label>
                ))}
              </div>

              {/* Row 3: Options */}
              <div className="flex items-center gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded-sm font-bold border-2" 
                     checked={isPaid}
                     onChange={(e) => { playClickSound(); setIsPaid(e.target.checked); }}
                   />
                   <span className="text-white font-bold text-[10px] uppercase tracking-tighter transition-all">It's Paid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded-sm accent-[#E1261C] border-2" 
                     checked={isLoyalty}
                     onChange={(e) => { playClickSound(); setIsLoyalty(e.target.checked); }}
                   />
                   <span className="text-white font-bold text-[10px] uppercase tracking-tighter transition-all">Loyalty</span>
                </label>
                <button 
                  onClick={() => { playClickSound(); alert('Virtual Wallet Activated'); }}
                  className="flex items-center gap-2 hover:bg-white/5 p-1 rounded transition-colors group active:scale-95"
                >
                   <div className="bg-[#FF9800] text-white p-1 rounded-sm shadow-sm"><Zap size={10} fill="currentColor" /></div>
                   <span className="text-white font-bold text-[10px] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Virtual Wallet</span>
                </button>
              </div>
            </div>

            {/* Always Visible Action Buttons (Row 4) */}
            <div className="grid grid-cols-6 gap-1 p-2 border-t border-white/5">
              <ActionButton onClick={() => handleSave(false)} label="Save" color="bg-[#E1261C]" />
              <ActionButton onClick={() => handleSave(true)} label="Save & Print" color="bg-[#E1261C]" />
              <ActionButton onClick={() => { playClickSound(); alert('Digital Bill Sent!'); handleSave(false); }} label="Save & eBill" color="bg-[#E1261C]" />
              <ActionButton onClick={() => handleKOT(false)} label="KOT" color="bg-white" textColor="text-gray-800" />
              <ActionButton onClick={() => handleKOT(true)} label="KOT & Print" color="bg-[#546E7A]" />
              <ActionButton onClick={handleHold} label="Hold" color="bg-white" textColor="text-gray-800" />
              <ActionButton 
                onClick={handleClearTable} 
                label="Clear Table" 
                color={orders[tableId]?.status === 'paid' ? "bg-emerald-600" : "bg-gray-100"} 
                textColor={orders[tableId]?.status === 'paid' ? "text-white" : "text-gray-400"} 
              />
              {(orderType === 'pickup' || orderType === 'takeaway') && (
                <ActionButton 
                  onClick={handleDownloadBillAndKOT} 
                  label="Download Bill + KOT" 
                  color="bg-[#00BCD4]" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Waiter Selection Modal */}
      <AnimatePresence>
        {isWaiterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWaiterModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Assign to</span>
                <button 
                  onClick={() => { playClickSound(); setIsWaiterModalOpen(false); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* List */}
              <div className="py-2">
                {MOCK_WAITERS.map((waiter) => (
                  <button
                    key={waiter.id}
                    onClick={() => { playClickSound(); setSelectedWaiter(waiter); }}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 group border-b border-gray-50 last:border-0"
                  >
                    <span className={`text-[13px] font-bold ${selectedWaiter?.id === waiter.id ? 'text-gray-900' : 'text-gray-500'}`}>
                      {waiter.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedWaiter?.id === waiter.id ? 'border-[#E1261C] bg-[#E1261C]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                      {selectedWaiter?.id === waiter.id && (
                        <Check size={12} strokeWidth={4} className="text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-end gap-3 bg-gray-50/50 border-t border-gray-100 mt-2">
                <button 
                  onClick={() => { playClickSound(); setIsWaiterModalOpen(false); }}
                  className="px-5 py-2 text-sm font-bold border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors bg-white shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { playClickSound(); setIsWaiterModalOpen(false); }}
                  className="px-8 py-2 text-sm font-bold bg-[#E1261C] text-white rounded hover:bg-red-700 transition-colors shadow-md shadow-stone-900/20"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {isDiscountModalOpen && (
          <AppliedDiscountModal 
            onClose={() => setIsDiscountModalOpen(false)}
            onSave={(val, type, reason) => {
               setDiscount(Number(val));
               setDiscountType(type);
               setDiscountReason(reason);
               setIsDiscountModalOpen(false);
            }}
            currentVal={discount}
            currentType={discountType}
            currentReason={discountReason}
          />
        )}
      </AnimatePresence>

      {/* Split Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <SplitBillModal 
            onClose={() => setIsSplitModalOpen(false)}
            total={total}
            currentPayments={splitPayments}
            onConfirm={(payments) => {
               setSplitPayments(payments);
               setIsSplitActive(payments.length > 0);
               setIsSplitModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Other Payment Type Modal */}
      <AnimatePresence>
        {isOtherPaymentModalOpen && (
          <OtherPaymentModal 
            onClose={() => setIsOtherPaymentModalOpen(false)}
            onSave={(details) => {
              setOtherPaymentDetails(details);
              setIsOtherPaymentModalOpen(false);
            }}
            currentDetails={otherPaymentDetails}
          />
        )}
      </AnimatePresence>

      {/* Applied Tax Modal */}
      <AnimatePresence>
        {isTaxModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-gray-800">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaxModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden font-sans border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Applied Tax</span>
                <button 
                  onClick={() => { playClickSound(); setIsTaxModalOpen(false); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Table Body */}
              <div className="p-4">
                <div className="bg-[#424242] text-white px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest rounded-t-sm">
                  <span className="w-2/3 text-center">Tax</span>
                  <span className="w-1/3 text-center">Amount</span>
                </div>
                <div className="border-x border-b border-gray-100 divide-y divide-gray-50">
                  {appliedTaxes.map((taxItem, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 group hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-3 w-2/3">
                          <button className="text-gray-200 group-hover:text-red-400 transition-colors">
                             <X size={14} className="border border-current rounded-full p-0.5" />
                          </button>
                          <span className="text-[11px] font-bold text-gray-700">
                             {taxItem.base.toFixed(2)}@ {taxItem.name} {taxItem.rate}%
                          </span>
                       </div>
                       <span className="w-1/3 text-right text-[11px] font-black text-gray-800 tabular-nums">
                         {taxItem.amount.toFixed(2)}
                       </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-end bg-gray-50/50">
                 <button 
                   onClick={() => setIsTaxModalOpen(false)}
                   className="px-6 py-2 border border-gray-300 rounded text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm active:scale-95 transition-all outline-none"
                 >
                    Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Support Components
function CartItem({ item, isPlaced, onRemove, onUpdateQty }) {
  return (
    <div className={`px-3 py-2 border-b border-gray-100 flex items-center text-[11px] font-bold animate-in fade-in slide-in-from-right-2 duration-200 group ${isPlaced ? 'bg-gray-50/50' : 'bg-white'}`}>
      <div className="w-5 mr-2 shrink-0">
        {!isPlaced && (
          <button 
            onClick={onRemove}
            className="w-5 h-5 rounded-full bg-[#E1261C] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          >
            <Plus size={12} className="rotate-45" strokeWidth={4} />
          </button>
        )}
      </div>

      <div className="w-[35%]">
        <span className={`leading-tight ${isPlaced ? 'text-gray-400' : 'text-gray-700 underline decoration-gray-300 underline-offset-2'}`}>
          {item.name}
        </span>
      </div>

      <div className="w-[45%] flex items-center justify-center gap-2">
        {!isPlaced && (
          <button 
            onClick={() => onUpdateQty(-1)}
            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm text-gray-600 hover:bg-gray-50 active:scale-90 transition-all font-black"
          >
            <Minus size={12} strokeWidth={4} />
          </button>
        )}
        <div className={`h-6 flex items-center justify-center rounded px-3 ${isPlaced ? 'bg-transparent text-gray-400' : 'bg-white border border-gray-300 shadow-inner'}`}>
          <span className="text-[11px] font-bold">{item.quantity}</span>
        </div>
        {!isPlaced && (
          <button 
            onClick={() => onUpdateQty(1)}
            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm text-gray-600 hover:bg-gray-50 active:scale-90 transition-all font-black"
          >
            <Plus size={12} strokeWidth={4} />
          </button>
        )}
      </div>

      <div className="w-[15%] text-right shrink-0">
        <span className={`text-[11px] ${isPlaced ? 'text-gray-400' : 'text-gray-800'}`}>
          {(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, color, textColor = "text-white" }) {
  return (
    <button
      onClick={() => { playClickSound(); onClick(); }}
      className={`${color} ${textColor} py-2.5 rounded-sm font-black text-[9px] uppercase shadow-sm active:scale-95 transition-all text-center leading-tight px-1 hover:brightness-110 flex items-center justify-center min-h-[42px] border border-black/5`}
    >
      {label}
    </button>
  );
}

function AppliedDiscountModal({ onClose, onSave, currentVal, currentType, currentReason }) {
  const [val, setVal] = useState(currentVal);
  const [type, setType] = useState(currentType);
  const [reason, setReason] = useState(currentReason);
  const [coupon, setCoupon] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded shadow-2xl overflow-hidden font-sans border border-gray-100"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm font-black text-gray-700 uppercase tracking-tight">Applied Discount</span>
          <button onClick={() => { playClickSound(); onClose(); }} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-tight">Custom Discount</span>
                <button className="text-[10px] font-bold text-red-500">Add More</button>
             </div>
             <input 
               type="text" 
               placeholder="Reason"
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="w-full text-xs p-2 border border-gray-200 rounded outline-none"
             />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <button onClick={() => setType('percentage')} className={`text-xs font-bold ${type === 'percentage' ? 'text-gray-900 underline underline-offset-4' : 'text-gray-400'}`}>Percentage</button>
                   <button onClick={() => setType('fixed')} className={`text-xs font-bold ${type === 'fixed' ? 'text-gray-900 underline underline-offset-4' : 'text-gray-400'}`}>Fixed</button>
                </div>
                <input 
                  type="number" 
                  value={val || ''}
                  onChange={(e) => setVal(Number(e.target.value))}
                  className="w-16 p-2 text-right border border-gray-200 rounded text-xs font-black" 
                />
             </div>
          </div>
          <div className="space-y-3">
             <span className="text-[11px] font-black text-gray-500 uppercase tracking-tight">Coupon Code</span>
             <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 text-xs p-2 border border-gray-200 rounded"
                  placeholder="Enter code"
                />
                <button className="bg-[#2EB886] text-white px-5 py-2 rounded text-[10px] font-black uppercase">Apply</button>
             </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
           <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded">Cancel</button>
           <button onClick={() => onSave(val, type, reason)} className="px-10 py-2 text-xs font-bold text-white bg-[#E1261C] rounded shadow-md">Save</button>
        </div>
      </motion.div>
    </div>
  );
}
function SplitBillModal({ onClose, total, onConfirm, currentPayments }) {
  const [payments, setPayments] = useState(currentPayments.length > 0 ? currentPayments : [{ method: 'Cash', amount: total }]);
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [amountInput, setAmountInput] = useState('');

  const methods = ['Cash', 'Card', 'UPI', 'Wallet', 'Other'];
  
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = total - totalPaid;

  const addPayment = () => {
    playClickSound();
    const amt = Number(amountInput);
    if (!amt || amt <= 0) return;
    
    setPayments([...payments, { method: selectedMethod, amount: amt }]);
    setAmountInput('');
  };

  const removePayment = (index) => {
    playClickSound();
    setPayments(payments.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden font-sans"
      >
        <div className="bg-[#424242] p-4 flex items-center justify-between text-white">
          <span className="text-sm font-black uppercase tracking-widest">Split Payment</span>
          <button onClick={() => { playClickSound(); onClose(); }}><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Bill</span>
                <span className="text-xl font-black text-gray-800 tabular-nums">₹{total.toFixed(2)}</span>
             </div>
             <div className={`flex flex-col p-3 rounded-lg border ${remaining > 0 ? 'bg-orange-50 border-orange-100' : (remaining === 0 ? 'bg-green-50 border-green-100' : 'bg-stone-50 border-red-100')}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Remaining</span>
                <span className={`text-xl font-black tabular-nums ${remaining > 0 ? 'text-orange-600' : (remaining === 0 ? 'text-green-600' : 'text-red-600')}`}>₹{remaining.toFixed(2)}</span>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex gap-2">
                <select 
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#E1261C] transition-all"
                >
                   {methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input 
                  type="number"
                  placeholder="Amount"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-32 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#E1261C] transition-all text-right"
                />
                <button 
                  onClick={addPayment}
                  className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition-all"
                >
                  <Plus size={20} />
                </button>
             </div>

             <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group border border-transparent hover:border-gray-200 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                           <Wallet size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-black text-gray-700">{p.method}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-black tabular-nums">₹{Number(p.amount).toFixed(2)}</span>
                        <button onClick={() => removePayment(i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                           <X size={16} strokeWidth={3} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
           <button 
             onClick={() => { playClickSound(); onConfirm([]); }}
             className="flex-1 py-3 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
           >
             Reset All
           </button>
           <button 
             disabled={remaining !== 0}
             onClick={() => { playClickSound(); onConfirm(payments); }}
             className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-md transition-all ${remaining === 0 ? 'bg-[#2EB886] text-white shadow-green-100 hover:brightness-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
           >
             Confirm Split
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function OtherPaymentModal({ onClose, onSave, currentDetails }) {
  const [details, setDetails] = useState(currentDetails);
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden font-sans border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[13px] font-black text-gray-700 uppercase tracking-wide">Other Payment Type</span>
          <button 
            onClick={() => { playClickSound(); onClose(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Other Payment Type</label>
              <select 
                value={details.type}
                onChange={(e) => setDetails({ ...details, type: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded p-2.5 text-xs font-black text-gray-700 outline-none focus:ring-1 focus:ring-[#E1261C]"
              >
                  <option value="UPI">UPI</option>
                  <option value="Paytm">Paytm</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Voucher">Voucher</option>
              </select>
           </div>

           <div className="space-y-2">
              <textarea 
                rows={3}
                placeholder="Details (Optional)"
                value={details.note}
                onChange={(e) => setDetails({ ...details, note: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded p-3 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-[#E1261C] resize-none"
              />
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-3 border-t border-gray-50">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 border border-gray-200 rounded text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 active:scale-95 transition-all outline-none"
           >
              No
           </button>
           <button 
             onClick={() => { playClickSound(); onSave(details); }}
             className="px-8 py-2.5 bg-[#C62828] text-white rounded text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
           >
              Yes
           </button>
        </div>
      </motion.div>
    </div>
  );
}
