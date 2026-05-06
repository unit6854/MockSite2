/* =============================================================================
   WARRIOR OF GOD TACTICAL — Cart Utility
   Persists cart in localStorage. Used by all pages + cart.html.
   ============================================================================= */
'use strict';

const WOGCart = (() => {
  const KEY = 'wog_cart';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; }
  }

  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e) {}
  }

  function count() {
    return get().reduce((sum, i) => sum + i.qty, 0);
  }

  function total() {
    return get().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function add(product, qty) {
    const items = get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id:    product.id,
        name:  product.name,
        brand: product.brand || '',
        price: product.price,
        image: product.image || '',
        qty:   qty,
      });
    }
    save(items);
    updateBadge();
  }

  function remove(id) {
    save(get().filter(i => i.id !== id));
    updateBadge();
  }

  function update(id, qty) {
    const items = get();
    const item = items.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); save(items); }
    updateBadge();
  }

  function clear() {
    save([]);
    updateBadge();
  }

  function updateBadge() {
    const n = count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = n;
      el.setAttribute('aria-label', n + ' items');
    });
  }

  function initBadge() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateBadge);
    } else {
      updateBadge();
    }
  }

  return { get, add, remove, update, clear, count, total, initBadge };
})();

WOGCart.initBadge();
