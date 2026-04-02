import { useState, useMemo } from 'react';
import { X, Search, Plus, Minus, Trash2, CreditCard, Receipt, Send, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { POS_CATEGORIES, POS_MENU_ITEMS } from '../data/posMenu';

export default function PosPanel({ table, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(POS_CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);

  const filteredItems = useMemo(() => {
    return POS_MENU_ITEMS.filter(item => {
      const matchesCategory = item.catId === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.code.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-5xl bg-[#F5F5F5] shadow-2xl z-[60] flex flex-col"
    >
      {/* Panel Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-5 bg-[#1C1E22] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E1261C] flex items-center justify-center text-white font-black text-sm shadow-md">
            {table.name[0]}
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-white text-sm leading-none">Order — {table.name}</h2>
            <span className="text-[10px] text-slate-400 leading-none mt-0.5">Active Session</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-full uppercase border border-emerald-500/25 ml-1">
            Running
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Menu (63%) */}
        <div className="w-[63%] flex flex-col border-r border-gray-200 bg-white">
          {/* Categories */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100 shrink-0">
            {POS_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-[#E1261C] text-white shadow-md shadow-stone-300/50' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 py-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search items by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all text-sm"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 content-start no-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map(item => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(item)}
                  className="bg-white p-3 rounded-xl border border-gray-150 shadow-sm hover:border-[#E1261C]/30 hover:shadow-md transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 px-1.5 bg-gray-100 rounded text-[9px] font-bold text-gray-400">
                    #{item.code}
                  </div>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-22 object-cover rounded-lg mb-1"
                  />
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-[#E1261C] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#E1261C] font-black text-sm">₹{item.price}</span>
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-[#E1261C] flex items-center justify-center group-hover:bg-[#E1261C] group-hover:text-white transition-all">
                      <Plus size={13} strokeWidth={3} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (37%) */}
        <div className="w-[37%] flex flex-col bg-white">
          {/* Summary Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <span className="font-black text-sm text-gray-800 uppercase tracking-tight">Order Summary</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cart.length > 0 ? 'bg-[#E1261C]/10 text-[#E1261C]' : 'bg-gray-100 text-gray-400'}`}>
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3 pt-16 opacity-60">
                <ChefHat size={48} strokeWidth={1} />
                <p className="text-sm font-medium text-gray-400">No items added yet</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 items-start py-3 border-b border-gray-50 last:border-0 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                    <span className="text-xs text-gray-400">₹{item.price} / unit</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:text-[#E1261C] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:text-[#E1261C] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-800">₹{item.price * item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals & Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-4 shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              {/* Highlighted Total */}
              <div className="flex justify-between items-center mt-2 pt-3 border-t-2 border-[#E1261C]/20 bg-[#E1261C]/5 rounded-xl px-3 py-2.5 -mx-1">
                <span className="text-base font-black text-gray-900 uppercase tracking-tight">Total</span>
                <span className="text-xl font-black text-[#E1261C]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-gray-300 rounded-xl font-black text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all text-sm uppercase tracking-tight">
                <Send size={15} /> KOT
              </button>
              <button className="flex items-center justify-center gap-2 py-3.5 bg-[#E1261C] text-white rounded-xl font-black hover:bg-[#4E342E] transition-all shadow-lg shadow-[#E1261C]/30 text-sm uppercase tracking-tight">
                <CreditCard size={15} /> Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
