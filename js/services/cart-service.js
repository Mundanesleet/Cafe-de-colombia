/* ==========================================================================
   Cart service — state + persistence (localStorage)
   A cart line stores a snapshot of the product (name, price, image…) so the
   drawer can render instantly and keeps working if a product is later removed
   from the catalog. Lines are unique per product + grind option.
   Every change dispatches a "cart:change" event on window with the cart.
   ========================================================================== */
(function (CCC) {
  "use strict";

  const MAX_QUANTITY = 20;
  const STORAGE_KEY = CCC.config.storageKeys.cart;

  let lines = load();

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(isValidLine) : [];
    } catch (error) {
      return [];
    }
  }

  function isValidLine(line) {
    return line && typeof line.lineId === "string" && Number.isFinite(line.price) && line.quantity > 0;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch (error) {
      /* Private mode or storage full: the cart still works for this visit. */
    }
    notify();
  }

  function notify() {
    window.dispatchEvent(new CustomEvent("cart:change", { detail: getCart() }));
  }

  function clampQuantity(quantity) {
    return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(quantity) || 1)));
  }

  function buildLineId(productId, grind) {
    return `${productId}::${grind || "default"}`;
  }

  /** Adds a product (or increases its quantity). Returns the resulting line. */
  function addToCart(product, { quantity = 1, grind } = {}) {
    const selectedGrind = grind || getDefaultGrind(product);
    const lineId = buildLineId(product.id, selectedGrind);
    const existing = lines.find((line) => line.lineId === lineId);

    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + quantity);
    } else {
      lines.push({
        lineId,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        weight: product.weight,
        price: product.price,
        image: product.image,
        grind: selectedGrind,
        quantity: clampQuantity(quantity),
      });
    }
    persist();
    return lines.find((line) => line.lineId === lineId);
  }

  function updateQuantity(lineId, quantity) {
    const line = lines.find((item) => item.lineId === lineId);
    if (!line) return;
    if (quantity < 1) {
      removeFromCart(lineId);
      return;
    }
    line.quantity = clampQuantity(quantity);
    persist();
  }

  /** Alias kept for the API naming used in the project brief. */
  function updateCart(lineId, quantity) {
    updateQuantity(lineId, quantity);
  }

  function removeFromCart(lineId) {
    lines = lines.filter((line) => line.lineId !== lineId);
    persist();
  }

  function clearCart() {
    lines = [];
    persist();
  }

  function getDefaultGrind(product) {
    const firstType = product.types[0];
    return (CCC.data.taxonomy.grinds[firstType] || [firstType])[0];
  }

  /** Read-only snapshot with totals. Shipping is quoted at checkout. */
  function getCart() {
    const items = lines.map((line) => ({ ...line, total: line.price * line.quantity }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, count, subtotal, total: subtotal, maxQuantity: MAX_QUANTITY };
  }

  /* Keep several open tabs in sync. */
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    lines = load();
    notify();
  });

  CCC.cartService = {
    addToCart,
    updateQuantity,
    updateCart,
    removeFromCart,
    clearCart,
    getCart,
    getDefaultGrind,
    MAX_QUANTITY,
  };
})(window.CCC = window.CCC || {});
