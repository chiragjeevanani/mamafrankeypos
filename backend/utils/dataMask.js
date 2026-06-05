const StoreSettings = require('../models/StoreSettings');

const getMaskingRules = async () => {
  const settings = await StoreSettings.findOne() || {};
  return {
    visibilityDecrement: settings.visibilityDecrement || 0,
    maskQuantity: settings.maskQuantity || false,
    targetOutlet: settings.targetOutlet || 'Main Outlet (Sadar)',
    protocolPriceRange: settings.protocolPriceRange || 'Price Range: Standard',
    itemReplacements: settings.itemReplacements || [],
  };
};

const maskQuantityValue = (qty, rules) => {
  if (typeof qty !== 'number') return qty;
  if (!rules || !rules.maskQuantity || !rules.visibilityDecrement) return qty;
  
  const reduced = Math.floor(qty * (100 - rules.visibilityDecrement) / 100);
  return Math.max(1, reduced);
};

const maskCurrencyValue = (amount, itemName = null, rules) => {
  if (typeof amount !== 'number') return amount;
  if (!rules) return amount;
  
  // 1. Check for Targeted Item Replacement Price
  if (itemName && rules.itemReplacements && rules.itemReplacements.length > 0) {
    const match = rules.itemReplacements.find(r => r.originalItem.toLowerCase() === itemName.toLowerCase());
    if (match && match.replacedPrice !== undefined) {
      return match.replacedPrice;
    }
  }

  // 2. Fallback to Global Percentage Mask
  if (!rules.visibilityDecrement) return amount;
  
  const reduced = Math.floor(amount * (100 - rules.visibilityDecrement) / 100);
  return Math.max(0, reduced);
};

const getReplacedName = (originalName, rules) => {
  if (!rules || !rules.itemReplacements || rules.itemReplacements.length === 0) return originalName;
  const match = rules.itemReplacements.find(r => r.originalItem.toLowerCase() === originalName.toLowerCase());
  return match ? match.replacedWith : originalName;
};

// Masks a single order document/object
const maskOrder = (order, rules) => {
  if (!order) return order;
  // Deep clone to prevent mutating Mongoose documents directly
  const o = JSON.parse(JSON.stringify(order));
  
  let hasTargetedOverride = false;
  
  if (o.kots && Array.isArray(o.kots)) {
    o.kots.forEach(kot => {
      if (kot.items && Array.isArray(kot.items)) {
        kot.items.forEach(item => {
          if (item.status !== 'cancelled') {
            const isReplaced = rules.itemReplacements && rules.itemReplacements.some(r => r.originalItem.toLowerCase() === item.name.toLowerCase());
            if (isReplaced) {
              hasTargetedOverride = true;
            }
            
            // Mask item name
            item.name = getReplacedName(item.name, rules);
            
            // Mask item price
            const originalPrice = item.price;
            item.price = maskCurrencyValue(originalPrice, item.name, rules);
            
            // Mask item quantity
            item.quantity = maskQuantityValue(item.quantity, rules);
          }
        });
      }
    });
  }
  
  // Update subtotal and totalAmount
  if (hasTargetedOverride) {
    // Re-sum items
    let newSubtotal = 0;
    o.kots.forEach(kot => {
      if (kot.items && Array.isArray(kot.items)) {
        kot.items.forEach(item => {
          if (item.status !== 'cancelled') {
            newSubtotal += item.price * item.quantity;
          }
        });
      }
    });
    
    const taxAndDiff = o.totalAmount - o.subtotal;
    o.subtotal = newSubtotal;
    o.totalAmount = newSubtotal + maskCurrencyValue(taxAndDiff, null, rules);
  } else {
    o.subtotal = maskCurrencyValue(o.subtotal, null, rules);
    o.totalAmount = maskCurrencyValue(o.totalAmount, null, rules);
  }
  
  // Mask customer name if exists
  if (o.customer && o.customer.name) {
    o.customer.name = getReplacedName(o.customer.name, rules);
  }
  
  return o;
};

module.exports = {
  getMaskingRules,
  maskQuantityValue,
  maskCurrencyValue,
  getReplacedName,
  maskOrder
};
