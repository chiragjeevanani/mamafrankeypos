import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('rms_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-1024',
        orderNum: '1024',
        table: 'Table 7',
        source: 'Home Website',
        items: [
          { id: 'i1', name: 'Paneer Tikka', quantity: 2, status: 'new' },
          { id: 'i4', name: 'Paneer Butter Masala', quantity: 1, status: 'new' }
        ],
        status: 'new',
        startTime: new Date().toISOString(),
        total: 780
      },
      {
        id: 'ORD-1023',
        orderNum: '1023',
        table: '7',
        source: 'QR Ordering',
        items: [
          { id: 'i1', name: 'Paneer Tikka', quantity: 2, note: 'Extra spicy', status: 'preparing' },
          { id: 'i2', name: 'Dal Makhani', quantity: 1, note: 'Less butter', status: 'preparing' }
        ],
        status: 'preparing',
        startTime: new Date(Date.now() - 5 * 60000).toISOString(),
        total: 780
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('rms_orders', JSON.stringify(orders));
  }, [orders]);

  // Handle cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rms_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const createOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNum: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'new',
      startTime: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
  };

  const updateItemStatus = (orderId, itemId, status) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        // If all items are ready, set order to ready
        const allReady = updatedItems.every(i => i.status === 'ready');
        return { 
          ...order, 
          items: updatedItems,
          status: allReady ? 'ready' : order.status 
        };
      }
      return order;
    }));
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      createOrder, 
      updateOrderStatus, 
      updateItemStatus,
      cancelOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
