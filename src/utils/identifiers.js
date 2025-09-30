// Simple, reusable helpers to extract identifiers from varying backend shapes

export const getCartId = (cartData) => {
  if (!cartData || typeof cartData !== 'object') return null;
  return cartData.cart_id || cartData.id || null;
};

export const getCartItemId = (item) => {
  if (!item || typeof item !== 'object') return null;
  return item.id || item.cart_item_id || null;
};

export const getProductIdFromItem = (item) => {
  if (!item || typeof item !== 'object') return null;
  return (
    item.product_id ||
    item.productId ||
    (item.product && (item.product.id || item.product.product_id || item.product.uuid)) ||
    null
  );
};

export default {
  getCartId,
  getCartItemId,
  getProductIdFromItem,
};


