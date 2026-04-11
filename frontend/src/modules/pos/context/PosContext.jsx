import { createContext, useContext, useState, useEffect } from 'react';
import {
  applyTableLifecycle,
  normalizePaymentMode,
  normalizeTableLifecycle,
  resetTableLifecycle,
} from '../utils/tableLifecycle';

const PosContext = createContext();

const normalizeStoredSession = (session = {}) => normalizeTableLifecycle(session);
const normalizeStoredTables = (items = []) => items.map((table) => normalizeTableLifecycle(table));

export function PosProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    const { kotPrinted = false } = options;

    setOrders(prev => {
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

    updateTableLifecycleById(tableId, {
      orderPlaced: true,
      kotPrinted,
      billPrinted: false,
      paymentMode: null,
    });
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
