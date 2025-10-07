

export const parseMoney = (value) => {
  const num = parseFloat(value || 0);
  return isNaN(num) ? 0 : num;
};

export const parseIntSafe = (value) => {
  const num = parseInt(value || 0);
  return isNaN(num) ? 0 : num;
};

export const lineTotal = (item) => {
  if (!item) return 0;
  if (typeof item.total_price !== 'undefined' && item.total_price !== null) {
    return parseMoney(item.total_price);
  }
  return parseMoney(item.unit_price) * parseIntSafe(item.quantity);
};

export const computeTotals = (items, backendSummary) => {
  if (backendSummary && (backendSummary.totalItems || parseMoney(backendSummary.totalPrice) > 0)) {
    return {
      subtotal: String(backendSummary.totalPrice),
      itemCount: backendSummary.totalItems,
      tax: '0.00',
      total: String(backendSummary.totalPrice),
    };
  }

  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((sum, it) => sum + lineTotal(it), 0);
  const itemCount = safeItems.reduce((sum, it) => sum + parseIntSafe(it.quantity), 0);

  return {
    subtotal: subtotal.toFixed(2),
    itemCount,
    tax: '0.00',
    total: subtotal.toFixed(2),
  };
};

export default {
  parseMoney,
  parseIntSafe,
  lineTotal,
  computeTotals,
};


