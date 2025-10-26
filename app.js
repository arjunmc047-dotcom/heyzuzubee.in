const WHATSAPP_LINK = "https://bit.ly/Chatwithzuzubee";
const MIN_SHIPPING = 50;
const FREE_SHIPPING_LIMIT = 500;

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

    const imagesHtml = p.images.map((img, index) => `
      <img src="${img}" class="slide ${index === 0 ? 'active' : ''}" alt="${p.name}">
    `).join('');

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
          <span class="item-qty" id="qty-${p.id}">0</span>
          <button class="btn increase" data-id="${p.id}">+</button>
          <button class="btn add-btn" data-id="${p.id}" disabled>Add</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  // Quantity + / − buttons in product card
  document.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      let qty = parseInt(qtyEl.textContent);
      qty += 1;
      qtyEl.textContent = qty;

      const addBtn = document.querySelector(`.add-btn[data-id="${id}"]`);
      if (addBtn) addBtn.disabled = qty === 0;
    });
  });

  document.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      let qty = parseInt(qtyEl.textContent);
      if (qty > 0) qty -= 1;
      qtyEl.textContent = qty;

      const addBtn = document.querySelector(`.add-btn[data-id="${id}"]`);
      if (addBtn) addBtn.disabled = qty === 0;
    });
  });

  // Initialize Add buttons as disabled
  document.querySelectorAll('.add-btn').forEach(btn => btn.disabled = true);

  // Add button to add products to cart
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const qtyEl = document.getElementById(`qty-${id}`);
      const quantity = parseInt(qtyEl.textContent);
      if (quantity <= 0) return;

      addToCart(id, quantity);
      qtyEl.textContent = '0';
      e.currentTarget.disabled = true;
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

// Add product to cart
function addToCart(id, quantity) {
  const product = products.find(x => x.id === id);
  if (!product) return;
  cart[id] = cart[id] || { ...product, qty: 0 };
  cart[id].qty += quantity;
  updateCartUI();
}

// Change quantity in cart panel
function changeQuantity(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
}

// Remove product from cart
function removeFromCart(id) {
  delete cart[id];
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';

  const subtotal = Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_LIMIT ? 0 : (subtotal > 0 ? MIN_SHIPPING : 0);
  const total = subtotal + shipping;

  // Update cart count
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;

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
        <div style="margin-top:6px; display:flex; gap:4px; justify-content:flex-end">
          <button class="btn" data-op="minus" data-id="${item.id}">−</button>
          <button class="btn" data-op="plus" data-id="${item.id}">+</button>
          <button class="btn remove" data-id="${item.id}" style="background:red;color:white">Remove</button>
        </div>
      </div>
    `;
    itemsDiv.appendChild(node);
  });

  // Cart buttons
  itemsDiv.querySelectorAll('button').forEach(btn => {
    const id = btn.dataset.id;
    if (btn.classList.contains('remove')) {
      btn.addEventListener('click', () => removeFromCart(id));
    } else if (btn.dataset.op === 'minus') {
      btn.addEventListener('click', () => changeQuantity(id, -1));
    } else if (btn.dataset.op === 'plus') {
      btn.addEventListener('click', () => changeQuantity(id, 1));
    }
  });

  // Update product card qty and add button
  products.forEach(p => {
    const qtyEl = document.getElementById(`qty-${p.id}`);
    qtyEl.textContent = '0';
    const addBtn = document.querySelector(`.add-btn[data-id="${p.id}"]`);
    if (addBtn) addBtn.disabled = true;
  });

  // Update cart totals with shipping
  document.getElementById('cart-total').textContent = total.toFixed(2);

  // Optionally, display shipping separately if you want:
  // You can add a small div inside cart-panel for shipping if needed
}

// Cart toggle
document.getElementById('cart-btn').addEventListener('click', () => {
  const panel = document.getElementById('cart-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-panel').style.display = 'none';
});

// Checkout to WhatsApp
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

  const subtotal = Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_LIMIT ? 0 : (subtotal > 0 ? MIN_SHIPPING : 0);
  const total = subtotal + shipping;

  let msg = '🛍️ *Order from ZuZuBee*\n\n';
  Object.values(cart).forEach(item => {
    msg += `• ${item.name} x ${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
  });
  msg += `\nSubtotal: ₹${subtotal.toFixed(2)}\n`;
  msg += shipping === 0 ? 'Shipping: Free 🚚\n' : `Shipping: ₹${shipping.toFixed(2)}\n`;
  msg += `Total: ₹${total.toFixed(2)}\n\n`;
  msg += `👤 Name: ${name}\n🏠 Address/Note: ${note}\nPlease share the payment details`;

 
  // Open WhatsApp with pre-filled message
  const waUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
});

// Scroll down button
document.addEventListener('DOMContentLoaded', function() {
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

// Initialize
loadProducts();
