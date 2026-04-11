import { TABLE_STATUS_COLORS } from '../data/tablesMockData';

export const TABLE_LIFECYCLE_DEFAULTS = Object.freeze({
  orderPlaced: false,
  kotPrinted: false,
  billPrinted: false,
  paymentMode: null,
});

export const normalizePaymentMode = (mode) => {
  if (!mode) return null;

  const value = String(mode).trim().toLowerCase();

  if (value === 'cash') return 'cash';
  if (value === 'upi') return 'upi';
  if (['cashless', 'card', 'other', 'part', 'due'].includes(value)) return 'cashless';

  return value;
};

export const normalizeTableLifecycle = (entity = {}) => {
  const hasExplicitLifecycle =
    Object.prototype.hasOwnProperty.call(entity, 'orderPlaced') ||
    Object.prototype.hasOwnProperty.call(entity, 'kotPrinted') ||
    Object.prototype.hasOwnProperty.call(entity, 'billPrinted') ||
    Object.prototype.hasOwnProperty.call(entity, 'paymentMode');

  const normalizedPaymentMode =
    entity.paymentMode ?? normalizePaymentMode(entity.paymentMethod) ?? null;

  if (hasExplicitLifecycle) {
    return {
      ...TABLE_LIFECYCLE_DEFAULTS,
      ...entity,
      paymentMode: normalizedPaymentMode,
    };
  }

  const inferred = { ...TABLE_LIFECYCLE_DEFAULTS };

  if (entity.status === 'running-kot') {
    inferred.orderPlaced = true;
  }

  if (entity.status === 'printed' || entity.status === 'paid' || entity.status === 'running') {
    inferred.orderPlaced = true;
    inferred.kotPrinted = true;
  }

  if (entity.status === 'printed' || entity.status === 'paid') {
    inferred.billPrinted = true;
  }

  if (entity.status === 'paid') {
    inferred.paymentMode = normalizedPaymentMode;
  }

  return {
    ...entity,
    ...inferred,
    paymentMode: normalizedPaymentMode ?? inferred.paymentMode,
  };
};

export const applyTableLifecycle = (entity = {}, updates = {}) => {
  const next = normalizeTableLifecycle({ ...entity, ...updates });

  let status = entity.status;

  if (!next.orderPlaced) {
    status = 'blank';
  } else if (next.kotPrinted || next.billPrinted) {
    status = 'printed';
  } else {
    status = 'running-kot';
  }

  return {
    ...entity,
    ...next,
    status,
  };
};

export const resetTableLifecycle = (entity = {}) => ({
  ...entity,
  ...TABLE_LIFECYCLE_DEFAULTS,
  status: 'blank',
});

export const getTableColor = (table = {}) => {
  const normalized = normalizeTableLifecycle(table);

  if (normalized.orderPlaced && !normalized.kotPrinted) {
    return TABLE_STATUS_COLORS['running-kot'];
  }

  if (normalized.kotPrinted) {
    return TABLE_STATUS_COLORS['kot-printed'];
  }

  return TABLE_STATUS_COLORS.blank;
};

export const getTableStatusText = (table = {}) => {
  const normalized = normalizeTableLifecycle(table);

  if (normalized.billPrinted) return 'Settlement Ready';
  if (normalized.kotPrinted) return 'KOT Printed';
  if (normalized.orderPlaced) return 'KOT Pending';
  return 'Available';
};
