import { createContext, useContext, useState, useEffect } from 'react';
import {
  applyTableLifecycle,
  normalizePaymentMode,
  normalizeTableLifecycle,
  resetTableLifecycle,
} from '../utils/tableLifecycle';
import { POS_CATEGORIES, POS_MENU_ITEMS } from '../data/posMenu';

const PosContext = createContext();

const normalizeStoredSession = (session = {}) => normalizeTableLifecycle(session);
const normalizeStoredTables = (items = []) => items.map((table) => normalizeTableLifecycle(table));

export function PosProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(POS_CATEGORIES);
  const [menuItems, setMenuItems] = useState(POS_MENU_ITEMS);

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

        newCategories.unshift({ id: 'fav', name: 'Favorite Items', icon: 'Star', color: '#4CAF50' });
        
        setCategories(newCategories);
        setMenuItems(csvItems);
      } catch (error) {
        console.error("Error fetching CSV in Context:", error);
      }
    };

    fetchCSV();
  }, []);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_orders');
      if (!saved) return {};

      return Object.fromEntries(
        Object.entries(JSON.parse(saved)).map(([tableId, order]) => [
          tableId,
          normalizeStoredSession(order),
        ])
      );
    } catch {
      return {};
    }
  });

  // --- Car Service Orders (keyed by normalised car number) ---
  const [carOrders, setCarOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_car_orders');
      if (!saved) return {};

      return Object.fromEntries(
        Object.entries(JSON.parse(saved)).map(([tableId, order]) => [
          tableId,
          normalizeStoredSession(order),
        ])
      );
    } catch {
      return {};
    }
  });

  // --- Dynamic Sections & Tables (Admin Managed) ---
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_sections');
      if (saved) return JSON.parse(saved);
      
      // Default Sections from mock
      return [
        { id: 'ac', label: 'AC' },
        { id: 'garden', label: 'Garden' },
        { id: 'non-ac', label: 'Non-AC' },
        { id: 'rooftops', label: 'Rooftops' },
        { id: 'second-floor', label: 'Second Floor' },
        { id: 'car-service', label: 'Car Service' }
      ];
    } catch { return []; }
  });

  const [tables, setTables] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_tables');
      if (saved) return normalizeStoredTables(JSON.parse(saved));

      // Default Tables generated from sections logic
      const defaultTables = [
        ...Array.from({ length: 20 }, (_, i) => ({ id: `AC${i + 1}`, name: `AC${i + 1}`, sectionId: 'ac', status: 'blank', capacity: 4 })),
        ...Array.from({ length: 20 }, (_, i) => ({ id: `G${i + 21}`, name: `G${i + 21}`, sectionId: 'garden', status: 'blank', capacity: 6 })),
        ...Array.from({ length: 15 }, (_, i) => ({ id: `NAC${i + 1}`, name: `NAC${i + 1}`, sectionId: 'non-ac', status: 'blank', capacity: 4 })),
        ...Array.from({ length: 10 }, (_, i) => ({ id: `R${i + 1}`, name: `R${i + 1}`, sectionId: 'rooftops', status: 'blank', capacity: 4 })),
        ...Array.from({ length: 12 }, (_, i) => ({ id: `SF${i + 1}`, name: `SF${i + 1}`, sectionId: 'second-floor', status: 'blank', capacity: 4 }))
      ];
      return normalizeStoredTables(defaultTables);
    } catch { return []; }
  });

  // Persist table orders
  useEffect(() => {
    localStorage.setItem('rms_pos_orders', JSON.stringify(orders));
  }, [orders]);

  // Persist car orders
  useEffect(() => {
    localStorage.setItem('rms_pos_car_orders', JSON.stringify(carOrders));
  }, [carOrders]);

  // One-time cleanup: reset stale table statuses (Blue/Orange etc. from previous mock runs)
  // Ensures ALL tables without active orders are set to 'blank' (Grey)
  useEffect(() => {
    setTables(prev => prev.map(table => {
      const order = orders[table.id];
      // If no active order session, reset to blank
      if (!order) return resetTableLifecycle(table);
      return applyTableLifecycle(table, order);
    }));
  }, []); // Run once on mount

  // Persist dynamic configuration
  useEffect(() => {
    localStorage.setItem('rms_pos_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('rms_pos_tables', JSON.stringify(tables));
  }, [tables]);

  // --- Dynamic Tax Management ---
  const [appliedTaxes, setAppliedTaxes] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_taxes');
      if (saved) return JSON.parse(saved);
      // Default fallback (backward compatibility with hardcoded 5%)
      return [{ id: 'tax-default', name: 'GST', rate: 5, enabled: true }];
    } catch { return []; }
  });

  // --- Variant Management ---
  const [variantGroups, setVariantGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_variant_groups');
      return saved ? JSON.parse(saved) : [
        { 
          id: 'size', 
          name: 'Plate Size', 
          options: [
            { id: 'full', name: 'Full', priceType: 'fixed', priceValue: 200 },
            { id: 'half', name: 'Half', priceType: 'fixed', priceValue: 120 }
          ]
        },
        {
          id: 'style',
          name: 'Cooking Style',
          options: [
            { id: 'grilled', name: 'Grilled', priceType: 'addon', priceValue: 20 },
            { id: 'dry', name: 'Dry', priceType: 'addon', priceValue: 10 }
          ]
        }
      ];
    } catch { return []; }
  });

  const [dishVariants, setDishVariants] = useState(() => {
    try {
      const saved = localStorage.getItem('rms_pos_dish_variants');
      return saved ? JSON.parse(saved) : {}; // dishId -> array of { groupId, required }
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('rms_pos_variant_groups', JSON.stringify(variantGroups));
  }, [variantGroups]);

  useEffect(() => {
    localStorage.setItem('rms_pos_dish_variants', JSON.stringify(dishVariants));
  }, [dishVariants]);

  const addVariantGroup = (group) => setVariantGroups(prev => [...prev, { ...group, id: `vg-${Date.now()}` }]);
  const updateVariantGroup = (id, updates) => setVariantGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  const deleteVariantGroup = (id) => setVariantGroups(prev => prev.filter(g => g.id !== id));
  
  const assignVariantsToDish = (dishId, mappings) => setDishVariants(prev => ({ ...prev, [dishId]: mappings }));

  useEffect(() => {
    localStorage.setItem('rms_pos_taxes', JSON.stringify(appliedTaxes));
  }, [appliedTaxes]);

  const addTax = (name, rate) => {
    const newTax = {
      id: `tax-${Date.now()}`,
      name,
      rate: Number(rate),
      enabled: true
    };
    setAppliedTaxes(prev => [...prev, newTax]);
  };

  const updateTax = (id, updates) => {
    setAppliedTaxes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTax = (id) => {
    setAppliedTaxes(prev => prev.filter(t => t.id !== id));
  };

  const calculateTaxes = (subtotal) => {
    return appliedTaxes
      .filter(t => t.enabled)
      .map(tax => ({
        id: tax.id,
        name: tax.name,
        rate: tax.rate,
        amount: Number(((subtotal * tax.rate) / 100).toFixed(2))
      }));
  };

  const [isCustomerSectionOpen, setIsCustomerSectionOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Biller' });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCustomerSection = () => setIsCustomerSectionOpen(prev => !prev);

  const updateTableLifecycleById = (tableId, updates) => {
    setTables(prev => prev.map(table => (
      table.id === tableId ? applyTableLifecycle(table, updates) : table
    )));
  };

  const resetTableById = (tableId) => {
    setTables(prev => prev.map(table => (
      table.id === tableId ? resetTableLifecycle(table) : table
    )));
  };

  const placeKOT = (tableId, cart, total, staff = null, options = {}) => {
    const { kotPrinted = false, isCarOrder = false } = options;
    const setOrderStore = isCarOrder ? setCarOrders : setOrders;

    setOrderStore(prev => {
      const existingOrder = normalizeStoredSession(prev[tableId] || { 
        kots: [], 
        status: 'blank', 
        sessionStartTime: new Date().toISOString(),
        waiter: staff
      });
      
      const newKOT = {
        id: (existingOrder.kots?.length || 0) + 1,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cart,
        total,
        staff: staff // Track staff per KOT if needed
      };

      return {
        ...prev,
        [tableId]: {
          ...existingOrder,
          kots: [...(existingOrder.kots || []), newKOT],
          waiter: staff || existingOrder.waiter, // Primary waiter for the table
          orderPlaced: true,
          kotPrinted,
          billPrinted: false,
          paymentMode: null,
          status: kotPrinted ? 'printed' : 'running-kot'
        }
      };
    });

    if (!isCarOrder) {
      updateTableLifecycleById(tableId, {
        orderPlaced: true,
        kotPrinted,
        billPrinted: false,
        paymentMode: null,
      });
    }
  };

  const markKOTPrinted = (tableId, options = {}) => {
    const isCarOrder = options.isCarOrder || (!orders[tableId] && !!carOrders[tableId]);
    const setOrderStore = isCarOrder ? setCarOrders : setOrders;

    setOrderStore(prev => {
      if (!prev[tableId]) return prev;

      return {
        ...prev,
        [tableId]: {
          ...normalizeStoredSession(prev[tableId]),
          orderPlaced: true,
          kotPrinted: true,
          status: 'printed',
        }
      };
    });

    if (!isCarOrder) {
      updateTableLifecycleById(tableId, {
        orderPlaced: true,
        kotPrinted: true,
      });
    }
  };

  const saveOrder = (tableId, options = {}) => {
     const isCarOrder = options.isCarOrder || (!orders[tableId] && !!carOrders[tableId]);
     const setOrderStore = isCarOrder ? setCarOrders : setOrders;

     setOrderStore(prev => {
       if (!prev[tableId]) return prev;

       return {
         ...prev,
         [tableId]: {
           ...normalizeStoredSession(prev[tableId]),
           orderPlaced: true,
           kotPrinted: true,
           billPrinted: true,
           status: 'printed'
         }
       };
     });

     if (!isCarOrder) {
       updateTableLifecycleById(tableId, {
         orderPlaced: true,
         kotPrinted: true,
         billPrinted: true,
       });
     }
  };

  const holdOrder = (tableId) => {
    setOrders(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        status: 'on-hold'
      }
    }));
  };

  const settleOrder = (tableId, paymentMethod, options = {}) => {
     const isCarOrder = options.isCarOrder || (!orders[tableId] && !!carOrders[tableId]);
     const setOrderStore = isCarOrder ? setCarOrders : setOrders;
     const paymentMode = normalizePaymentMode(paymentMethod);

     setOrderStore(prev => {
       if (!prev[tableId]) return prev;

       return {
         ...prev,
         [tableId]: {
           ...normalizeStoredSession(prev[tableId]),
           orderPlaced: true,
           kotPrinted: true,
           billPrinted: true,
           status: 'paid',
           paymentMethod,
           paymentMode
         }
       };
     });

     if (!isCarOrder) {
       updateTableLifecycleById(tableId, {
         orderPlaced: true,
         kotPrinted: true,
         billPrinted: true,
         paymentMode,
       });
     }
  };

  const clearTable = (tableId, options = {}) => {
    const isCarOrder = options.isCarOrder || (!orders[tableId] && !!carOrders[tableId]);

    setOrders(prev => {
      if (!prev[tableId]) return prev;
      const newOrders = { ...prev };
      delete newOrders[tableId];
      return newOrders;
    });

    if (isCarOrder) {
      setCarOrders(prev => {
        if (!prev[tableId]) return prev;
        const newOrders = { ...prev };
        delete newOrders[tableId];
        return newOrders;
      });
    }

    resetTableById(tableId);
  };

  const setTableWaiter = (tableId, staff) => {
    setOrders(prev => ({
      ...prev,
      [tableId]: {
        ...normalizeStoredSession(prev[tableId] || { kots: [], status: 'running-kot', sessionStartTime: new Date().toISOString() }),
        waiter: staff,
        orderPlaced: true
      }
    }));
    
    updateTableLifecycleById(tableId, { orderPlaced: true });
  };

  // ---- Car Service helpers ----
  const addCarOrder = (carNumber, initialCart = [], total = 0, staff = null) => {
    const key = carNumber.trim().toUpperCase();
    setCarOrders(prev => ({
      ...prev,
      [key]: {
        carNumber: key,
        type: 'CAR',
        status: 'running-kot',
        sessionStartTime: new Date().toISOString(),
        waiter: staff,
        orderPlaced: true,
        kotPrinted: false,
        billPrinted: false,
        paymentMode: null,
        kots: [
          {
            id: 1,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: initialCart,
            total,
            staff
          }
        ]
      }
    }));
  };

  const updateCarOrderStatus = (carNumber, status) => {
    const key = carNumber.trim().toUpperCase();
    setCarOrders(prev => ({
      ...prev,
      [key]: { ...normalizeStoredSession(prev[key]), status }
    }));
  };

  const clearCarOrder = (carNumber) => {
    const key = carNumber.trim().toUpperCase();
    setCarOrders(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addPosTable = (sectionId, tableName) => {
    setTables(prev => {
      // Duplicate table check (same section and same name)
      if (prev.some(t => t.sectionId === sectionId && t.name === tableName)) {
        return prev;
      }
      const newTable = {
        id: tableName.toUpperCase(),
        name: tableName,
        sectionId: sectionId,
        status: 'blank',
        capacity: 4,
        ...normalizeTableLifecycle()
      };
      return [...prev, newTable];
    });
  };

  return (
    <PosContext.Provider value={{ 
      isSidebarOpen, orders, toggleSidebar, closeSidebar, 
      isCustomerSectionOpen, toggleCustomerSection,
      placeKOT, markKOTPrinted, saveOrder, holdOrder, settleOrder, clearTable, setTableWaiter,
      carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
      sections, setSections, tables, setTables, addPosTable,
      appliedTaxes, addTax, updateTax, deleteTax, calculateTaxes,
      variantGroups, addVariantGroup, updateVariantGroup, deleteVariantGroup,
      dishVariants, assignVariantsToDish,
      categories, setCategories, menuItems, setMenuItems,
      user, setUser
    }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}
