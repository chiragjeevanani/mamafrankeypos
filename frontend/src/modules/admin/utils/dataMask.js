
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
 * Applies the mask to currency values too, if needed.
 */
export const maskCurrency = (amount) => {
  if (typeof amount !== 'number') return amount;
  
  const percentStr = localStorage.getItem('rms_visibility_decrement');
  const percent = percentStr ? parseInt(percentStr) : 0;
  
  if (percent === 0) return amount;
  
  // For currency, we can just reduce it. No "min 1" rule usually, but here we can follow the same spirit.
  const reduced = Math.floor(amount * (1 - percent / 100));
  return Math.max(1, reduced);
};
