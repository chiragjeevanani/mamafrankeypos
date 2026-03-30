
// Shared Admin Data and Mock Constants
export const ADMIN_STATS_HISTORY = [
  { time: '08:00 AM', revenue: 1200, orders: 4 },
  { time: '10:00 AM', revenue: 3500, orders: 12 },
  { time: '12:00 PM', revenue: 12500, orders: 45 },
  { time: '02:00 PM', revenue: 18000, orders: 62 },
  { time: '04:00 PM', revenue: 21000, orders: 75 },
  { time: '06:00 PM', revenue: 32000, orders: 110 },
  { time: '08:00 PM', revenue: 42850, orders: 156 },
];

export const SYSTEM_VENDORS = [
  { id: 'v1', name: 'Global Fresh Produce', category: 'Vegetables', contact: 'John Doe', phone: '+91 98765 43210' },
  { id: 'v2', name: 'Dairy Delight', category: 'Dairy', contact: 'Sarah Smith', phone: '+91 87654 32109' },
  { id: 'v3', name: 'Premium Meats Co.', category: 'Meat', contact: 'Mike Johnson', phone: '+91 76543 21098' },
];

export const ADMIN_NOTIFICATIONS = [
  { id: 1, title: 'Low Stock Alert: Paneer (Outlet 1)', time: '10m ago', type: 'warning' },
  { id: 2, title: 'New Vendor Quotation received', time: '1h ago', type: 'info' },
  { id: 3, title: 'Order #8824 Cancelled by Admin', time: '2h ago', type: 'error' },
];
