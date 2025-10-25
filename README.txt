HeyZuZuBee Catalog - Static Website
-----------------------------------

What's included:
- index.html
- styles.css
- app.js
- products.json (9 sample products)
- images/product1..product9.svg

WhatsApp number:
- Currently set to +91 9999999999 inside app.js (WHATSAPP_NUMBER).
  To change it, open app.js and replace WHATSAPP_NUMBER value (use country code without '+' or spaces, e.g. 919876543210).

How to deploy to Hostinger:
1. Compress the contents of this folder into a zip (or use the provided zip).
2. In Hostinger's File Manager, upload and extract into the public_html (or the folder used for your site).
3. Visit your domain to see the catalog.
4. To edit products, open products.json and change names, prices, descriptions, or images.
5. Replace images in /images or reference external URLs.

Behavior:
- Customers add items, open the cart, optionally add name/address, and click 'Checkout via WhatsApp'.
- WhatsApp will open (web or app) with a pre-filled message listing the items and total.
- The customer must click 'Send' in WhatsApp to send the order.

If you want:
- A .zip with these files is ready for download.
- I can also convert this to a React starter, or add quantity selectors directly on product cards, payment links, or online payment integration later.

