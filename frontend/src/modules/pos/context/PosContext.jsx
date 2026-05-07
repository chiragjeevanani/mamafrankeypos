import React, { createContext, useContext, useState, useEffect } from 'react';
import api from "../../../utils/api";
import { normalizeTableLifecycle } from "../utils/tableLifecycle";

const PosContext = createContext();

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

  useEffect(() => {
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

        const formattedCategories = catRes.data.map((cat, index) => ({
          id: cat._id,
          name: cat.name,
          icon: 'Utensils',
          status: cat.status || 'Active',
          image: cat.image || '',
          color: index % 2 === 0 ? '#E1261C' : '#00BCD4'
        }));

        formattedCategories.unshift({ id: 'fav', name: 'Favorite Items', icon: 'Star', color: '#4CAF50' });

        const formattedItems = itemRes.data.map((item) => ({
          id: item._id,
          catId: item.category?._id || item.category,
          name: item.name,
          price: item.price,
          code: item.shortCode || '',
          shortcut: item.shortCode || '',
          image: item.image || '',
          type: item.type || 'veg',
          variantGroups: item.variantGroups
        }));

        const formattedVariants = variantRes.data.map(v => ({
          id: v._id,
          name: v.name,
          type: v.type,
          options: v.options
        }));

        const formattedReplacements = replaceRes.data.map(r => ({
          id: r._id,
          originalDishId: r.originalDish?._id || r.originalDish,
          replacementDishId: r.replacementDish?._id || r.replacementDish,
          startDate: r.startDate?.split('T')[0],
          endDate: r.endDate?.split('T')[0],
          status: r.status
        }));

        setCategories(formattedCategories);
        setMenuItems(formattedItems);
        setVariantGroups(formattedVariants);
        setReplacements(formattedReplacements);
        setCombos(comboRes.data.map(c => ({
          id: c._id,
          name: c.name,
          price: c.price,
          code: c.code,
          elements: c.elements,
          active: c.active
        })));
        setStaff(staffRes.data.map(s => ({
          id: s._id,
          name: s.name,
          role: s.role,
          status: s.status
        })));

        if (staffRes.data.length > 0 && !user) {
           // Auto-select first staff for now if none selected
           // setUser(staffRes.data[0]); 
        }

        if (counterRes.data.length > 0) {
          setCurrentCounter(counterRes.data[0]);
        }
      } catch (error) {
        console.error("Error fetching menu from API:", error);
      }
    };

    fetchMenu();
  }, []);

  const [orders, setOrders] = useState({});
  const [carOrders, setCarOrders] = useState({});
  const [pickupOrders, setPickupOrders] = useState({});
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentCounter, setCurrentCounter] = useState(null);

  const fetchOrders = async () => {
    try {
      const [orderRes, carRes, pickupRes] = await Promise.all([
        api.get('/orders?status=running-kot'),
        api.get('/orders?type=CAR&status=running-kot'),
        api.get('/orders?type=PICKUP&status=running-kot')
      ]);

      const tableMap = {};
      orderRes.data.forEach(order => {
        if (order.table) {
          const normalized = normalizeTableLifecycle({
            ...order,
            id: order._id,
            status: order.table.status // Use table status for inference
          });
          tableMap[order.table.name] = normalized;
        }
      });

      const carMap = {};
      carRes.data.forEach(order => {
        carMap[order.carNumber] = normalizeTableLifecycle({
          ...order,
          id: order._id,
          status: 'running-kot' // Inferred for car orders if they are in running state
        });
      });

      const pickupMap = {};
      pickupRes.data.forEach(order => {
        pickupMap[order._id] = normalizeTableLifecycle({
          ...order,
          id: order._id,
          status: 'running-kot'
        });
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
        _id: sec._id
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
      setCategories(prev => [...prev, { 
        id: data._id, 
        name: data.name, 
        icon: 'Utensils', 
        status: data.status,
        image: data.image,
        color: '#E1261C' 
      }]);
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
      setCategories(prev => prev.map(c => c.id === id ? { 
        ...c, 
        name: data.name, 
        status: data.status, 
        image: data.image 
      } : c));
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
      const newItem = {
        id: data._id,
        catId: data.category?._id || data.category,
        name: data.name,
        price: data.price,
        code: data.shortCode || '',
        shortcut: data.shortCode || '',
        image: data.image || '',
        type: data.type || 'veg',
        variantGroups: data.variantGroups
      };
      setMenuItems(prev => [...prev, newItem]);
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
      const updatedItem = {
        id: data._id,
        catId: data.category?._id || data.category,
        name: data.name,
        price: data.price,
        code: data.shortCode || '',
        shortcut: data.shortCode || '',
        image: data.image || '',
        type: data.type || 'veg',
        variantGroups: data.variantGroups
      };
      setMenuItems(prev => prev.map(i => i.id === id ? updatedItem : i));
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
      const newGroup = {
        id: data._id,
        name: data.name,
        type: data.type,
        options: data.options
      };
      setVariantGroups(prev => [...prev, newGroup]);
      return data;
    } catch (error) {
      console.error('Error adding variant group:', error);
      throw error;
    }
  };

  const updateVariantGroup = async (id, groupData) => {
    try {
      const { data } = await api.put(`/menu/variants/${id}`, groupData);
      const updatedGroup = {
        id: data._id,
        name: data.name,
        type: data.type,
        options: data.options
      };
      setVariantGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
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
      const newRule = {
        id: data._id,
        originalDishId: data.originalDish,
        replacementDishId: data.replacementDish,
        startDate: data.startDate?.split('T')[0],
        endDate: data.endDate?.split('T')[0],
        status: data.status
      };
      setReplacements(prev => [...prev, newRule]);
      return data;
    } catch (error) {
      console.error('Error adding replacement:', error);
      throw error;
    }
  };

  const updateReplacement = async (id, ruleData) => {
    try {
      const { data } = await api.put(`/menu/replacements/${id}`, ruleData);
      const updatedRule = {
        id: data._id,
        originalDishId: data.originalDish,
        replacementDishId: data.replacementDish,
        startDate: data.startDate?.split('T')[0],
        endDate: data.endDate?.split('T')[0],
        status: data.status
      };
      setReplacements(prev => prev.map(r => r.id === id ? updatedRule : r));
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
      setCombos(prev => [...prev, {
        id: data._id,
        name: data.name,
        price: data.price,
        code: data.code,
        elements: data.elements,
        active: data.active
      }]);
      return data;
    } catch (error) {
      console.error('Error adding combo:', error);
      throw error;
    }
  };

  const updateCombo = async (id, comboData) => {
    try {
      const { data } = await api.put(`/menu/combos/${id}`, comboData);
      setCombos(prev => prev.map(c => c.id === id ? {
        id: data._id,
        name: data.name,
        price: data.price,
        code: data.code,
        elements: data.elements,
        active: data.active
      } : c));
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
      // Refresh menu
      window.location.reload(); 
    } catch (error) {
      console.error('Error bulk uploading menu:', error);
      throw error;
    }
  };

  const placeKOT = async (tableId, items, staff, details = {}) => {
    try {
      const table = tables.find(t => t.id === tableId);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData = {
        tableId: table?._id,
        orderType: details.isCarOrder ? 'CAR-SERVICE' : (details.isPickupOrder ? 'PICKUP' : 'DINE-IN'),
        carNumber: details.isCarOrder ? tableId : null,
        items: items,
        total: total,
        staffId: staff?._id || staff?.id,
        counterId: currentCounter?._id
      };
      
      await api.post('/orders', orderData);
      fetchOrders();
      fetchTables(); // Refresh table status
    } catch (error) {
      console.error("Error placing KOT:", error);
    }
  };

  const markKOTPrinted = async (orderId, details = {}) => {
    try {
      // If we don't have a specific kotId, we might want to mark all as printed
      // For now, the backend route is /api/orders/:id/kot/:kotId/print
      // Since the frontend often prints the LATEST KOT:
      const order = details.isPickupOrder ? pickupOrders[orderId] : (details.isCarOrder ? carOrders[orderId] : orders[orderId]);
      if (!order || !order.kots || order.kots.length === 0) return;
      
      const latestKot = order.kots[order.kots.length - 1];
      const kotId = latestKot._id || latestKot.id;
      
      await api.patch(`/orders/${order.id || order._id}/kot/${kotId}/print`);
      fetchOrders();
      fetchTables();
    } catch (error) {
      console.error("Error marking KOT printed:", error);
    }
  };

  const saveOrder = async (orderId, orderData) => {
    // In this POS, saveOrder is primarily used to mark as BILLED
    await api.post(`/orders/${orderId}/bill`, orderData);
    fetchOrders();
    fetchTables();
  };

  const holdOrder = (orderId) => {
    // Logic to hold order
  };

  const settleOrder = async (orderId, paymentMethod, details = {}) => {
    try {
      const payload = {
        paymentMethod,
        taxes: details.taxes || [],
        totalAmount: details.total || 0
      };
      await api.post(`/orders/${orderId}/settle`, payload);
      fetchOrders();
      fetchTables();
    } catch (error) {
      console.error("Settlement error:", error);
    }
  };

  const clearTable = async (tableId) => {
    // Logic to clear table
  };

  const cancelKOTItem = (orderId, kotId, itemId) => {
    // Logic to cancel KOT item
  };

  const setTableWaiter = (tableId, staff) => {
    // Logic to set waiter
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
      const orderData = {
        carNumber,
        type: 'CAR',
        kots: items.length > 0 ? [{ items, staff: waiter }] : []
      };
      await api.post('/orders', orderData);
      fetchOrders();
    } catch (error) {
      console.error("Error adding car order:", error);
    }
  };

  const updateCarOrderStatus = async (carNumber, status) => {
    try {
      const orderId = carOrders[carNumber]?.id;
      if (orderId) {
        await api.put(`/orders/${orderId}`, { status });
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating car order status:", error);
    }
  };

  const clearCarOrder = async (carNumber) => {
    try {
      const orderId = carOrders[carNumber]?.id;
      if (orderId) {
        await api.put(`/orders/${orderId}/settle`, { paymentMode: 'CASH' }); // Mock settle
        fetchOrders();
      }
    } catch (error) {
      console.error("Error clearing car order:", error);
    }
  };
  const addSection = async (sectionData) => {
    try {
      const { data } = await api.post('/tables/sections', sectionData);
      fetchTables();
      return data;
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      await api.put(`/tables/sections/${id}`, sectionData);
      fetchTables();
    } catch (error) {
      console.error("Error updating section:", error);
    }
  };

  const deleteSection = async (id) => {
    try {
      await api.delete(`/tables/sections/${id}`);
      fetchTables();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const addTable = async (tableData) => {
    try {
      await api.post('/tables', tableData);
      fetchTables();
    } catch (error) {
      console.error("Error adding table:", error);
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      await api.put(`/tables/${id}`, tableData);
      fetchTables();
    } catch (error) {
      console.error("Error updating table:", error);
    }
  };

  const deleteTable = async (id) => {
    try {
      await api.delete(`/tables/${id}`);
      fetchTables();
    } catch (error) {
      console.error("Error deleting table:", error);
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
      orders
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
