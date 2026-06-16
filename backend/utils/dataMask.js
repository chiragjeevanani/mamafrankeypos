const StoreSettings = require('../models/StoreSettings');

const getMaskingRules = async () => {
  const settings = await StoreSettings.findOne() || {};
  return {
    visibilityDecrement: settings.visibilityDecrement || 0,
    maskQuantity: settings.maskQuantity || false,
    targetOutlet: settings.targetOutlet || 'Main Outlet (Sadar)',
    protocolPriceRange: settings.protocolPriceRange || 'Price Range: Standard',
    itemReplacements: settings.itemReplacements || [],
    taxes: settings.taxes || []
  };
};

/**
 * Used only for the "Quantity Masking" display toggle (units column).
 * Does NOT affect the global decrement logic.
 */
const maskQuantityValue = (qty, rules) => {
  if (typeof qty !== 'number') return qty;
  if (!rules || !rules.maskQuantity || !rules.visibilityDecrement) return qty;
  const reduced = Math.floor(qty * (100 - rules.visibilityDecrement) / 100);
  return Math.max(1, reduced);
};

/**
 * Kept for summary-level totals (dashboard, etc.) where we still want a
 * simple percentage mask on a single number.
 * For order items, prices are no longer changed — only quantities are reduced.
 */
const maskCurrencyValue = (amount, itemName = null, rules) => {
  if (typeof amount !== 'number') return amount;
  if (!rules) return amount;

  // Surgical replacement price override
  if (itemName && rules.itemReplacements && rules.itemReplacements.length > 0) {
    const match = rules.itemReplacements.find(
      r => r.originalItem.toLowerCase() === itemName.toLowerCase()
    );
    if (match && match.replacedPrice !== undefined) {
      return match.replacedPrice;
    }
  }

  // Global percentage mask (for summary totals only)
  if (!rules.visibilityDecrement) return amount;
  const reduced = Math.floor(amount * (100 - rules.visibilityDecrement) / 100);
  return Math.max(0, reduced);
};

const getReplacedName = (originalName, rules) => {
  if (!rules || !rules.itemReplacements || rules.itemReplacements.length === 0) return originalName;
  const match = rules.itemReplacements.find(
    r => r.originalItem.toLowerCase() === originalName.toLowerCase()
  );
  return match ? match.replacedWith : originalName;
};

/**
 * Masks a single order for the Adjustment Audit view.
 *
 * New Strategy:
 *  1. Apply surgical name replacements (and price overrides if a replacement rule exists).
 *  2. Calculate the target subtotal = originalSubtotal * (100 - decrement%) / 100.
 *  3. Iteratively remove 1 unit from the cheapest active item until the running
 *     subtotal reaches the target. Items that hit qty=0 are removed from the bill.
 *  4. Recalculate subtotal / taxes / totalAmount proportionally.
 *  5. Optionally apply the qty-display mask (maskQuantity toggle).
 *
 * Prices of individual items are NEVER changed by the global decrement.
 */
