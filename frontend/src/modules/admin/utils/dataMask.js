
/**
 * Applies a decrement percentage to a quantity for data visibility masking.
 * Ensures the result is never less than 1.
 */
/**
 * Applies a decrement percentage to a quantity for data visibility masking.
 * Ensures the result is never less than 1.
 */
export const maskQuantity = (qty) => {
  if (typeof qty !== 'number') return qty;
  
  const percentStr = localStorage.getItem('rms_visibility_decrement');
  const percent = percentStr ? parseInt(percentStr) : 0;
  
  if (percent === 0) return qty;
  
  const reduced = Math.floor(qty * (1 - percent / 100));
  return Math.max(1, reduced);
};

/**
 * Applies the mask to currency values, considering targeted item replacements.
 */
export const maskCurrency = (amount, itemName = null) => {
  if (typeof amount !== 'number') return amount;
  
  // 1. Check for Targeted Item Replacement Price
  if (itemName) {
    try {
      const savedSettings = localStorage.getItem('rms_item_replacements');
      if (savedSettings) {
        const replacements = JSON.parse(savedSettings);
        const match = replacements.find(r => r.originalItem.toLowerCase() === itemName.toLowerCase());
        if (match && match.replacedPrice !== undefined) {
          return match.replacedPrice;
        }
      }
    } catch (e) {
      console.error("Masking Engine Error:", e);
    }
  }

  // 2. Fallback to Global Percentage Mask
  const percentStr = localStorage.getItem('rms_visibility_decrement');
  const percent = percentStr ? parseInt(percentStr) : 0;
  
  if (percent === 0) return amount;
  
  const reduced = Math.floor(amount * (1 - percent / 100));
  return Math.max(0, reduced);
};

/**
 * Utility to get the replaced name for an item based on active protocols.
 */
export const getReplacedName = (originalName) => {
  try {
    const savedSettings = localStorage.getItem('rms_item_replacements');
    if (savedSettings) {
      const replacements = JSON.parse(savedSettings);
      const match = replacements.find(r => r.originalItem.toLowerCase() === originalName.toLowerCase());
      return match ? match.replacedWith : originalName;
    }
  } catch {
    return originalName;
  }
  return originalName;
};

/**
 * Calculates the total amount for an order after applying all active protocols.
 */
export const calculateMaskedOrderTotal = (order) => {
  if (!order || !order.kots) return 0;
  
  let total = 0;
  let hasTargetedOverride = false;

  order.kots.forEach(kot => {
    kot.items.forEach(item => {
      if (item.status !== 'cancelled') {
        const maskedPrice = maskCurrency(item.price, item.name);
        if (maskedPrice !== item.price) hasTargetedOverride = true;
        total += maskedPrice * item.quantity;
      }
    });
  });

  // If targeted overrides were applied, we use the recalculated total.
  // Otherwise, we apply the global percentage mask to the order's total amount.
  if (hasTargetedOverride) {
    // Note: This simplified calculation might differ slightly from original taxes/discounts 
    // but serves the purpose of targeted "manipulation".
    return total;
  }
  
  return maskCurrency(order.totalAmount);
};
