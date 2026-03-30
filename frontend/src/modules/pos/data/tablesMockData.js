export const TABLE_STATUS_COLORS = {
  blank: {
    label: 'Blank Table',
    color: '#f3f4f6',
    textColor: '#9ca3af',
    dot: '#d1d5db',
    borderColor: '#d1d5db',
    borderStyle: 'dashed'
  },
  running: {
    label: 'Running Table',
    color: '#3b82f6',
    textColor: '#ffffff',
    dot: '#ffffff',
    borderColor: '#2563eb',
    borderStyle: 'solid'
  },
  printed: {
    label: 'Printed Table',
    color: '#f59e0b',
    textColor: '#ffffff',
    dot: '#ffffff',
    borderColor: '#d97706',
    borderStyle: 'solid'
  },
  paid: {
    label: 'Paid Table',
    color: '#10b981',
    textColor: '#ffffff',
    dot: '#ffffff',
    borderColor: '#059669',
    borderStyle: 'solid'
  },
  'running-kot': {
    label: 'Running KOT Table',
    color: '#facc15',
    textColor: '#000000',
    dot: '#000000',
    borderColor: '#eab308',
    borderStyle: 'solid'
  }
};

export const TABLE_SECTIONS = [
  {
    id: 'ac',
    label: 'AC',
    tables: Array.from({ length: 20 }, (_, i) => ({
      id: `AC${i + 1}`,
      name: `AC${i + 1}`,
      status: i === 3 ? 'running' : (i === 15 ? 'printed' : 'blank'),
      capacity: 4
    }))
  },
  {
    id: 'garden',
    label: 'Garden',
    tables: Array.from({ length: 20 }, (_, i) => ({
      id: `G${i + 21}`,
      name: `G${i + 21}`,
      status: i === 5 ? 'paid' : (i === 12 ? 'running-kot' : 'blank'),
      capacity: 6
    }))
  },
  {
    id: 'non-ac',
    label: 'Non-AC',
    tables: Array.from({ length: 15 }, (_, i) => ({
      id: `NAC${i + 1}`,
      name: `NAC${i + 1}`,
      status: 'blank',
      capacity: 4
    }))
  },
  {
    id: 'rooftops',
    label: 'Rooftops',
    tables: Array.from({ length: 10 }, (_, i) => ({
      id: `R${i + 1}`,
      name: `R${i + 1}`,
      status: 'blank',
      capacity: 4
    }))
  },
  {
    id: 'second-floor',
    label: 'Second Floor',
    tables: Array.from({ length: 12 }, (_, i) => ({
      id: `SF${i + 1}`,
      name: `SF${i + 1}`,
      status: 'blank',
      capacity: 4
    }))
  }
];
