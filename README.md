# AdPilot test site (fictional data)

A small static site, "Deneme Kahve Dükkanı", used to test AdPilot's
conversion measurement flows. Every name, price, phone number, e-mail address
and order on it is fictional. It is not a real business and takes no orders.

- Google Tag Manager test container `GTM-T897QT2B` on every page, with a Consent
  Mode v2 default set before it.
- `index.html`: CTA button `#cta-siparis-ver`, a second CTA
  `#cta-tadim-iste` whose text sits in child spans, tel:, mailto:, wa.me links,
  a plain form `#iletisim-formu` (success element `#form-basari`) and a
  pushState link (`?bolum=menu`).
- `iletisim.html`: Contact Form 7 markup, fires `wpcf7mailsent` on a fake send.
- `products.html`, `product.html`, `cart.html`, `checkout.html`:
  GA4 `view_item_list`, `view_item`, `add_to_cart`, `view_cart`,
  `begin_checkout`, `add_payment_info` (after a pushState to `odeme.html`).
- `tesekkurler.html?order=...`: GA4 `purchase` with `ecommerce.value`
  (number), `ecommerce.currency` (`TRY`) and `ecommerce.transaction_id`.

No build step: plain HTML, CSS and JavaScript. `noindex,nofollow` on every
page and a robots.txt that disallows everything.
