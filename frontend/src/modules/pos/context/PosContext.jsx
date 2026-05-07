import React, { createContext, useContext, useState, useEffect } from 'react';
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

const normalizeVariantGroup = (group) => ({
  id: group._id,
  name: group.name,
  type: group.type,
  options: group.options || []
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
  const [variantGroups, setVariantGroups] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [combos, setCombos] = useState([]);
  const [staff, setStaff] = useState([]);
  const [dishVariants, setDishVariants] = useState({});

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('pos_user_info', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_access');
    localStorage.removeItem('pos_user_info');
  };

  const fetchMenu = async () => {
    if (!localStorage.getItem('admin_access') && !localStorage.getItem('pos_access')) return;
    try {
      const [catRes, itemRes, variantRes, replaceRes, comboRes, staffRes, counterRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items'),
        api.get('/menu/variants'),
        api.get('/menu/replacements'),
        api.get('/menu/combos'),
        api.get('/staff'),
        api.get('/settings/counters')
      ]);

      const formattedCategories = catRes.data.map((cat, index) => normalizeCategory(cat, index));
      formattedCategories.unshift({ id: 'fav', name: 'Favorite Items', icon: 'Star', color: '#4CAF50' });

      setCategories(formattedCategories);
      setMenuItems(itemRes.data.map(normalizeMenuItem));
      setVariantGroups(variantRes.data.map(normalizeVariantGroup));
      setReplacements(replaceRes.data.map(normalizeReplacement));
      setCombos(comboRes.data.map(normalizeCombo));
      setStaff(staffRes.data.map(s => ({
        id: s._id,
        name: s.name,
        role: s.role,
        status: s.status
      })));

      if (counterRes.data.length > 0) {
        setCurrentCounter(counterRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching menu from API:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const [orders, setOrders] = useState({});
  const [carOrders, setCarOrders] = useState({});
  const [pickupOrders, setPickupOrders] = useState({});
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentCounter, setCurrentCounter] = useState(null);

  const getScopedOrderMaps = (details = {}) => {
    if (details.isPickupOrder) return pickupOrders;
    if (details.isCarOrder) return carOrders;
    return orders;
  };

  const resolveOrderFromIdentifier = (identifier, details = {}) => {
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

  const fetchOrders = async () => {
    try {
      const [
        runningOrderRes,
        billedOrderRes,
        runningCarRes,
        billedCarRes,
        runningPickupRes,
        billedPickupRes
      ] = await Promise.all([
        api.get('/orders?status=running-kot'),
        api.get('/orders?status=printed'),
        api.get('/orders?type=CAR&status=running-kot'),
        api.get('/orders?type=CAR&status=printed'),
        api.get('/orders?type=PICKUP&status=running-kot'),
        api.get('/orders?type=PICKUP&status=printed')
      ]);

      const mergeOrdersById = (...groups) => {
        const merged = new Map();
        groups.flat().forEach((order) => {
          if (order?._id) merged.set(order._id, order);
        });
        return Array.from(merged.values());
      };

      const activeDineInOrders = mergeOrdersById(runningOrderRes.data, billedOrderRes.data);
      const activeCarOrders = mergeOrdersById(runningCarRes.data, billedCarRes.data);
      const activePickupOrders = mergeOrdersById(runningPickupRes.data, billedPickupRes.data);

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
  };

  const fetchTables = async () => {
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
        status: sec.status || 'Active'
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
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();

    // PRODUCTION HEARTBEAT: Poll for updates every 15 seconds to keep terminals in sync
    const heartbeat = setInterval(() => {
      if (localStorage.getItem('admin_access') || localStorage.getItem('pos_access')) {
        fetchOrders();
        fetchTables();
      }
    }, 15000);

    return () => clearInterval(heartbeat);
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

  const addVariantGroup = async (groupData) => {
    try {
      const { data } = await api.post('/menu/variants', groupData);
      setVariantGroups(prev => [...prev, normalizeVariantGroup(data)]);
      return data;
    } catch (error) {
      console.error('Error adding variant group:', error);
      throw error;
    }
  };

  const updateVariantGroup = async (id, groupData) => {
    try {
      const { data } = await api.put(`/menu/variants/${id}`, groupData);
      setVariantGroups(prev => prev.map(g => g.id === id ? normalizeVariantGroup(data) : g));
      return data;
    } catch (error) {
      console.error('Error updating variant group:', error);
      throw error;
    }
  };

  const deleteVariantGroup = async (id) => {
    try {
      await api.delete(`/menu/variants/${id}`);
      setVariantGroups(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting variant group:', error);
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

  const assignVariantsToDish = (dishId, mappings) => setDishVariants(prev => ({ ...prev, [dishId]: mappings }));

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

      const orderData = {
        orderId: existingOrder?.id || existingOrder?._id,
        tableId: table?._id,
        orderType: details.isCarOrder ? 'CAR-SERVICE' : (details.isPickupOrder ? 'PICKUP' : 'DINE-IN'),
        carNumber: details.isCarOrder ? tableId : null,
        items: items,
        total: total,
        staffId: staff?._id || staff?.id,
        counterId: currentCounter?._id,
        customer: details.customer
      };
      const { data } = await api.post('/orders', orderData);
      await fetchOrders();
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error placing KOT:", error);
      throw error;
    }
  };

  const markKOTPrinted = async (orderId, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(orderId, details);
      if (!order || !order.kots || order.kots.length === 0) return null;
      
      const latestKot = order.kots[order.kots.length - 1];
      const kotId = latestKot._id || latestKot.id;
      
      const { data } = await api.patch(`/orders/${order.id || order._id}/kot/${kotId}/print`);
      await fetchOrders();
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error marking KOT printed:", error);
      throw error;
    }
  };

  const saveOrder = async (identifier, details = {}) => {
    const order = resolveOrderFromIdentifier(identifier, details);
    if (!order) {
      throw new Error('No active order found to bill');
    }

    const { data } = await api.post(`/orders/${order.id || order._id}/bill`, details);
    await fetchOrders();
    await fetchTables();
    return data;
  };

  const updateOrderMeta = async (identifier, details = {}) => {
    const order = resolveOrderFromIdentifier(identifier, details);
    if (!order) {
      return null;
    }

    const payload = {};
    if (details.staffId) payload.staffId = details.staffId;
    if (details.customer) payload.customer = details.customer;
    if (details.orderType) payload.orderType = details.orderType;

    if (Object.keys(payload).length === 0) {
      return order;
    }

    const { data } = await api.put(`/orders/${order.id || order._id}`, payload);
    await fetchOrders();
    await fetchTables();
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

      const payload = {
        paymentMethod,
        taxes: details.taxes || [],
        totalAmount: details.total || 0
      };
      const { data } = await api.post(`/orders/${order.id || order._id}/settle`, payload);
      await fetchOrders();
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Settlement error:", error);
      throw error;
    }
  };

  const clearTable = async (identifier, details = {}) => {
    try {
      const order = resolveOrderFromIdentifier(identifier, details);

      if (!order) {
        const table = tables.find(t => t.id === identifier || t._id === identifier);
        if (table) {
          const { data } = await api.patch(`/tables/${table._id}/status`, { status: 'blank', currentOrder: null });
          await fetchTables();
          return data;
        }
        return null;
      }

      // Completed orders are already cleared by settlement on the backend.
      if (order.orderStatus === 'COMPLETED') {
        await fetchOrders();
        await fetchTables();
        return order;
      }

      const { data } = await api.post(`/orders/${order.id || order._id}/cancel`, {
        reason: details.reason || 'Cleared from POS terminal'
      });
      await fetchOrders();
      await fetchTables();
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

      const { data } = await api.patch(`/orders/${order.id || order._id}/kot/${kotId}/items/${itemId}/cancel`);
      await fetchOrders();
      await fetchTables();
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

  const addTax = async (tax) => {
     // logic
  };

  const updateTax = async (id, tax) => {
    // logic
  };

  const deleteTax = async (id) => {
    // logic
  };

  const addCarOrder = async (carNumber, items, total, waiter) => {
    try {
      if (!items || items.length === 0) {
        return null;
      }
      const orderData = {
        carNumber,
        orderType: 'CAR-SERVICE',
        items,
        total,
        staffId: waiter?._id || waiter?.id,
        counterId: currentCounter?._id
      };
      const { data } = await api.post('/orders', orderData);
      await fetchOrders();
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
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      const { data } = await api.put(`/tables/sections/${id}`, sectionData);
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const deleteSection = async (id) => {
    try {
      const { data } = await api.delete(`/tables/sections/${id}`);
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  };

  const addTable = async (tableData) => {
    try {
      const { data } = await api.post('/tables', tableData);
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error adding table:", error);
      throw error;
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const { data } = await api.put(`/tables/${id}`, tableData);
      await fetchTables();
      return data;
    } catch (error) {
      console.error("Error updating table:", error);
      throw error;
    }
  };

  const deleteTable = async (id) => {
    try {
      const { data } = await api.delete(`/tables/${id}`);
      await fetchTables();
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
      await api.post('/tables', { name: tableName, section, capacity: 4 });
      fetchTables();
    } catch (error) {
      console.error("Error adding POS table:", error);
    }
  };

  const [storeSettings, setStoreSettings] = useState(null);

  const fetchStoreSettings = async () => {
    try {
      const { data } = await api.get('/settings/store');
      setStoreSettings(data);
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const calculateTaxes = (amount) => {
    if (!storeSettings || !storeSettings.taxes) return [];
    
    return storeSettings.taxes
      .filter(t => t.active)
      .map(t => ({
        name: t.name,
        percentage: t.percentage,
        amount: (amount * t.percentage) / 100
      }));
  };

  return (
    <PosContext.Provider value={{
      isSidebarOpen, toggleSidebar, closeSidebar,
      isCustomerSectionOpen, toggleCustomerSection,
      placeKOT, markKOTPrinted, saveOrder, holdOrder, settleOrder, clearTable, cancelKOTItem, setTableWaiter,
      carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
      pickupOrders,
      sections, addSection, updateSection, deleteSection,
      tables, addTable, updateTable, deleteTable, addPosTable,
      categories, addCategory, updateCategory, deleteCategory,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, bulkUpdateMenuItems, bulkUploadMenu,
      variantGroups, addVariantGroup, updateVariantGroup, deleteVariantGroup,
      replacements, addReplacement, updateReplacement, deleteReplacement,
      combos, addCombo, updateCombo, deleteCombo,
      staff,
      dishVariants, assignVariantsToDish,
      user, login, logout, currentCounter, appliedTaxes: [], addTax, updateTax, deleteTax, calculateTaxes,
      orders, refreshMenu: fetchMenu
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
