import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Plus, Minus, Trash2, Receipt, ArrowLeft,
  ChevronDown, User, Users, Edit3, Bell,
  ChevronUp, Star, Wine, Soup, Apple, Zap, RefreshCw,
  Save, Printer, FileText, Send, PauseCircle, Split,
  Ticket, Wallet, CheckCircle2, ShoppingBag, Truck, X, Check, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePos } from '../../context/PosContext';
import { printKOTReceipt } from '../../utils/printKOT';
import { printBillReceipt } from '../../utils/printBill';
import { downloadBillAndKOT } from '../../utils/printCombined';
import { playClickSound } from '../../utils/sounds';

export default function PosOrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    placeKOT, markKOTPrinted, saveOrder, holdOrder, settleOrder, clearTable, cancelKOTItem, applyOrderDiscount,
    orders, carOrders, pickupOrders, isCustomerSectionOpen, toggleCustomerSection, user, calculateTaxes, storeSettings,
    categories, menuItems, combos, replacements, tables, sections, staff
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState('fav');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortCode, setShortCode] = useState('');

  // Set initial selected category
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === 'fav') {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const isPickupMode = location.state?.fromPickup === true || tableId?.startsWith('PU-');
  const isCarServiceMode = location.state?.fromCarService === true;
  const [orderType, setOrderType] = useState(
    isPickupMode ? 'pickup' : isCarServiceMode ? 'car-service' : 'dine-in'
  );

  // Initialize cart from existing order if any
  const activeOrder = isPickupMode ? pickupOrders[tableId] : (isCarServiceMode ? carOrders[tableId] : orders[tableId]);
  const [cart, setCart] = useState([]);

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
  const [selectedWaiter, setSelectedWaiter] = useState(() => {
    if (location.state?.waiter) return location.state.waiter;
    return null;
  });
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
  const [orderNotice, setOrderNotice] = useState(null);

  // Dish Variant Selection State
  const [variantModalItem, setVariantModalItem] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({}); // groupId -> variantOptionId

  // Customer Section States
  const [customer, setCustomer] = useState({
     mobile: '',
     name: '',
     address: '',
     locality: '',
     extra: ''
  });

  const draftStorageKey = useMemo(() => `pos_draft_${orderType}_${tableId}`, [orderType, tableId]);

  const buildCustomerPayload = () => ({
    name: customer.name?.trim() || '',
    mobile: customer.mobile?.trim() || '',
    address: customer.address?.trim() || '',
    locality: customer.locality?.trim() || '',
    extra: customer.extra?.trim() || ''
  });

  const clearDraft = () => {
    sessionStorage.removeItem(draftStorageKey);
  };

  const persistOrderMeta = async () => {
    const staffId = selectedWaiter?._id || selectedWaiter?.id;
    return holdOrder(tableId, {
      isCarOrder: isCarServiceMode,
      isPickupOrder: isPickupMode,
      orderType: orderType === 'car-service' ? 'CAR-SERVICE' : orderType.toUpperCase(),
      staffId,
      customer: buildCustomerPayload()
    });
  };

  // Sync waiter and order data from shared context
  useEffect(() => {
    if (activeOrder) {
        if (activeOrder.waiter) {
           setSelectedWaiter(activeOrder.waiter);
        }
       if (activeOrder.customer) {
          setCustomer({
            mobile: activeOrder.customer.phone || '',
            name: activeOrder.customer.name || '',
            address: activeOrder.customer.address || '',
            locality: activeOrder.customer.locality || '',
            extra: activeOrder.customer.notes || ''
          });
       }
    }
  }, [activeOrder]);

  // Reset cart/states when ID changes (important for next-customer flow)
  useEffect(() => {
    setCart([]);
    setSearchQuery('');
    setShortCode('');
  }, [tableId]);

  useEffect(() => {
    const rawDraft = sessionStorage.getItem(draftStorageKey);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      if (Array.isArray(draft.cart)) setCart(draft.cart);
      if (draft.customer) setCustomer(prev => ({ ...prev, ...draft.customer }));
      if (draft.selectedWaiter) setSelectedWaiter(draft.selectedWaiter);
    } catch (error) {
      console.error('Unable to restore POS draft:', error);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    const customerPayload = buildCustomerPayload();
    const hasDraftCart = cart.length > 0;
    const hasCustomerDraft = Object.values(customerPayload).some(Boolean);
    const hasWaiterDraft = !!(selectedWaiter?.id || selectedWaiter?._id);

    if (!hasDraftCart && !hasCustomerDraft && !hasWaiterDraft) {
      sessionStorage.removeItem(draftStorageKey);
      return;
    }

    sessionStorage.setItem(draftStorageKey, JSON.stringify({
      cart,
      customer,
      selectedWaiter,
      updatedAt: new Date().toISOString()
    }));
  }, [draftStorageKey, cart, customer, selectedWaiter]);

  // Find table details
  const tableInfo = useMemo(() => {
    if (!tableId) return { name: tableId, section: 'AC' };
    const matchedTable = tables.find(t => t.id === tableId || t._id === tableId);
    if (matchedTable) {
      const matchedSection = sections.find(section => section.id === matchedTable.sectionId);
      return { name: matchedTable.name, section: matchedSection?.label || matchedTable.sectionId || 'AC' };
    }
    if (isPickupMode) return { name: tableId, section: 'PICKUP' };
    if (isCarServiceMode) return { name: tableId, section: 'CAR SERVICE' };
    return { name: tableId, section: 'AC' };
  }, [tableId, tables, sections, isPickupMode, isCarServiceMode]);

  const filteredItems = useMemo(() => {
    return (menuItems || []).filter(item => {
      const query = searchQuery.toLowerCase();
      const codeQuery = shortCode.toLowerCase();

      const matchesSearch = (item.name || '').toLowerCase().includes(query) ||
                           (item.code || '').toLowerCase().includes(query);

      const matchesShortCode = shortCode === '' ||
                              (item.code || '').toLowerCase() === codeQuery ||
                              (item.shortcut || '').toLowerCase() === codeQuery;

      const matchesCategory = (shortCode !== '' || searchQuery !== '')
        ? true
        : (String(selectedCategory).toLowerCase() === 'fav'
            ? true
            : String(item.catId).toLowerCase() === String(selectedCategory).toLowerCase());

      return matchesCategory && matchesSearch && matchesShortCode;
    });
  }, [selectedCategory, searchQuery, shortCode, menuItems]);

  const displayCategories = useMemo(() => {
    return [
      ...(categories || []),
      { id: 'combos', name: 'Combo Meals', color: '#009688' }
    ];
  }, [categories]);

  const displayItems = useMemo(() => {
    const now = new Date();
    
    // Helper to find replacement
    const getReplacement = (itemId) => {
      return (replacements || []).find(r => 
        r.originalDishId === itemId && 
        new Date(r.startDate) <= now && 
        new Date(r.endDate) >= now
      );
    };

    if (selectedCategory === 'combos') {
      const query = searchQuery.toLowerCase();
      const codeQuery = shortCode.toLowerCase();

      return (combos || [])
        .filter(c => c.active)
        .map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
          code: c.code || 'COMBO',
          catId: 'combos',
          status: 'Available',
          itemModel: 'Combo',
          variantGroups: [],
          elements: c.elements
        }))
        .filter(c => {
          const matchesSearch = c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
          const matchesShortCode = shortCode === '' || c.code.toLowerCase() === codeQuery;
          return matchesSearch && matchesShortCode;
        });
    }

    // Map through filteredItems and substitute if active rule exists
    return filteredItems.map(item => {
      const activeRep = getReplacement(item.id);
      if (activeRep) {
        // Find replacement menu item
        const repItem = menuItems.find(i => i.id === activeRep.replacementDishId);
        if (repItem) {
          return {
            ...repItem,
            isSubstituted: true,
            originalName: item.name
          };
        }
      }
      return item;
    });
  }, [selectedCategory, combos, filteredItems, menuItems, replacements, searchQuery, shortCode]);

  const addToCart = (item) => {
    playClickSound();

    const assignedVariantGroups = item.variantGroups || [];
    if (assignedVariantGroups.length > 0) {
      setVariantModalItem(item);
      setSelectedVariants({});
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const confirmVariantSelection = () => {
    if (!variantModalItem) return;

    const assignedMapping = (variantModalItem.variantGroups || []).map(g => ({ groupId: g._id || g.id, ...g }));
    const missingRequired = assignedMapping.find(m => m.required && !selectedVariants[m.groupId]);

    if (missingRequired) {
       const groupName = variantModalItem.variantGroups?.find(g => (g._id || g.id) === missingRequired.groupId)?.name || '';
       window.alert(`Please select a ${groupName}`);
       return;
    }

    let finalPrice = variantModalItem.price;
    const selectedVariantDetails = [];

    Object.entries(selectedVariants).forEach(([groupId, optionId]) => {
       const group = variantModalItem.variantGroups?.find(g => (g._id || g.id) === groupId);
       const option = group?.options.find(o => (o._id || o.id) === optionId);
       if (option) {
          if (option.priceType === 'fixed') {
             finalPrice = (option.priceValue !== undefined ? option.priceValue : (option.price || 0));
          } else {
             finalPrice += (option.priceValue !== undefined ? option.priceValue : (option.price || 0));
          }
          selectedVariantDetails.push({
             groupName: group.name,
             optionName: option.name,
             price: (option.priceValue !== undefined ? option.priceValue : (option.price || 0)),
             type: option.priceType || 'add-on'
          });
       }
    });

    const itemWithVariants = {
       ...variantModalItem,
       id: `${variantModalItem.id}-${Object.values(selectedVariants).sort().join('-')}`,
       baseId: variantModalItem.id,
       price: finalPrice,
       variants: selectedVariantDetails,
       variantLabel: selectedVariantDetails.map(v => v.optionName).join(', ')
    };

    setCart(prev => {
       const existing = prev.find(i => i.id === itemWithVariants.id);
       if (existing) {
          return prev.map(i => i.id === itemWithVariants.id ? { ...i, quantity: i.quantity + 1 } : i);
       }
       return [...prev, { ...itemWithVariants, quantity: 1 }];
    });

    setVariantModalItem(null);
    setSelectedVariants({});
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

  const { total, subTotal, totalItemCount, tax, appliedTaxes, roundOff, changeToReturn, bogoDiscount, effectiveDiscount } = useMemo(() => {
    const cartItems = cart || [];
    const kotItems = activeOrder?.kots?.flatMap(kot => kot.items.filter(item => item.status !== 'cancelled')) || [];
    const allItems = [...cartItems, ...kotItems];

    const count = allItems.reduce((sum, item) => sum + item.quantity, 0);

    // BOGO LOGIC: Buy 1 Get 1
    let bDiscount = 0;
    if (isBogoActive) {
      allItems.forEach(item => {
        bDiscount += Math.floor(item.quantity / 2) * item.price;
      });
    }

    const sTotal = allItems.reduce((sum, item) => {
      const itemPrice = (item.price * item.quantity);
      const itemDiscount = item.discount?.type === 'PERCENTAGE' 
        ? (itemPrice * (item.discount.value || 0)) / 100 
        : (item.discount?.amount || 0);
      return sum + (itemPrice - itemDiscount);
    }, 0) - bDiscount;

    // Calculate Dynamic Taxes (Reverse calculation)
    const taxesArr = calculateTaxes(sTotal);
    const taxVal = taxesArr.reduce((sum, t) => sum + t.amount, 0);

    // Effective discount from order level
    const orderDiscountAmt = activeOrder?.discount?.amount || Number(discount) || 0;

    // Grand Total is sTotal - orderDiscountAmt
    const grandTotalVal = Math.max(0, sTotal - orderDiscountAmt);

    // Automatic Rounding
    const fTotalWhole = Math.round(grandTotalVal);
    const rOff = Number((fTotalWhole - grandTotalVal).toFixed(2));

    // Change to return
    const cToReturn = Math.max(0, Number(customerPaid) - fTotalWhole);

    return {
      total: fTotalWhole,
      subTotal: sTotal - taxVal, // Base price before tax
      totalItemCount: count,
      tax: taxVal,
      appliedTaxes: taxesArr.map(t => ({ ...t, base: sTotal - taxVal })),
      roundOff: rOff,
      changeToReturn: cToReturn,
      bogoDiscount: bDiscount,
      effectiveDiscount: orderDiscountAmt
    };
  }, [cart, activeOrder, deliveryCharge, containerCharge, serviceCharge, discount, customerPaid, isBogoActive, calculateTaxes]);

  const cartTotal = useMemo(() => {
    const sTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // For inclusive tax, the total is just the sTotal (rounded)
    return Math.round(sTotal);
  }, [cart]);

  // Sync manual return amount with calculated change
  useEffect(() => {
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

  const canPlaceKot = cart.length > 0 && cartTotal > 0;
  const canHoldDraft = cart.length > 0 || !!activeOrder || Object.values(buildCustomerPayload()).some(Boolean);
  const canReprint = !!activeOrder?.billPrinted;
  const canDownloadPickup = !!activeOrder || cart.length > 0;

  // --- ACTIONS ---
  const handleKOT = async (isPrint = false) => {
    playClickSound();
    setOrderNotice(null);
    if (!canPlaceKot) {
       setOrderNotice({ type: 'error', text: 'Add items before placing a KOT.' });
       return;
    }
    if (!isPickupMode && !selectedWaiter) {
       setOrderNotice({ type: 'error', text: 'Select a waiter before placing this order.' });
       return;
    }
    try {
      const savedOrder = await placeKOT(tableId, cart, selectedWaiter, {
        isCarOrder: orderType === 'car-service',
        isPickupOrder: orderType === 'pickup',
        customer: buildCustomerPayload()
      });
      if (isPrint) {
      printKOTReceipt(savedOrder || { items: cart }, { name: tableInfo.name, orderType, billerName: user?.name, waiterName: selectedWaiter?.name });
      await markKOTPrinted(savedOrder || tableId, {
        isCarOrder: orderType === 'car-service',
        isPickupOrder: orderType === 'pickup'
      });
      }

      setCart([]);
      clearDraft();
      setTimeout(() => {
        navigate('/pos/tables');
      }, 1500);
    } catch (error) {
      setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to place KOT.' });
    }
  };

  const handleReprint = () => {
    playClickSound();
    setOrderNotice(null);
    const orderData = activeOrder;
    if (!orderData?.billPrinted) {
      setOrderNotice({ type: 'error', text: 'Bill reprint is available only after the bill has been generated.' });
      return;
    }

    // Calculate totals for existing KOTs (excluding current cart)
    const sTotal = orderData.kots.reduce((sum, kot) => sum + (kot.total || 0), 0);
    const taxesArr = calculateTaxes(sTotal);
    const taxVal = taxesArr.reduce((sum, t) => sum + t.amount, 0);
    const fTotal = Math.round(sTotal + taxVal);

    printBillReceipt(
      orderData,
      { name: tableInfo.name },
      {
        total: fTotal,
        subTotal: sTotal,
        tax: taxVal,
        discount: effectiveDiscount,
        orderType,
        billerName: user?.name,
        appliedTaxes: taxesArr.map(t => ({ ...t, base: sTotal })), storeInfo: storeSettings
      }
    );
  };

  const handleSave = () => {
    playClickSound();
    setOrderNotice(null);
    if (!canHoldDraft) {
      setOrderNotice({ type: 'error', text: 'There is nothing to hold for this order yet.' });
      return;
    }
    persistOrderMeta()
      .catch((error) => {
        setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to save order details.' });
      })
      .finally(() => {
        navigate('/pos/tables');
      });
  };

  const handleClearTable = async () => {
    playClickSound();
    if (window.confirm(`Are you sure you want to cancel the order for ${tableInfo.name}?`)) {
      try {
        await clearTable(tableId, {
          isCarOrder: isCarServiceMode,
          isPickupOrder: isPickupMode
        });
        clearDraft();
        navigate('/pos/tables');
      } catch (error) {
        setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to clear this order.' });
      }
    }
  };

  const handleDownloadBillAndKOT = async () => {
    playClickSound();
    setOrderNotice(null);
    let orderData = activeOrder;
    if (!canDownloadPickup) {
      setOrderNotice({ type: 'error', text: 'Add items or open an active pickup order before downloading the bill.' });
      return;
    }
    if (!isPickupMode && !selectedWaiter) {
      setOrderNotice({ type: 'error', text: 'Select a waiter before preparing the bill.' });
      return;
    }

    try {
      if (isPickupMode && cart.length > 0) {
        const savedOrder = await placeKOT(tableId, cart, selectedWaiter, {
          isPickupOrder: true,
          customer: buildCustomerPayload()
        });
        await markKOTPrinted(savedOrder || tableId, { isPickupOrder: true });
        await saveOrder(savedOrder || tableId, {
          isPickupOrder: true,
          customer: buildCustomerPayload(),
          staffId: selectedWaiter?._id || selectedWaiter?.id
        });
        orderData = savedOrder || orderData;
      }

      // Automatically settle pickup orders immediately after saving
      if (isPickupMode) {
        const finalOrder = orderData || activeOrder;
        if (finalOrder) {
          let finalPaymentMethod = paymentMode;
          if (paymentMode === 'Other') {
            finalPaymentMethod = otherPaymentDetails?.type || 'UPI';
          }
          await settleOrder(finalOrder, finalPaymentMethod, {
            total,
            taxes: appliedTaxes,
            isPickupOrder: true
          });
        }
      }
    } catch (error) {
      setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to process pickup order.' });
      return;
    }

    downloadBillAndKOT(
      { ...orderData, cart },
      { name: tableInfo.name },
      { total, subTotal, tax, discount, orderType, billerName: user?.name }
    );

    // Refresh for next pickup customer (NEW ID for fresh session)
    if (isPickupMode) {
       clearDraft();
       setTimeout(() => {
          const nextPuId = `PU-${Date.now().toString().slice(-6)}`;
          // Use navigate for smoothness, the useEffect above will handle the state reset
          navigate(`/pos/order/${nextPuId}`, { state: { fromPickup: true } });
       }, 500);
    }
  };

  return (
    <div className="h-full bg-[#F4F4F7] flex flex-col font-sans text-gray-800 overflow-hidden">

      <div className="flex-1 flex overflow-hidden">
        {/* 1. Categories Sidebar (Left - 12%) */}
        <div className="w-[12%] bg-[#6D6D6D] flex flex-col shrink-0">
          <button className="bg-[#E1261C] text-white p-3 flex items-center justify-between font-bold text-xs uppercase tracking-wider">
            <span>{displayCategories.find(c => c.id === selectedCategory)?.name || 'Menu'}</span>
            <ChevronDown size={14} />
          </button>
 
          <div className="flex-1 overflow-y-auto">
            {displayCategories.map(cat => (
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
              {displayItems.map(item => {
                const isSoldOut = item.status === 'Out of Stock';
                return (
                  <button
                    key={item.id}
                    disabled={isSoldOut}
                    onClick={() => addToCart(item)}
                    className={`bg-white p-3 rounded-sm shadow-sm border border-gray-300 text-left transition-all flex items-center relative group min-h-[70px] ${
                      isSoldOut ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"
                      style={{ backgroundColor: displayCategories.find(c => c.id === item.catId)?.color || (isSoldOut ? '#9ca3af' : '#4CAF50') }}
                    />
                    <div className="flex flex-col ml-2 overflow-hidden w-full">
                      <span className="text-[11px] font-bold text-gray-700 leading-tight truncate">{item.name}</span>
                      {item.isSubstituted && (
                        <span className="text-[8px] font-bold text-emerald-600 truncate mt-0.5">Replaces {item.originalName}</span>
                      )}
                      <span className="text-[10px] font-black text-orange-600 mt-1">₹{item.price}</span>
                      {isSoldOut && (
                        <span className="absolute right-1 bottom-1 text-[8px] font-black text-red-600 uppercase bg-red-50 px-1 rounded">Sold Out</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Order Summary & Controls (Right - 40%) */}
        <div className="w-[40%] flex flex-col bg-white shrink-0">
          {/* Top Tabs */}
          <div className="flex h-12 shrink-0">
            {/* Dine In - hidden in pickup mode and car service mode */}
            {!isPickupMode && !isCarServiceMode && (
              <button
                onClick={() => setOrderType('dine-in')}
                className={`flex-1 font-bold text-sm flex items-center justify-center transition-all ${orderType === 'dine-in' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
              >
                Dine In
              </button>
            )}
            {/* Car Service - only shown in car service mode */}
            {isCarServiceMode && (
              <button
                onClick={() => setOrderType('car-service')}
                className={`flex-1 font-bold text-sm flex items-center justify-center transition-all border-x border-white/10 ${orderType === 'car-service' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
              >
                Car Service
              </button>
            )}
            {/* Pick Up - only in pickup mode */}
            {isPickupMode && (
              <button
                onClick={() => setOrderType('pickup')}
                className={`flex-1 font-bold text-sm flex items-center justify-center transition-all ${orderType === 'pickup' ? 'bg-[#E1261C] text-white' : 'bg-[#424242] text-white opacity-60'}`}
              >
                Pick Up
              </button>
            )}
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
            {!isPickupMode && (
              <div onClick={() => { playClickSound(); setIsWaiterModalOpen(true); }} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group relative">
                <Users size={20} className={`${selectedWaiter ? 'text-[#E1261C]' : 'text-gray-400'} group-hover:text-[#E1261C] transition-colors`} />
                {selectedWaiter && (
                   <span className="absolute bottom-0.5 text-[8px] font-black text-[#E1261C] uppercase">
                      {selectedWaiter.name.split(' ')[0]}
                   </span>
                )}
              </div>
            )}
            {!isPickupMode && (
              <div onClick={playClickSound} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                <Edit3 size={20} className="text-gray-400 group-hover:text-[#E1261C] transition-colors" />
              </div>
            )}
            {!isPickupMode && (
              <div onClick={playClickSound} className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                <Bell size={20} className="text-gray-400 group-hover:text-[#E1261C] transition-colors" />
              </div>
            )}
            {!isPickupMode && !isCarServiceMode && <div className="flex-1 flex items-center justify-center"></div>}
            {!isPickupMode && !isCarServiceMode && (
              <div className="w-[20%] bg-[#FFD600] flex items-center justify-center font-bold text-sm shadow-inner">{tableInfo.section}</div>
            )}
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
                            <Save
                              size={16}
                              className="text-gray-400 hover:text-[#E1261C] cursor-pointer"
                              onClick={async () => {
                                playClickSound();
                                try {
                                  await persistOrderMeta();
                                } catch (error) {
                                  setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to save customer details.' });
                                }
                              }}
                            />
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

          {orderNotice && (
            <div className={`mx-4 mt-3 rounded-sm border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
              orderNotice.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              {orderNotice.text}
            </div>
          )}

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
            {(activeOrder?.kots || []).map((kot) => (
              <div key={kot._id || kot.id}>
                 <div className="bg-[#616161] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                    <span>KOT - {(kot._id || kot.id)} Time - {kot.time}</span>
                 </div>
                  {kot.items.filter(item => item.status !== 'cancelled').map(item => (
                    <CartItem
                      key={`${(kot._id || kot.id)}-${(item._id || item.id)}`}
                      item={item}
                      isPlaced={true}
                      onCancel={async () => {
                        if (window.confirm(`Are you sure you want to cancel ${item.name} from this KOT?`)) {
                          try {
                            await cancelKOTItem(tableId, (kot._id || kot.id), (item._id || item.id), { isCarOrder: isCarServiceMode, isPickupOrder: isPickupMode });
                          } catch (error) {
                            setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to cancel this KOT item.' });
                          }
                        }
                      }}
                    />
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
            {(!(activeOrder?.kots?.length) && cart.length === 0) && (
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
            {/* Arrow Extender Tab (hidden in pickup mode) */}
            {!isPickupMode && (
              <button
                onClick={() => { playClickSound(); setIsExtraMenuOpen(!isExtraMenuOpen); }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#424242] text-white p-1 rounded-t-md border-t border-x border-white/10 hover:brightness-125 transition-all shadow-lg z-20 flex items-center justify-center w-8 h-4"
              >
                <ChevronUp size={14} className={`transition-transform duration-300 ${isExtraMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Extra Menu (Summary Panel Revealed by Extender) - hidden in pickup mode */}
            <AnimatePresence>
              {!isPickupMode && isExtraMenuOpen && (
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
                      <span className="text-gray-400">Car Service Charge</span>
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

                    {/* Discount */}
                    {(discount > 0 || activeOrder?.discount?.amount > 0) && (
                      <div className="flex items-center justify-between px-4 py-2.5 group">
                        <div className="flex items-center gap-2">
                           <span className="text-gray-400">Discount</span>
                           <button
                             onClick={() => { playClickSound(); setIsDiscountModalOpen(true); }}
                             className="text-yellow-400 underline underline-offset-2 hover:text-[#E1261C] text-[10px]"
                           >
                             Modify
                           </button>
                        </div>
                        <span className="text-red-400 tabular-nums">-{Math.max(discount, activeOrder?.discount?.amount || 0).toFixed(2)}</span>
                      </div>
                    )}

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
              {/* Row 1: Promo / Split / Return - hidden in pickup mode */}
              {!isPickupMode ? (
                <div className="flex items-center gap-2">
                  <div className="ml-auto bg-[#FFD600] text-[#424242] px-3 py-1 flex items-center gap-2 rounded-sm shadow-inner">
                     <div className="bg-[#E1261C] text-white p-0.5 rounded-full"><Receipt size={10} strokeWidth={3} /></div>
                     <span className="text-[10px] font-bold uppercase">Total</span>
                     <span className="text-base font-black italic tracking-tighter">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  <div className="bg-[#FFD600] text-[#424242] px-3 py-1 flex items-center gap-2 rounded-sm shadow-inner">
                     <div className="bg-[#E1261C] text-white p-0.5 rounded-full"><Receipt size={10} strokeWidth={3} /></div>
                     <span className="text-[10px] font-bold uppercase">Total</span>
                     <span className="text-base font-black italic tracking-tighter">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              )}

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
            </div>

            {/* Always Visible Action Buttons (Row 4) */}
            {!isPickupMode && (
              <div className="grid grid-cols-4 gap-2 p-2 border-t border-white/5">
                <ActionButton onClick={() => handleKOT(true)} label="KOT" color="bg-white" textColor="text-gray-800" disabled={!canPlaceKot} />
                <ActionButton onClick={handleReprint} label="REPRINT" color="bg-[#555555]" textColor="text-white" disabled={!canReprint} />
                <ActionButton onClick={() => setIsDiscountModalOpen(true)} label="DISCOUNT" color="bg-[#FFD600]" textColor="text-gray-900" />
                <ActionButton onClick={handleSave} label="HOLD" color="bg-[#00BCD4]" textColor="text-white" disabled={!canHoldDraft} />
              </div>
            )}
            {/* Download Bill + KOT - only shown in pickup mode */}
            {isPickupMode && (
              <div className="grid grid-cols-1 gap-1 p-2 border-t border-white/5">
                <ActionButton
                  onClick={handleDownloadBillAndKOT}
                  label="Download Bill + KOT"
                  color="bg-[#00BCD4]"
                  disabled={!canDownloadPickup}
                />
              </div>
            )}
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
                {(staff || []).map((waiter) => (
                  <button
                    key={waiter.id || waiter._id}
                    onClick={() => { playClickSound(); setSelectedWaiter(waiter); }}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 group border-b border-gray-50 last:border-0"
                  >
                    <span className={`text-[13px] font-bold ${(selectedWaiter?.id || selectedWaiter?._id) === (waiter.id || waiter._id) ? 'text-gray-900' : 'text-gray-500'}`}>
                      {waiter.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${(selectedWaiter?.id || selectedWaiter?._id) === (waiter.id || waiter._id) ? 'border-[#E1261C] bg-[#E1261C]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                      {(selectedWaiter?.id || selectedWaiter?._id) === (waiter.id || waiter._id) && (
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
                  onClick={async () => {
                    playClickSound();
                    try {
                      await persistOrderMeta();
                    } catch (error) {
                      setOrderNotice({ type: 'error', text: error.response?.data?.message || 'Unable to save waiter assignment.' });
                    } finally {
                      setIsWaiterModalOpen(false);
                    }
                  }}
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
            onSave={async (val, type, reason) => {
               try {
                  setOrderNotice(null);
                  await applyOrderDiscount(tableId, {
                    type: type.toUpperCase(),
                    value: Number(val),
                    reason: reason
                  }, {
                    isCarOrder: isCarServiceMode,
                    isPickupOrder: isPickupMode
                  });
                  
                  setDiscount(Number(val));
                  setDiscountType(type);
                  setDiscountReason(reason);
                  setIsDiscountModalOpen(false);
               } catch (err) {
                  setOrderNotice({ type: 'error', text: err.response?.data?.message || 'Failed to apply discount' });
               }
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

      {/* Variant Selection Modal */}
      <AnimatePresence>
         {variantModalItem && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setVariantModalItem(null)}
                 className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 30 }}
                 className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col font-sans"
               >
                  <div className="px-6 py-5 bg-stone-900 flex items-center justify-between shadow-2xl">
                     <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{variantModalItem.name}</h4>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Customise your dish</p>
                     </div>
                     <button onClick={() => setVariantModalItem(null)} className="p-1 text-stone-500 hover:text-white transition-colors"><X size={20} /></button>
                  </div>

                  <div className="p-8 space-y-8 overflow-y-auto no-scrollbar max-h-[60vh]">
                     {(variantModalItem.variantGroups || []).map(group => {
                        return (
                           <div key={group._id || group.id} className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                 <h5 className="text-[11px] font-black uppercase text-stone-900 tracking-widest flex items-center gap-2">
                                    {group.name}
                                    {group.required && <span className="text-[9px] font-bold text-[#E1261C]">(Required)</span>}
                                 </h5>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 {group.options.map(opt => {
                                    const isSelected = selectedVariants[group._id || group.id] === (opt._id || opt.id);
                                    return (
                                       <button
                                         key={opt._id || opt.id}
                                          type="button"
                                          onClick={() => {
                                             playClickSound();
                                             setSelectedVariants(prev => ({ ...prev, [group._id || group.id]: (opt._id || opt.id) }));
                                          }}
                                          className={`group relative p-4 rounded-2xl border-2 transition-all text-left ${
                                             isSelected
                                                ? 'border-[#E1261C] bg-rose-50 text-[#E1261C] shadow-lg shadow-rose-900/10'
                                                : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-300'
                                          }`}
                                       >
                                          <div className="flex flex-col gap-1">
                                             <span className="text-[10px] font-black uppercase tracking-tight">{opt.name}</span>
                                             <span className={`text-[9px] font-bold ${isSelected ? 'text-[#E1261C]' : 'text-stone-400'}`}>
                                                {opt.priceType === 'fixed' ? `₹${opt.priceValue}` : `+₹${(opt.priceValue !== undefined ? opt.priceValue : opt.price)}`}
                                             </span>
                                          </div>
                                          {isSelected && (
                                             <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={14} className="text-[#E1261C]" />
                                             </div>
                                          )}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Calculated Price</span>
                        <span className="text-xl font-black text-stone-900">
                           ₹{(() => {
                              let p = variantModalItem.price;
                              Object.entries(selectedVariants).forEach(([gid, oid]) => {
                                 const g = variantModalItem.variantGroups?.find(vg => (vg._id || vg.id) === gid);
                                 const o = g?.options.find(vo => (vo._id || vo.id) === oid);
                                 if (o) {
                                    if (o.priceType === 'fixed') p = (o.priceValue !== undefined ? o.priceValue : (o.price || 0));
                                    else p += (o.priceValue !== undefined ? o.priceValue : (o.price || 0));
                                 }
                              });
                              return p;
                           })()}
                        </span>
                     </div>
                     <button
                        type="button"
                        onClick={() => { playClickSound(); confirmVariantSelection(); }}
                        className="px-10 py-4 bg-[#E1261C] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-900 transition-all shadow-xl shadow-rose-900/20 active:scale-95 flex items-center gap-2"
                     >
                        Confirm Selections <ArrowLeft className="rotate-180" size={14} />
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
function CartItem({ item, isPlaced, onRemove, onUpdateQty, onCancel }) {
  return (
    <div className={`px-3 py-2 border-b border-gray-100 flex items-center text-[11px] font-bold animate-in fade-in slide-in-from-right-2 duration-200 group ${isPlaced ? 'bg-gray-50/50' : 'bg-white'}`}>
      <div className="w-5 mr-2 shrink-0">
        {!isPlaced ? (
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded-full bg-[#E1261C] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          >
            <Plus size={12} className="rotate-45" strokeWidth={4} />
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
            title="Cancel Item"
          >
            <Plus size={12} className="rotate-45" strokeWidth={4} />
          </button>
        )}
      </div>

      <div className="w-[35%] flex flex-col">
        <span className={`leading-tight ${isPlaced ? 'text-gray-400' : 'text-gray-700 underline decoration-gray-300 underline-offset-2'}`}>
          {item.name}
        </span>
        {item.variantLabel && (
          <span className="text-[9px] font-bold text-[#E1261C] uppercase tracking-tighter mt-0.5">
            ({item.variantLabel})
          </span>
        )}
        {item.itemModel === 'Combo' && item.elements && (
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5 leading-tight">
            Includes: {item.elements.map(el => `${el.quantity}x ${el.item?.name || 'Item'}`).join(', ')}
          </span>
        )}
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

function ActionButton({ onClick, label, color, textColor = "text-white", disabled = false }) {
  return (
    <button
      onClick={() => {
        if (disabled) return;
        playClickSound();
        onClick();
      }}
      disabled={disabled}
      className={`${color} ${textColor} py-2.5 rounded-sm font-black text-[9px] uppercase shadow-sm transition-all text-center leading-tight px-1 flex items-center justify-center min-h-[42px] border border-black/5 ${
        disabled ? 'opacity-40 cursor-not-allowed shadow-none' : 'active:scale-95 hover:brightness-110'
      }`}
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
