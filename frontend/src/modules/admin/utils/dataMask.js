/**
 * Pass-through wrapper for quantity. Masking is now processed securely on the server-side.
 */
export const maskQuantity = (qty) => {
  return qty;
};

/**
 * Pass-through wrapper for currency. Masking is now processed securely on the server-side.
 */
export const maskCurrency = (amount, itemName = null) => {
  return amount;
};

/**
 * Pass-through wrapper for item names. Masking is now processed securely on the server-side.
 */
export const getReplacedName = (originalName) => {
  return originalName;
};

/**
 * Pass-through wrapper for order totals. Masking is now processed securely on the server-side.
 */
export const calculateMaskedOrderTotal = (order) => {
  return order?.totalAmount || 0;
};
