/*
 * Deneme Kahve Dukkani: shared behaviour for the AdPilot test site.
 * Everything here is fictional. No request leaves the browser except
 * Google Tag Manager's own. Cart and consent live in localStorage.
 */
(function () {
  'use strict';

  var w = window;
  var d = document;
  w.dataLayer = w.dataLayer || [];

  var PRODUCTS = [
    { id: 'DK-ESP-250', slug: 'espresso-harmani', name: 'Espresso Harmanı 250 g', category: 'Kahve Çekirdeği', price: 349.9 },
    { id: 'DK-ETI-250', slug: 'etiyopya-yirgacheffe', name: 'Etiyopya Yirgacheffe 250 g', category: 'Kahve Çekirdeği', price: 429.5 },
    { id: 'DK-TRK-200', slug: 'turk-kahvesi', name: 'Türk Kahvesi 200 g', category: 'Öğütülmüş Kahve', price: 189 },
    { id: 'DK-V60-001', slug: 'v60-demleme-seti', name: 'V60 Demleme Seti', category: 'Ekipman', price: 1250 }
  ];

  var CART_KEY = 'deneme_cart';
  var LAST_ORDER_KEY = 'deneme_last_order';
  var CONSENT_KEY = 'deneme_consent';

  function money(n) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function findProduct(slugOrId) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].slug === slugOrId || PRODUCTS[i].id === slugOrId) return PRODUCTS[i];
    }
    return null;
  }

  function toItem(p, qty) {
    return {
      item_id: p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      quantity: qty || 1
    };
  }

  function readJson(key, fallback) {
    try {
      var raw = w.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      w.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* private mode: the cart simply does not persist */
    }
  }

  function cart() {
    return readJson(CART_KEY, []);
  }

  function cartItems() {
    return cart()
      .map(function (line) {
        var p = findProduct(line.id);
        return p ? toItem(p, line.quantity) : null;
      })
      .filter(Boolean);
  }

  function cartValue(items) {
    return round2(
      items.reduce(function (sum, it) {
        return sum + it.price * it.quantity;
      }, 0)
    );
  }

  function addToCart(p, qty) {
    var lines = cart();
    var found = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === p.id) {
        lines[i].quantity += qty;
        found = true;
      }
    }
    if (!found) lines.push({ id: p.id, quantity: qty });
    writeJson(CART_KEY, lines);
    updateCartBadge();
  }

  function clearCart() {
    writeJson(CART_KEY, []);
    updateCartBadge();
  }

  function updateCartBadge() {
    var badge = d.getElementById('sepet-adet');
    if (!badge) return;
    var n = cart().reduce(function (s, l) {
      return s + l.quantity;
    }, 0);
    badge.textContent = String(n);
  }

  /* GA4 recommends clearing the previous ecommerce object before each push. */
  function pushEcommerce(event, ecommerce) {
    w.dataLayer.push({ ecommerce: null });
    w.dataLayer.push({ event: event, ecommerce: ecommerce });
  }

  function randomOrderId() {
    var n = Math.floor(Math.random() * 1e8);
    return 'TST-' + Date.now().toString(36).toUpperCase() + '-' + n.toString(36).toUpperCase();
  }

  /* Consent banner: the default (all denied) is set inline in each page's
   * head, before Tag Manager. This only records the visitor's choice. */
  function consentState(granted) {
    var v = granted ? 'granted' : 'denied';
    return { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v };
  }

  function initConsentBanner() {
    var banner = d.getElementById('cerez-bandi');
    if (!banner) return;
    if (readJson(CONSENT_KEY, null)) return;
    banner.hidden = false;
    d.getElementById('cerez-kabul').addEventListener('click', function () {
      w.gtag('consent', 'update', consentState(true));
      w.dataLayer.push({ event: 'consent_update', consent_choice: 'granted' });
      writeJson(CONSENT_KEY, 'granted');
      banner.hidden = true;
    });
    d.getElementById('cerez-red').addEventListener('click', function () {
      w.gtag('consent', 'update', consentState(false));
      w.dataLayer.push({ event: 'consent_update', consent_choice: 'denied' });
      writeJson(CONSENT_KEY, 'denied');
      banner.hidden = true;
    });
  }

  d.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    initConsentBanner();
  });

  w.DenemeShop = {
    PRODUCTS: PRODUCTS,
    money: money,
    round2: round2,
    findProduct: findProduct,
    toItem: toItem,
    cart: cart,
    cartItems: cartItems,
    cartValue: cartValue,
    addToCart: addToCart,
    clearCart: clearCart,
    pushEcommerce: pushEcommerce,
    randomOrderId: randomOrderId,
    readJson: readJson,
    writeJson: writeJson,
    LAST_ORDER_KEY: LAST_ORDER_KEY
  };
})();
