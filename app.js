const WHATSAPP_NUMBER = "919061637881";
let products = [];
let cart = {};

// Load products from JSON
async function loadProducts() {
  try {
    const res = await fetch('./products.json');
    if (!res.ok) throw new Error('Failed to fetch products.json');
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error(err);
    document.getElementById('products').innerHTML = "<p style='text-align:center;color:#888;'>Failed to load products.</p>";
  }
}

// Render product cards
function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';

  products.forEach(p => {
    const el = document.createElement('article');
    el.className = 'card';

    // Create image slider
    const imagesHtml = p.images.map((img, index) => `
      <img src="${img}" class="slide ${index === 0 ? 'active' : ''}" alt="${p.name}">
    `).join('');

    // Product card HTML with + / − and Add button
    el.innerHTML = `
      <div class="slider" data-id="${p.id}">
        ${imagesHtml}
        <button class="nav prev">‹</button>
        <button class="nav next">›</button>
      </div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="row">
        <div>₹${p.price.toFixed(2)}</div>
        <div class="qty-controls">
          <button class="btn decrease" data-id="${p.id}">−</button>
          <span class="item-qty" id="qty-${p.id}">1</span>
          <button class="btn increase" data-id="${p.id}">+</button>
          <button class="btn add-btn" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  // Quantity buttons (+ / −)
  document.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      let qty = parseInt(qtyEl.textContent);
      qtyEl.textContent = qty + 1;
    });
  });

  document.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      let qty = parseInt(qtyEl.textContent);
      if (qty > 1) qtyEl.textContent = qty - 1;
    });
  });

  // Add to Cart button
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      const quantity = parseInt(qtyEl.textContent);
      addToCart(id, quantity);
    });
  });

  // Image slider navigation
  document.querySelectorAll('.slider').forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    let current = 0;

    slider.querySelector('.next').addEventListener('click', () => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    });

    slider.querySelector('.prev').addEventListener('click', () => {
      slides[current].classList.remove('active');
      current = (current - 1 + slides.length) % slides.length;
      slides[current].classList.add('active');
    });
  });
}

// Add item to cart (with selected quantity)
function addToCart(id, quantity) {
  const product = products.find(x => x.id === id);
  if (!product) return;

  if (!cart[id]) {
    cart[id] = { ...product, qty: 0 };
  }
  cart[id].qty += quantity;

  // Reset product card quantity to 1 after adding
  document.getElementById(`qty-${id}`).textContent = 1;

  updateCartUI();
}

// Update cart panel
function updateCartUI() {
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;

  const total = Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);

  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';

  Object.values(cart).forEach(item => {
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `
      <div style="flex:1">
        <strong>${item.name}</strong><br/>
        <small>₹${item.price.toFixed(2)} × ${item.qty}</small>
      </div>
      <div style="text-align:right">
        <div>₹${(item.price * item.qty).toFixed(2)}</div>
        <div style="margin-top:6px">
          <button class="btn" data-op="minus" data-id="${item.id}">-</button>
          <button class="btn" data-op="plus" data-id="${item.id}">+</button>
        </div>
      </div>
    `;
    itemsDiv.appendChild(node);
  });

  // Cart panel +/− buttons
  itemsDiv.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (e.currentTarget.dataset.op === 'minus') {
        changeQuantity(id, -1);
      } else {
        changeQuantity(id, 1);
      }
    });
  });
}

// Change quantity from cart
function changeQuantity(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
}

// Cart toggle
document.getElementById('cart-btn').addEventListener('click', () => {
  const panel = document.getElementById('cart-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-panel').style.display = 'none';
});

// WhatsApp Checkout
const MIN_SHIPPING = 50;
const FREE_SHIPPING_LIMIT = 500;

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (Object.keys(cart).length === 0) {
    alert('Cart is empty!');
    return;
  }

  const name = document.getElementById('cust-name').value.trim();
  const note = document.getElementById('cust-note').value.trim();

  if (!name || !note) {
    alert('Please enter your Name and Address/Note before checkout.');
    return;
  }

  let subtotal = Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0);
  let shipping = subtotal >= FREE_SHIPPING_LIMIT ? 0 : MIN_SHIPPING;
  let total = subtotal + shipping;

  document.getElementById('cart-total').textContent = total.toFixed(2);

  let msg = '🛍️ *Order from ZuZuBee*\n\n';
  Object.values(cart).forEach(item => {
    msg += `• ${item.name} x ${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
  });
  msg += `\nSubtotal: ₹${subtotal.toFixed(2)}\n`;
  msg += shipping === 0 ? 'Shipping: Free 🚚\n' : `Shipping: ₹${shipping.toFixed(2)}\n`;
  msg += `Total: ₹${total.toFixed(2)}\n\n`;
  msg += `👤 Name: ${name}\n🏠 Address/Note: ${note}`;
  msg += `\nPlease share the payment details`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// Scroll down button
document.addEventListener('DOMContentLoaded', () => {
  const scrollBtn = document.getElementById('scroll-btn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === "ArrowDown") {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Init
loadProducts();
