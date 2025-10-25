// WhatsApp number (update when ready) - set without + or spaces for the wa.me link
const WHATSAPP_NUMBER = "919999999999"; // corresponds to +91 9999999999

let products = [];
let cart = {};

async function loadProducts() {
  const res = await fetch('products.json');
  products = await res.json();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="row">
        <div>₹${p.price.toFixed(2)}</div>
        <div class="qty">
          <button class="btn add-btn" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    });
  });
}

function addToCart(id){
  const product = products.find(x=>x.id===id);
  if(!product) return;
  cart[id] = cart[id] || { ...product, qty:0 };
  cart[id].qty += 1;
  updateCartUI();
}

function updateCartUI(){
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = Object.values(cart).reduce((s,i)=>s+i.qty*i.price,0).toFixed(2);
  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';
  Object.values(cart).forEach(item=>{
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `
      <div style="flex:1">
        <strong>${item.name}</strong><br/>
        <small>₹${item.price.toFixed(2)} × ${item.qty}</small>
      </div>
      <div style="text-align:right">
        <div>₹${(item.price*item.qty).toFixed(2)}</div>
        <div style="margin-top:6px">
          <button class="btn" data-op="minus" data-id="${item.id}">-</button>
          <button class="btn" data-op="plus" data-id="${item.id}">+</button>
          <button class="btn" data-op="remove" data-id="${item.id}">x</button>
        </div>
      </div>
    `;
    itemsDiv.appendChild(node);
  });

  // attach quantity controls
  itemsDiv.querySelectorAll('button[data-op]').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      const op = e.currentTarget.dataset.op;
      if(op === 'plus') cart[id].qty +=1;
      if(op === 'minus') { cart[id].qty -=1; if(cart[id].qty<=0) delete cart[id]; }
      if(op === 'remove') delete cart[id];
      updateCartUI();
    });
  });
}

document.getElementById('cart-btn').addEventListener('click', ()=>{
  const panel = document.getElementById('cart-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('close-cart').addEventListener('click', ()=>{
  document.getElementById('cart-panel').style.display = 'none';
});

document.getElementById('checkout-btn').addEventListener('click', ()=>{
  if(Object.keys(cart).length===0){
    alert('Cart is empty. Add some items first.');
    return;
  }
  const name = document.getElementById('cust-name').value.trim();
  const note = document.getElementById('cust-note').value.trim();

  let msg = '*New order from HeyZuZuBee*%0A';
  if(name) msg += `*Name:* ${escapeText(name)}%0A`;
  if(note) msg += `*Details:* ${escapeText(note)}%0A`;
  msg += '%0A*Items:*%0A';
  Object.values(cart).forEach(it=>{
    msg += `- ${escapeText(it.name)} x ${it.qty} — ₹${(it.price*it.qty).toFixed(2)}%0A`;
  });
  msg += '%0A*Total:* ₹' + Object.values(cart).reduce((s,i)=>s+i.qty*i.price,0).toFixed(2) + '%0A';
  msg += '%0A' + '%0A' + 'Please reply with payment & delivery details.';

  const wa_link = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(wa_link, '_blank');
});

// escape common characters to keep message neat
function escapeText(t){
  return encodeURIComponent(t).replace(/%20/g, '+');
}

loadProducts();
