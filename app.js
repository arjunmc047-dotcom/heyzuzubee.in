const WHATSAPP_NUMBER="919061637881";
let products=[];
let cart={};
async function loadProducts(){
const res=await fetch('products.json');
products=await res.json();
renderProducts();
}
function renderProducts(){
const container=document.getElementById('products');
container.innerHTML='';
products.forEach(p=>{
const el=document.createElement('article');
el.className='card';
el.innerHTML=`
<img src="${p.image}" alt="${p.name}" loading="lazy"/>
<h3>${p.name}</h3>
<p>${p.description}</p>
<div class="row">
<div>₹${p.price.toFixed(2)}</div>
<div class="qty">
<button class="btn add-btn" data-id="${p.id}">Add</button>
<span class="item-qty" id="qty-${p.id}">0</span>
</div>
</div>`;
container.appendChild(el);
});
document.querySelectorAll('.add-btn').forEach(btn=>{btn.addEventListener('click',e=>{
addToCart(e.currentTarget.dataset.id);
})});
}
function addToCart(id){
const product=products.find(x=>x.id===id);
if(!product) return;
cart[id]=cart[id]||{...product,qty:0};
cart[id].qty+=1;
updateCartUI();
const qtySpan=document.getElementById(`qty-${id}`);
if(qtySpan) qtySpan.textContent=cart[id].qty;
}
function updateCartUI(){
const count=Object.values(cart).reduce((s,i)=>s+i.qty,0);
document.getElementById('cart-count').textContent=count;
document.getElementById('cart-total').textContent=Object.values(cart).reduce((s,i)=>s+i.qty*i.price,0).toFixed(2);
const itemsDiv=document.getElementById('cart-items');
itemsDiv.innerHTML='';
Object.values(cart).forEach(item=>{
const node=document.createElement('div');
node.className='cart-item';
node.innerHTML=`
<div style="flex:1"><strong>${item.name}</strong><br/><small>₹${item.price.toFixed(2)} × ${item.qty}</small></div>
<div style="text-align:right">
<div>₹${(item.price*item.qty).toFixed(2)}</div>
<div style="margin-top:6px">
<button class="btn" data-op="minus" data-id="${item.id}">-</button>
loadProducts();