const maskOrder = (order, rules) => {
  if (!order) return order;
  // Deep-clone to avoid mutating the Mongoose document
  const o = JSON.parse(JSON.stringify(order));

  const decrement = (rules && rules.visibilityDecrement) ? Number(rules.visibilityDecrement) : 0;

  // ── Step 1: Surgical Name + Price Replacements ──────────────────────────────
  if (o.kots && Array.isArray(o.kots)) {
    o.kots.forEach(kot => {
      if (kot.items && Array.isArray(kot.items)) {
        kot.items.forEach(item => {
          if (item.status !== 'cancelled') {
            const originalName = item.name;
            // Replace display name
            item.name = getReplacedName(originalName, rules);
            // Replace price ONLY when there is an explicit surgical rule for this item
            if (rules && rules.itemReplacements && rules.itemReplacements.length > 0) {
              const ruleMatch = rules.itemReplacements.find(
                r => r.originalItem.toLowerCase() === originalName.toLowerCase()
              );
              if (ruleMatch && ruleMatch.replacedPrice !== undefined && ruleMatch.replacedPrice > 0) {
                item.price = ruleMatch.replacedPrice;
              }
            }
          }
        });
      }
    });
  }

  // ── Step 2: Quantity Reduction to meet the target subtotal ──────────────────
  if (decrement > 0) {
    // Build a flat list of references to all active items
    let activeItems = [];
    o.kots.forEach((kot, ki) => {
      (kot.items || []).forEach((item, ii) => {
        if (item.status !== 'cancelled' && item.quantity > 0) {
          activeItems.push({ ki, ii, price: item.price, qty: item.quantity });
        }
      });
    });

    // Count total active units across the entire bill
    const totalActiveUnitsAtStart = activeItems.reduce((s, r) => s + r.qty, 0);

    // If the bill only has 1 unit in total across all items, skip reduction entirely.
    // That single item+unit is the absolute floor and must never be touched.
    if (totalActiveUnitsAtStart > 1) {
      // Current subtotal from active items
      const currentSubtotal = activeItems.reduce((s, r) => s + r.price * r.qty, 0);
      // Target: reduce by the decrement %
      const targetSubtotal = currentSubtotal * (100 - decrement) / 100;

      // Iteratively remove 1 unit from the cheapest item until we reach the target
      while (true) {
        // Count total remaining units across ALL items (floor check)
        const totalRemainingUnits = activeItems
          .filter(r => r.qty > 0)
          .reduce((s, r) => s + r.qty, 0);

        // Hard floor: stop when only 1 unit remains in the entire bill
        if (totalRemainingUnits <= 1) break;

        const runningSubtotal = activeItems
          .filter(r => r.qty > 0)
          .reduce((s, r) => s + r.price * r.qty, 0);

        // Target reached — stop
        if (runningSubtotal <= targetSubtotal) break;

        // Pick the cheapest item that still has units (qty > 0)
        const available = activeItems.filter(r => r.qty > 0);
        if (available.length === 0) break;

        // Sort cheapest unit price first; for ties, prioritise item with more total contribution
        available.sort((a, b) =>
          a.price !== b.price
            ? a.price - b.price
            : (b.price * b.qty) - (a.price * a.qty)
        );
        available[0].qty -= 1;
      }
    }

    // Write the modified quantities back into the cloned order
    activeItems.forEach(({ ki, ii, qty }) => {
      o.kots[ki].items[ii].quantity = qty;
    });

    // Remove items whose quantity was reduced to 0 (keep cancelled items for audit trail)
    o.kots.forEach(kot => {
      kot.items = (kot.items || []).filter(item => {
        if (item.status === 'cancelled') return true;
        return item.quantity > 0;
      });
    });

    // Remove KOTs that ended up with no remaining items
    o.kots = o.kots.filter(kot => (kot.items || []).length > 0);
  }

  // ── Step 3: Recalculate subtotal / taxes / totalAmount ──────────────────────
  let newSubtotal = 0;
  o.kots.forEach(kot => {
    (kot.items || []).forEach(item => {
      if (item.status !== 'cancelled') {
        newSubtotal += item.price * item.quantity;
      }
    });
  });

  const originalSubtotal = o.subtotal || 0;
  const scale = originalSubtotal > 0 ? newSubtotal / originalSubtotal : 1;

  o.subtotal = Number(newSubtotal.toFixed(2));

  // Scale or dynamically populate taxes proportionally
  if (!o.taxes || o.taxes.length === 0) {
    const activeTaxes = (rules && rules.taxes || []).filter(t => t.active);
    if (activeTaxes.length > 0) {
      const totalTaxRate = activeTaxes.reduce((sum, t) => sum + (t.percentage || 0), 0);
      const discountAmt = o.discount?.amount || 0;
      const taxableAmount = Math.max(0, newSubtotal - discountAmt);
      o.taxes = activeTaxes.map(t => ({
        name: t.name,
        rate: t.percentage,
        amount: Number((taxableAmount * (t.percentage / 100)).toFixed(2))
      }));
    } else {
      o.taxes = [];
    }
  } else {
    o.taxes = o.taxes.map(t => ({
      ...t,
      amount: Number(((t.amount || 0) * scale).toFixed(2))
    }));
  }

  // Scale discount proportionally
  if (o.discount && o.discount.amount) {
    o.discount.amount = Number(((o.discount.amount || 0) * scale).toFixed(2));
  }

  const newTaxSum = (o.taxes || []).reduce((s, t) => s + (t.amount || 0), 0);
  const newDiscountAmt = o.discount?.amount || 0;
  o.totalAmount = Number((newSubtotal + newTaxSum - newDiscountAmt).toFixed(2));

  return o;
};

module.exports = {
  getMaskingRules,
  maskQuantityValue,
  maskCurrencyValue,
  getReplacedName,
  maskOrder
};
