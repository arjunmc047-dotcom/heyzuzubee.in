const WHATSAPP_NUMBER = "919061637881";
let products = [];
let cart = {};

// Load products from JSON
async function loadProducts() {
  const res = await fetch('products.json');
  products = await res.json();
  renderProducts();
}

// Render product cards
function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="row">
        <div>₹${p.price.toFixed(2)}</div>
        <div class="qty">
          <button class="btn add-btn" data-id="${p.id}">+</button>
          <span class="item-qty" id="qty-${p.id}">0</span>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      addToCart(e.currentTarget.dataset.id);
    });
  });
}

// Add item to cart
function addToCart(id) {
  const product = products.find(x => x.id === id);
  if (!product) return;
  cart[id] = cart[id] || { ...product, qty: 0 };
  cart[id].qty += 1;
  updateCartUI();
}

// Update cart UI
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

  // Add event listeners for plus/minus buttons
  itemsDiv.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (e.currentTarget.dataset.op === 'minus') {
        if (cart[id]) {
          cart[id].qty -= 1;
          if (cart[id].qty <= 0) delete cart[id];
        }
      } else {
        addToCart(id);
      }
      updateCartUI();
    });
  });
}

// Toggle cart panel
document.getElementById('cart-btn').addEventListener('click', () => {
  const panel = document.getElementById('cart-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-panel').style.display = 'none';
});

// WhatsApp checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
  const name = document.getElementById('cust-name').value;
  const note = document.getElementById('cust-note').value;

  if (Object.keys(cart).length === 0) {
    alert('Cart is empty!');
    return;
  }

  let msg = 'Order from ZuZuBee:\n';
  Object.values(cart).forEach(item => {
    msg += `${item.name} x ${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
  });
  msg += `Total: ₹${Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0).toFixed(2)}\n`;
  if (name) msg += `Name: ${name}\n`;
  if (note) msg += `Note/Address: ${note}\n`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});
document.addEventListener('DOMContentLoaded', function() {
  // Scroll to products on arrow click
  document.getElementById('scroll-btn').addEventListener('click', function() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });

  // Scroll to products on down arrow key
  document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowDown") {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
  });
});
// Initialize
loadProducts();
