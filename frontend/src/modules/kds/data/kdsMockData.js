export const KDS_STATIONS = [
  { id: 'all', name: 'All Stations' },
  { id: 'grill', name: 'Grill Station' },
  { id: 'mains', name: 'Main Kitchen' },
  { id: 'cold', name: 'Salad & Cold' },
  { id: 'drinks', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' }
];

export const INITIAL_KDS_ORDERS = [
  {
    id: 'K101',
    orderNum: '1023',
    source: 'QR Ordering',
    table: '7',
    startTime: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'preparing',
    station: 'mains',
    items: [
      { id: 'i1', name: 'Paneer Tikka', quantity: 2, note: 'Extra spicy', status: 'preparing' },
      { id: 'i2', name: 'Dal Makhani', quantity: 1, note: 'Less butter', status: 'preparing' }
    ]
  },
  {
    id: 'K102',
    orderNum: '1024',
    source: 'Staff App',
    table: '2',
    startTime: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'new',
    station: 'grill',
    items: [
      { id: 'i3', name: 'Veg Platter', quantity: 1, note: 'No onions', status: 'new' }
    ]
  },
  {
    id: 'K103',
    orderNum: '1025',
    source: 'POS System',
    table: '12',
    startTime: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'delayed',
    station: 'mains',
    items: [
      { id: 'i4', name: 'Butter Naan', quantity: 4, note: 'Well done', status: 'preparing' },
      { id: 'i5', name: 'Chicken Biryani', quantity: 1, note: 'Spicy', status: 'preparing' }
    ]
  },
  {
    id: 'K104',
    orderNum: '1026',
    source: 'QR Ordering',
    table: '5',
    startTime: new Date(Date.now() - 1 * 60000).toISOString(),
    status: 'new',
    station: 'drinks',
    items: [
      { id: 'i6', name: 'Mango Lassi', quantity: 2, note: 'Add more ice', status: 'new' }
    ]
  }
];
