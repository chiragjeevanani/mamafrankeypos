import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from "../../../utils/api";
import { normalizeTableLifecycle } from "../utils/tableLifecycle";

const PosContext = createContext();

const normalizeCategory = (cat, index = 0) => ({
  id: cat._id,
  name: cat.name,
  icon: 'Utensils',
  status: cat.status || 'Active',
  image: cat.image || '',
  description: cat.description || '',
  rank: cat.rank ?? 0,
  color: index % 2 === 0 ? '#E1261C' : '#00BCD4'
});

const normalizeMenuItem = (item) => ({
  id: item._id,
  catId: item.category?._id || item.category,
  name: item.name,
  description: item.description || '',
  price: item.price,
  code: item.shortCode || '',
  shortcut: item.shortCode || '',
  image: item.image || '',
  type: item.type || 'veg',
  status: item.status || 'Available',
  rank: item.rank ?? 0,
  variantGroups: item.variantGroups || []
});

const normalizeReplacement = (rule) => ({
  id: rule._id,
  originalDishId: rule.originalDish?._id || rule.originalDish,
  replacementDishId: rule.replacementDish?._id || rule.replacementDish,
  startDate: rule.startDate?.split('T')[0],
  endDate: rule.endDate?.split('T')[0],
  status: rule.status
});

const normalizeCombo = (combo) => ({
  id: combo._id,
  name: combo.name,
  price: combo.price,
  code: combo.code || '',
  elements: combo.elements || [],
  active: combo.active
});

const getLifecycleStatusForOrder = (order, fallbackStatus = 'running-kot') => {
  if (order?.orderStatus === 'BILLED') return 'printed';
  if (order?.orderStatus === 'COMPLETED') return 'paid';
  if (order?.orderStatus === 'RUNNING') return order?.table?.status || fallbackStatus;
  return fallbackStatus;
};

const normalizeOrder = (order, fallbackStatus) => normalizeTableLifecycle({
  ...order,
  id: order._id,
  status: getLifecycleStatusForOrder(order, fallbackStatus),
});

