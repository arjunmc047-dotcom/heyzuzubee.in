const WHATSAPP_NUMBER = "919061637881";
let products = [];
let cart = {};

// Load products from JSON (GitHub Pages safe)
async function loadProducts() {
  try {
    const res = await fetch('./products.json'); // Ensure products.json is in same folder
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

    // Create image slider container
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
        <div class="qty">
          <button class="btn add-btn" data-id="${p.id}">Add</button>
          <span class="item-qty" id="qty-${p.id}">0</span>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  // Add functionality for Add buttons
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => addToCart(e.currentTarget.dataset.id));
  });

  // Add functionality for image sliders
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
    `;
    container.appendChild(el);
  });

  // Attach add button listeners
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => addToCart(e.currentTarget.dataset.id));
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

// Update cart panel UI
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

  // Attach plus/minus buttons
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

// Cart panel toggle
document.getElementById('cart-btn').addEventListener('click', () => {
  const panel = document.getElementById('cart-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-panel').style.display = 'none';
});

// WhatsApp checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
  if (Object.keys(cart).length === 0) {
    alert('Cart is empty!');
    return;
  }

  const name = document.getElementById('cust-name').value;
  const note = document.getElementById('cust-note').value;

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

// Scroll arrow & down key
document.addEventListener('DOMContentLoaded', function() {
  const scrollBtn = document.getElementById('scroll-btn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const productsSection = document.getElementById('products');
      productsSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === "ArrowDown") {
      const productsSection = document.getElementById('products');
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Initialize
loadProducts();
