export const STAFF_ROLES = {
  WAITER: 'waiter',
  CAPTAIN: 'captain',
  MANAGER: 'manager'
};

export const STAFF_USERS = [
  { id: 'S1', name: 'John Doe', role: 'waiter', pin: '1234' },
  { id: 'S2', name: 'Jane Smith', role: 'captain', pin: '2222' },
  { id: 'S3', name: 'Alex Ross', role: 'manager', pin: '3333' }
];

export const TABLES = [
  { id: 1, number: '1', capacity: 2, status: 'available', currentOrder: null },
  { id: 2, number: '2', capacity: 2, status: 'occupied', currentOrder: { id: 'ORD123', amount: 1250, status: 'preparing', startTime: '12:15 PM' } },
  { id: 3, number: '3', capacity: 4, status: 'available', currentOrder: null },
  { id: 4, number: '4', capacity: 4, status: 'reserved', currentOrder: null },
  { id: 5, number: '5', capacity: 6, status: 'occupied', currentOrder: { id: 'ORD124', amount: 3400, status: 'cooking', startTime: '12:30 PM' } },
  { id: 6, number: '6', capacity: 4, status: 'cleaning', currentOrder: null },
  { id: 7, number: '7', capacity: 4, status: 'occupied', currentOrder: { id: 'ORD125', amount: 800, status: 'ready', startTime: '12:45 PM' } },
  { id: 8, number: '8', capacity: 2, status: 'available', currentOrder: null },
];

export const ACTIVE_ORDERS = [
  {
    id: 'ORD123',
    table: '2',
    items: [
      { id: '1', name: 'Paneer Tikka', quantity: 2, status: 'preparing' },
      { id: '2', name: 'Dal Makhani', quantity: 1, status: 'cooking' }
    ],
    status: 'preparing',
    timeElapsed: '15m'
  },
  {
    id: 'ORD125',
    table: '7',
    items: [
      { id: '3', name: 'Butter Naan', quantity: 4, status: 'ready' }
    ],
    status: 'ready',
    timeElapsed: '5m'
  }
];