export function PosProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCustomerSectionOpen, setIsCustomerSectionOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pos_user_info')) || null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCustomerSection = () => setIsCustomerSectionOpen(!isCustomerSectionOpen);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [combos, setCombos] = useState([]);
  const [staff, setStaff] = useState([]);
  const [counters, setCounters] = useState([]);
  const [currentCounter, setCurrentCounter] = useState(null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('pos_user_info', JSON.stringify(userData));
    // fetchMenu is already called on mount via useEffect — only re-fetch menu data on explicit login
    fetchMenu();
    fetchTables();
    fetchOrders();
    // NOTE: fetchStoreSettings is already running in its own useEffect on mount. No duplicate needed.
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_access');
    localStorage.removeItem('pos_user_info');
  };

  const fetchCounters = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/counters');
      const billingCounters = data.filter(c => !c.name.startsWith('DAILY_'));
      setCounters(billingCounters);

      if (billingCounters.length > 0) {
        const preferredId = localStorage.getItem('pos_active_counter_id');
        const matched = billingCounters.find(c => c._id === preferredId);
        if (matched) {
          setCurrentCounter(matched);
        } else {
          setCurrentCounter(billingCounters[0]);
          localStorage.setItem('pos_active_counter_id', billingCounters[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching counters from API:", error);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    if (!localStorage.getItem('admin_access') && !localStorage.getItem('pos_access')) return;
    try {
      const [catRes, itemRes, replaceRes, comboRes, staffRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items'),
        api.get('/menu/replacements'),
        api.get('/menu/combos'),
        api.get('/staff')
      ]);

      const formattedCategories = catRes.data.map((cat, index) => normalizeCategory(cat, index));
      formattedCategories.unshift({ id: 'fav', name: 'Favorite Items', icon: 'Star', color: '#4CAF50' });

      setCategories(formattedCategories);
      setMenuItems(itemRes.data.map(normalizeMenuItem));
      setReplacements(replaceRes.data.map(normalizeReplacement));
      setCombos(comboRes.data.map(normalizeCombo));
      setStaff(staffRes.data.map(s => ({
        id: s._id,
        name: s.name,
        role: s.role,
        status: s.status
      })));
    } catch (error) {
      console.error("Error fetching menu from API:", error);
    }
  }, []);

  const switchCounter = useCallback((counterId) => {
    const matched = counters.find(c => c._id === counterId || c.id === counterId);
    if (matched) {
      setCurrentCounter(matched);
      localStorage.setItem('pos_active_counter_id', matched._id);
    }
  }, [counters]);

  useEffect(() => {
    fetchCounters();
    fetchMenu();
  }, []);

  const [orders, setOrders] = useState({});
  const [carOrders, setCarOrders] = useState({});
  const [pickupOrders, setPickupOrders] = useState({});
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);

  const getScopedOrderMaps = (details = {}) => {
    if (details.isPickupOrder) return pickupOrders;
    if (details.isCarOrder) return carOrders;
    return orders;
  };

  const resolveOrderFromIdentifier = (identifier, details = {}) => {
    if (identifier && typeof identifier === 'object') {
      return identifier;
    }
    const scopedOrders = getScopedOrderMaps(details);
    return scopedOrders[identifier] || Object.values(scopedOrders).find(order =>
      order?.id === identifier ||
      order?._id === identifier ||
      order?.orderNumber === identifier ||
      order?.table?._id === identifier ||
      order?.table?.name === identifier ||
      order?.carNumber === identifier
    ) || null;
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders?active=true');

      const activeDineInOrders = data.filter(order => order.orderType === 'DINE-IN');
      const activeCarOrders = data.filter(order => order.orderType === 'CAR-SERVICE');
      const activePickupOrders = data.filter(order => order.orderType === 'PICKUP');

      const tableMap = {};
      activeDineInOrders.forEach(order => {
        if (order.table) {
          const normalized = normalizeOrder(order, order.table.status);
          tableMap[order.table.name] = normalized;
        }
      });

      const carMap = {};
      activeCarOrders.forEach(order => {
        const orderKey = order?.table?.name || order?.carNumber || order?._id;
        if (orderKey) {
          carMap[orderKey] = normalizeOrder(order, 'running-kot');
        }
      });

      const pickupMap = {};
      activePickupOrders.forEach(order => {
        const orderKey = order?.table?.name || order?._id;
        if (orderKey) {
          pickupMap[orderKey] = normalizeOrder(order, 'running-kot');
        }
      });

      setOrders(tableMap);
      setCarOrders(carMap);
      setPickupOrders(pickupMap);
    } catch (error) {
      console.error("Error fetching running orders:", error);
    }
  }, []);

  const fetchTables = useCallback(async () => {
    if (!localStorage.getItem('admin_access') && !localStorage.getItem('pos_access')) return;
    try {
      const [secRes, tabRes] = await Promise.all([
        api.get('/tables/sections'),
        api.get('/tables')
      ]);

      const formattedSections = secRes.data.map(sec => ({
        id: sec.name,
        label: sec.label,
        _id: sec._id,
        rank: sec.rank ?? 0,
        status: sec.status || 'Active',
        isSystem: sec.isSystem || false,
        type: sec.type || 'DINE-IN'
      }));

      const formattedTables = tabRes.data.map(tab => ({
        id: tab.name,
        name: tab.name,
        sectionId: tab.section?.name,
        status: tab.status || 'blank',
        capacity: tab.capacity || 4,
        _id: tab._id
      }));

      setSections(formattedSections);
      setTables(formattedTables);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchTables();

    // PRODUCTION HEARTBEAT: Poll orders every 15 seconds (live KOT sync)
    const ordersHeartbeat = setInterval(() => {
      if (localStorage.getItem('admin_access') || localStorage.getItem('pos_access')) {
        fetchOrders();
      }
    }, 15000);

    // Table structure rarely changes mid-shift — poll every 60 seconds
    const tablesHeartbeat = setInterval(() => {
      if (localStorage.getItem('admin_access') || localStorage.getItem('pos_access')) {
        fetchTables();
      }
    }, 60000);

    return () => {
      clearInterval(ordersHeartbeat);
      clearInterval(tablesHeartbeat);
    };
  }, []);

  const addCategory = async (formData) => {
    try {
      const { data } = await api.post('/menu/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCategories(prev => [...prev, normalizeCategory(data, prev.length)]);
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const { data } = await api.put(`/menu/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCategories(prev => prev.map((c, index) => c.id === id ? { ...normalizeCategory(data, index), color: c.color } : c));
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/menu/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      setMenuItems(prev => prev.filter(i => i.catId !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addMenuItem = async (formData) => {
    try {
      const { data } = await api.post('/menu/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMenuItems(prev => [...prev, normalizeMenuItem(data)]);
      return data;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id, formData) => {
    try {
      const { data } = await api.put(`/menu/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMenuItems(prev => prev.map(i => i.id === id ? normalizeMenuItem(data) : i));
      return data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await api.delete(`/menu/items/${id}`);
      setMenuItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const bulkUpdateMenuItems = async (ids, updates) => {
    try {
      await api.post('/menu/items/bulk-update', { ids, updates });
      setMenuItems(prev => prev.map(item => 
        ids.includes(item.id) ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  };

  const addReplacement = async (ruleData) => {
    try {
      const { data } = await api.post('/menu/replacements', ruleData);
      setReplacements(prev => [...prev, normalizeReplacement(data)]);
      return data;
    } catch (error) {
      console.error('Error adding replacement:', error);
      throw error;
    }
  };

  const updateReplacement = async (id, ruleData) => {
    try {
      const { data } = await api.put(`/menu/replacements/${id}`, ruleData);
      setReplacements(prev => prev.map(r => r.id === id ? normalizeReplacement(data) : r));
      return data;
    } catch (error) {
      console.error('Error updating replacement:', error);
      throw error;
    }
  };

  const deleteReplacement = async (id) => {
    try {
      await api.delete(`/menu/replacements/${id}`);
      setReplacements(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting replacement:', error);
      throw error;
    }
  };

  const addCombo = async (comboData) => {
    try {
      const { data } = await api.post('/menu/combos', comboData);
      setCombos(prev => [...prev, normalizeCombo(data)]);
      return data;
    } catch (error) {
      console.error('Error adding combo:', error);
      throw error;
    }
  };

  const updateCombo = async (id, comboData) => {
    try {
      const { data } = await api.put(`/menu/combos/${id}`, comboData);
      setCombos(prev => prev.map(c => c.id === id ? normalizeCombo(data) : c));
      return data;
    } catch (error) {
      console.error('Error updating combo:', error);
      throw error;
    }
  };

  const deleteCombo = async (id) => {
    try {
      await api.delete(`/menu/combos/${id}`);
      setCombos(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting combo:', error);
      throw error;
    }
  };

  const bulkUploadMenu = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/menu/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchMenu();
    } catch (error) {
      console.error('Error bulk uploading menu:', error);
      throw error;
    }
  };

  const placeKOT = async (tableId, items, staffOrLegacyTotal, maybeStaff, maybeDetails = {}) => {
    try {
      const details = maybeStaff && typeof maybeStaff === 'object' && !Array.isArray(maybeStaff) && maybeStaff.name !== undefined
        ? maybeDetails
        : (maybeStaff && typeof maybeStaff === 'object' && !Array.isArray(maybeStaff) ? maybeStaff : maybeDetails);
      const staff = maybeStaff && typeof maybeStaff === 'object' && !Array.isArray(maybeStaff) && maybeStaff.name !== undefined
        ? maybeStaff
        : (staffOrLegacyTotal && typeof staffOrLegacyTotal === 'object' && !Array.isArray(staffOrLegacyTotal) ? staffOrLegacyTotal : null);
      const existingOrder = resolveOrderFromIdentifier(tableId, details);
      const table = tables.find(t => t.id === tableId);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Sanitize item IDs for the backend to satisfy MongoDB ObjectId format validation
      const sanitizedItems = items.map(item => ({
        ...item,
        id: item.baseId || item.id
      }));

      const orderData = {
        orderId: existingOrder?.id || existingOrder?._id,
        tableId: table?._id,
        orderType: details.isCarOrder ? 'CAR-SERVICE' : (details.isPickupOrder ? 'PICKUP' : 'DINE-IN'),
        carNumber: details.isCarOrder ? tableId : null,
        items: sanitizedItems,
        total: total,
        staffId: staff?._id || staff?.id,
        counterId: currentCounter?._id,
        customer: details.customer,
        markPrinted: !!details.markPrinted
      };
      const { data } = await api.post('/orders', orderData);

      // Optimistic update: update table status to 'running-kot' in tables list
      if (!details.isCarOrder && !details.isPickupOrder && table?._id) {
        setTables(prev => prev.map(t => 
          t._id === table._id ? { ...t, status: 'running-kot' } : t
        ));
      }

      // Optimistic update: insert/update the new order in the correct map
      const normalized = normalizeOrder(data, data.table?.status || 'running-kot');
      if (details.isPickupOrder) {
        const orderKey = data?.table?.name || data?._id;
        if (orderKey) setPickupOrders(prev => ({ ...prev, [orderKey]: normalized }));
      } else if (details.isCarOrder) {
        const orderKey = data?.table?.name || data?.carNumber || data?._id;
        if (orderKey) setCarOrders(prev => ({ ...prev, [orderKey]: normalized }));
      } else {
        const orderKey = data?.table?.name || tableId;
        if (orderKey) setOrders(prev => ({ ...prev, [orderKey]: normalized }));
      }

      return data;
    } catch (error) {
      console.error("Error placing KOT:", error);
      throw error;
    }
  };

  const markKOTPrinted = async (orderIdOrObject, details = {}) => {
    try {
      let order = null;
      let targetOrderId = null;

      if (orderIdOrObject && typeof orderIdOrObject === 'object') {
        order = orderIdOrObject;
        targetOrderId = order.id || order._id;
      } else {
        order = resolveOrderFromIdentifier(orderIdOrObject, details);
        targetOrderId = order?.id || order?._id;
        
        // Fallback: If context isn't updated yet but we have a valid MongoDB ID
        if (!targetOrderId && orderIdOrObject && typeof orderIdOrObject === 'string' && /^[0-9a-fA-F]{24}$/.test(orderIdOrObject)) {
          targetOrderId = orderIdOrObject;
        }
      }
      
      if (!targetOrderId) return null;
      
      // If we don't have the order object or its KOTs, fetch it from backend
      if (!order || !order.kots || order.kots.length === 0) {
        const { data } = await api.get(`/orders/${targetOrderId}`);
        order = data;
      }

      if (!order || !order.kots || order.kots.length === 0) return null;
      
      const latestKot = order.kots[order.kots.length - 1];
      const kotId = latestKot._id || latestKot.id;
      
      const { data } = await api.patch(`/orders/${targetOrderId}/kot/${kotId}/print`);

      // Optimistic update: mark the order's latest KOT as printed in the correct state map
      const updateOrderInMap = (prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach(key => {
          const o = updatedMap[key];
          if ((o?.id === targetOrderId || o?._id === targetOrderId)) {
            updatedMap[key] = { ...o, kotPrinted: true, billPrinted: false, orderStatus: data.orderStatus || o.orderStatus, ...normalizeOrder(data, 'running-kot') };
          }
        });
        return updatedMap;
      };
      if (details.isPickupOrder) setPickupOrders(updateOrderInMap);
      else if (details.isCarOrder) setCarOrders(updateOrderInMap);
      else setOrders(updateOrderInMap);

      // Optimistic update: update table status to 'running-kot' in tables list
      if (!details.isPickupOrder && !details.isCarOrder && data.table) {
        const tableIdObj = data.table._id || data.table;
        setTables(prev => prev.map(t => 
          (t._id === tableIdObj || t.name === data.table.name) ? { ...t, status: 'running-kot' } : t
        ));
      }

      return data;
    } catch (error) {
      console.error("Error marking KOT printed:", error);
      throw error;
    }
  };

  const saveOrder = async (orderIdOrObject, details = {}) => {
    let order = null;
    let orderId = null;

    if (orderIdOrObject && typeof orderIdOrObject === 'object') {
      order = orderIdOrObject;
      orderId = order.id || order._id;
    } else {
      order = resolveOrderFromIdentifier(orderIdOrObject, details);
      orderId = order?.id || order?._id;
      if (!orderId && orderIdOrObject && typeof orderIdOrObject === 'string' && /^[0-9a-fA-F]{24}$/.test(orderIdOrObject)) {
        orderId = orderIdOrObject;
      }
    }

    if (!orderId) {
      throw new Error('No active order found to bill');
    }

    const { data } = await api.post(`/orders/${orderId}/bill`, details);

    // Optimistic update: mark the order as BILLED in the correct state map
    const updateOrderInMap = (prev) => {
      const updatedMap = { ...prev };
      Object.keys(updatedMap).forEach(key => {
        const o = updatedMap[key];
        if (o?.id === orderId || o?._id === orderId) {
          updatedMap[key] = { ...o, orderStatus: 'BILLED', billPrinted: true, ...normalizeOrder(data, 'printed') };
        }
      });
      return updatedMap;
    };
    if (details.isPickupOrder) setPickupOrders(updateOrderInMap);
    else if (details.isCarOrder) setCarOrders(updateOrderInMap);
    else setOrders(updateOrderInMap);

    // Optimistic update: update table status to 'printed' in tables list
    if (!details.isPickupOrder && !details.isCarOrder && data.table) {
      const tableIdObj = data.table._id || data.table;
      setTables(prev => prev.map(t => 
        (t._id === tableIdObj || t.name === data.table.name) ? { ...t, status: 'printed' } : t
      ));
    }

    return data;
  };

  const updateOrderMeta = async (identifier, details = {}) => {
    let order = resolveOrderFromIdentifier(identifier, details);
    let orderId = order?.id || order?._id;
    if (!orderId && identifier && /^[0-9a-fA-F]{24}$/.test(identifier)) {
      orderId = identifier;
    }

    if (!orderId) {
      return null;
    }

    const payload = {};
    if (details.staffId) payload.staffId = details.staffId;
    if (details.customer) payload.customer = details.customer;
    if (details.orderType) payload.orderType = details.orderType;

    if (Object.keys(payload).length === 0) {
      return order;
    }

    const { data } = await api.put(`/orders/${orderId}`, payload);

    // Optimistic update: update the specific order's meta fields in state
    const updateOrderInMap = (prev) => {
      const updatedMap = { ...prev };
      Object.keys(updatedMap).forEach(key => {
        const o = updatedMap[key];
        if (o?.id === orderId || o?._id === orderId) {
          updatedMap[key] = { ...o, ...normalizeOrder(data, o.status) };
        }
      });
      return updatedMap;
    };
    if (details.isPickupOrder) setPickupOrders(updateOrderInMap);
    else if (details.isCarOrder) setCarOrders(updateOrderInMap);
    else setOrders(updateOrderInMap);

    return data;
  };

  const holdOrder = async (identifier, details = {}) => {
    return updateOrderMeta(identifier, details);
  };

  const settleOrder = async (identifier, paymentMethod, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(identifier, details);
      if (!order) {
        throw new Error('No active order found to settle');
      }

      const orderId = order.id || order._id;
      const payload = {
        paymentMethod,
        taxes: details.taxes || [],
        totalAmount: details.total || 0
      };
      const { data } = await api.post(`/orders/${orderId}/settle`, payload);

      // Optimistic update: remove the settled order from the correct state map
      const removeOrderFromMap = (prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach(key => {
          const o = updatedMap[key];
          if (o?.id === orderId || o?._id === orderId) {
            delete updatedMap[key];
          }
        });
        return updatedMap;
      };
      if (details.isPickupOrder) setPickupOrders(removeOrderFromMap);
      else if (details.isCarOrder) setCarOrders(removeOrderFromMap);
      else setOrders(removeOrderFromMap);

      // Optimistic update: update table status to 'blank' in tables list
      const tableObj = data.table || order.table;
      if (!details.isPickupOrder && !details.isCarOrder && tableObj) {
        const tableIdObj = tableObj._id || tableObj;
        setTables(prev => prev.map(t => 
          (t._id === tableIdObj || t.name === tableObj.name) ? { ...t, status: 'blank' } : t
        ));
      }

      return data;
    } catch (error) {
      console.error("Settlement error:", error);
      throw error;
    }
  };

  const applyOrderDiscount = async (identifier, discountData, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(identifier, details);
      if (!order) throw new Error('Order not found');

      const orderId = order.id || order._id;
      const { data } = await api.post(`/orders/${orderId}/discount`, discountData);

      // Optimistic update: update the discount on the specific order in state
      const updateOrderInMap = (prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach(key => {
          const o = updatedMap[key];
          if (o?.id === orderId || o?._id === orderId) {
            updatedMap[key] = { ...o, discount: data.discount || discountData };
          }
        });
        return updatedMap;
      };
      if (details.isPickupOrder) setPickupOrders(updateOrderInMap);
      else if (details.isCarOrder) setCarOrders(updateOrderInMap);
      else setOrders(updateOrderInMap);

      return data;
    } catch (error) {
      console.error("Discount error:", error);
      throw error;
    }
  };

  const clearTable = async (identifier, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(identifier, details);

      if (!order) {
        // No order exists — just clear the table status on the backend
        const table = tables.find(t => t.id === identifier || t._id === identifier);
        if (table) {
          const { data } = await api.patch(`/tables/${table._id}/status`, { status: 'blank', currentOrder: null });
          // Optimistic update: clear table status in local state
          setTables(prev => prev.map(t => t._id === table._id ? { ...t, status: 'blank' } : t));
          return data;
        }
        return null;
      }

      const orderId = order.id || order._id;

      // Completed orders are already cleared by settlement on the backend.
      if (order.orderStatus === 'COMPLETED') {
        // Optimistic update: remove from state since it's already completed
        const removeOrderFromMap = (prev) => {
          const updatedMap = { ...prev };
          Object.keys(updatedMap).forEach(key => {
            const o = updatedMap[key];
            if (o?.id === orderId || o?._id === orderId) delete updatedMap[key];
          });
          return updatedMap;
        };
        if (details.isPickupOrder) setPickupOrders(removeOrderFromMap);
        else if (details.isCarOrder) setCarOrders(removeOrderFromMap);
        else setOrders(removeOrderFromMap);

        // Optimistic update: update table status to 'blank' in tables list
        const tableObj = order.table;
        if (!details.isPickupOrder && !details.isCarOrder && tableObj) {
          const tableIdObj = tableObj._id || tableObj;
          setTables(prev => prev.map(t => 
            (t._id === tableIdObj || t.name === tableObj.name) ? { ...t, status: 'blank' } : t
          ));
        }

        return order;
      }

      const { data } = await api.post(`/orders/${orderId}/cancel`, {
        reason: details.reason || 'Cleared from POS terminal',
        managerPin: details.managerPin
      });

      // Optimistic update: remove the cancelled order from the correct state map
      const removeOrderFromMap = (prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach(key => {
          const o = updatedMap[key];
          if (o?.id === orderId || o?._id === orderId) delete updatedMap[key];
        });
        return updatedMap;
      };
      if (details.isPickupOrder) setPickupOrders(removeOrderFromMap);
      else if (details.isCarOrder) setCarOrders(removeOrderFromMap);
      else setOrders(removeOrderFromMap);

      // Optimistic update: update table status to 'blank' in tables list
      const tableObj = data.order?.table || order.table;
      if (!details.isPickupOrder && !details.isCarOrder && tableObj) {
        const tableIdObj = tableObj._id || tableObj;
        setTables(prev => prev.map(t => 
          (t._id === tableIdObj || t.name === tableObj.name) ? { ...t, status: 'blank' } : t
        ));
      }

      return data;
    } catch (error) {
      console.error("Error clearing table/order:", error);
      throw error;
    }
  };

  const cancelKOTItem = async (identifier, kotId, itemId, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(identifier, details);
      if (!order) {
        throw new Error('No active order found for item cancellation');
      }

      const orderId = order.id || order._id;
      const { data } = await api.patch(
        `/orders/${orderId}/kot/${kotId}/items/${itemId}/cancel`,
        {
          reason: details.reason || 'Cancelled by manager',
          managerPin: details.managerPin
        }
      );

      // Optimistic update: mark the cancelled item in the order's KOTs
      const updateOrderInMap = (prev) => {
        const updatedMap = { ...prev };
        Object.keys(updatedMap).forEach(key => {
          const o = updatedMap[key];
          if (o?.id === orderId || o?._id === orderId) {
            const updatedKots = (o.kots || []).map(kot => {
              if (kot._id !== kotId && kot.id !== kotId) return kot;
              return {
                ...kot,
                items: (kot.items || []).map(item =>
                  (item._id === itemId || item.id === itemId)
                    ? { ...item, status: 'cancelled' }
                    : item
                )
              };
            });
            updatedMap[key] = { ...o, kots: updatedKots };
          }
        });
        return updatedMap;
      };
      if (details.isPickupOrder) setPickupOrders(updateOrderInMap);
      else if (details.isCarOrder) setCarOrders(updateOrderInMap);
      else setOrders(updateOrderInMap);

      return data;
    } catch (error) {
      console.error("Error cancelling KOT item:", error);
      throw error;
    }
  };

  const setTableWaiter = (identifier, staffMember, details = {}) => {
    const scopedOrders = getScopedOrderMaps(details);
    const matchedOrder = resolveOrderFromIdentifier(identifier, details);

    if (!matchedOrder) {
      return staffMember;
    }

    const nextOrders = { ...scopedOrders };
    const keysToUpdate = Object.keys(nextOrders).filter(key => {
      const order = nextOrders[key];
      return order?.id === matchedOrder.id || order?._id === matchedOrder._id;
    });

    keysToUpdate.forEach(key => {
      nextOrders[key] = {
        ...nextOrders[key],
        waiter: staffMember
      };
    });

    if (details.isPickupOrder) setPickupOrders(nextOrders);
    else if (details.isCarOrder) setCarOrders(nextOrders);
    else setOrders(nextOrders);

    return staffMember;
  };


  const addCarOrder = async (carNumber, items, total, waiter) => {
    try {
      if (!items || items.length === 0) {
        return null;
      }
      // Sanitize item IDs for the backend to satisfy MongoDB ObjectId format validation
      const sanitizedItems = items.map(item => ({
        ...item,
        id: item.baseId || item.id
      }));

      const orderData = {
        carNumber,
        orderType: 'CAR-SERVICE',
        items: sanitizedItems,
        total,
        staffId: waiter?._id || waiter?.id,
        counterId: currentCounter?._id
      };
      const { data } = await api.post('/orders', orderData);

      // Optimistic update: add the new car order to carOrders state
      const orderKey = data?.table?.name || data?.carNumber || data?._id;
      if (orderKey) {
        const normalized = normalizeOrder(data, 'running-kot');
        setCarOrders(prev => ({ ...prev, [orderKey]: normalized }));
      }

      return data;
    } catch (error) {
      console.error("Error adding car order:", error);
      throw error;
    }
  };

  const updateCarOrderStatus = async (carNumber, status) => {
    try {
      if (status === 'paid' || status === 'completed') {
        return await settleOrder(carNumber, 'Cash', { isCarOrder: true });
      }
      return resolveOrderFromIdentifier(carNumber, { isCarOrder: true });
    } catch (error) {
      console.error("Error updating car order status:", error);
      throw error;
    }
  };

  const clearCarOrder = async (carNumber) => {
    try {
      return await clearTable(carNumber, { isCarOrder: true });
    } catch (error) {
      console.error("Error clearing car order:", error);
      throw error;
    }
  };
  const addSection = async (sectionData) => {
    try {
      const { data } = await api.post('/tables/sections', sectionData);
      // Optimistic update: add the new section to local state immediately
      setSections(prev => [...prev, {
        id: data.name, label: data.label, _id: data._id,
        rank: data.rank ?? 0, status: data.status || 'Active',
        isSystem: data.isSystem || false, type: data.type || 'DINE-IN'
      }]);
      return data;
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      const oldSection = sections.find(s => s._id === id);
      const { data } = await api.put(`/tables/sections/${id}`, sectionData);
      // Optimistic update: update the matching section in local state
      setSections(prev => prev.map(sec => sec._id === id ? {
        ...sec, id: data.name, label: data.label,
        rank: data.rank ?? sec.rank, status: data.status || sec.status,
        type: data.type || sec.type
      } : sec));

      // Sync tables' sectionId if the section name slug changed
      if (oldSection && oldSection.id !== data.name) {
        setTables(prev => prev.map(t => t.sectionId === oldSection.id ? {
          ...t, sectionId: data.name
        } : t));
      }

      return data;
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const deleteSection = async (id) => {
    try {
      const section = sections.find(s => s._id === id);
      const { data } = await api.delete(`/tables/sections/${id}`);
      // Optimistic update: remove the section from local state
      setSections(prev => prev.filter(sec => sec._id !== id));

      // Remove tables belonging to the deleted section
      if (section) {
        setTables(prev => prev.filter(t => t.sectionId !== section.name));
      }

      return data;
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  };

  const addTable = async (tableData) => {
    try {
      const { data } = await api.post('/tables', tableData);
      // Optimistic update: add the new table to local state immediately
      setTables(prev => [...prev, {
        id: data.name, name: data.name,
        sectionId: data.section?.name,
        status: data.status || 'blank',
        capacity: data.capacity || 4, _id: data._id
      }]);
      return data;
    } catch (error) {
      console.error("Error adding table:", error);
      throw error;
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const { data } = await api.put(`/tables/${id}`, tableData);
      // Optimistic update: update the matching table in local state
      setTables(prev => prev.map(t => t._id === id ? {
        ...t, name: data.name, id: data.name,
        sectionId: data.section?.name || t.sectionId,
        capacity: data.capacity || t.capacity, status: data.status || t.status
      } : t));
      return data;
    } catch (error) {
      console.error("Error updating table:", error);
      throw error;
    }
  };

  const deleteTable = async (id) => {
    try {
      const { data } = await api.delete(`/tables/${id}`);
      // Optimistic update: remove the table from local state
      setTables(prev => prev.filter(t => t._id !== id));
      return data;
    } catch (error) {
      console.error("Error deleting table:", error);
      throw error;
    }
  };

  const addPosTable = async (sectionId, tableName) => {
    try {
      const section = sections.find(s => s.id === sectionId)?._id;
      if (!section) return;
      const { data } = await api.post('/tables', { name: tableName, section, capacity: 4 });
      // Optimistic update: add the new table to local state immediately
      setTables(prev => [...prev, {
        id: data.name, name: data.name,
        sectionId: data.section?.name || sectionId,
        status: data.status || 'blank',
        capacity: data.capacity || 4, _id: data._id
      }]);
    } catch (error) {
      console.error("Error adding POS table:", error);
    }
  };


  const [storeSettings, setStoreSettings] = useState(null);

  const fetchStoreSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/store');
      setStoreSettings(data);
      if (data) {
        localStorage.setItem('rms_visibility_decrement', data.visibilityDecrement !== undefined ? String(data.visibilityDecrement) : '0');
        localStorage.setItem('rms_item_replacements', JSON.stringify(data.itemReplacements || []));
      }
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const [appliedTaxes, setAppliedTaxes] = useState([]);

  useEffect(() => {
    if (storeSettings?.taxes) {
      setAppliedTaxes(storeSettings.taxes.map(t => ({
        id: t._id || Date.now() + Math.random(),
        name: t.name,
        rate: t.percentage,
        percentage: t.percentage,
        enabled: t.active,
        active: t.active
      })));
    }
  }, [storeSettings]);

  const addTax = (name, rate) => {
    const newTax = { id: Date.now(), name, percentage: Number(rate), rate: Number(rate), active: true, enabled: true };
    setAppliedTaxes(prev => [...prev, newTax]);
  };

  const updateTax = (id, updates) => {
    setAppliedTaxes(prev => prev.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updates };
        if (updates.rate !== undefined) merged.percentage = Number(updates.rate);
        if (updates.percentage !== undefined) merged.rate = Number(updates.percentage);
        if (updates.enabled !== undefined) merged.active = updates.enabled;
        if (updates.active !== undefined) merged.enabled = updates.active;
        return merged;
      }
      return t;
    }));
  };

  const deleteTax = (id) => {
    setAppliedTaxes(prev => prev.filter(t => t.id !== id));
  };

  const calculateTaxes = (inclusiveAmount) => {
    if (!inclusiveAmount) return [];
    const activeTaxes = (storeSettings?.taxes || []).filter(t => t.active);
    if (activeTaxes.length === 0) return [];
    
    const totalTaxRate = activeTaxes.reduce((sum, t) => sum + t.percentage, 0);
    // Base = Inclusive / (1 + (Rate/100))
    const baseAmount = inclusiveAmount / (1 + (totalTaxRate / 100));
    
    return activeTaxes.map(t => ({
      name: t.name,
      percentage: t.percentage,
      rate: t.percentage,
      amount: (baseAmount * t.percentage) / 100
    }));
  };

  return (
    <PosContext.Provider value={{
      isSidebarOpen, toggleSidebar, closeSidebar,
      isCustomerSectionOpen, toggleCustomerSection,
      placeKOT, markKOTPrinted, saveOrder, holdOrder, settleOrder, clearTable, cancelKOTItem, applyOrderDiscount, setTableWaiter,
      carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
      pickupOrders,
      sections, addSection, updateSection, deleteSection,
      tables, addTable, updateTable, deleteTable, addPosTable,
      categories, addCategory, updateCategory, deleteCategory,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, bulkUpdateMenuItems, bulkUploadMenu,
      replacements, addReplacement, updateReplacement, deleteReplacement,
      combos, addCombo, updateCombo, deleteCombo,
      staff,
      user, login, logout, counters, currentCounter, switchCounter, storeSettings, fetchStoreSettings, appliedTaxes, addTax, updateTax, deleteTax, calculateTaxes,
      orders, refreshMenu: fetchMenu, refreshOrders: fetchOrders, refreshTables: fetchTables
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
