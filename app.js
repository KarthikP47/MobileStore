const PRODUCTS = [
  { id: "nova-x", name: "Nova X Pro", price: 1299, category: "flagship", stock: 5, tone: "" },
  { id: "orbit-mini", name: "Orbit Mini 5G", price: 699, category: "budget", stock: 12, tone: "orange" },
  { id: "zen-ultra", name: "Zen 12 Ultra", price: 1099, category: "flagship", stock: 3, tone: "blue" },
  { id: "pulse-lite", name: "Pulse Lite", price: 449, category: "budget", stock: 8, tone: "dark" },
  { id: "echo-air", name: "Echo Air Max", price: 249, category: "audio", stock: 9, tone: "orange" },
  { id: "audio-arc", name: "Audio Arc Pro", price: 179, category: "audio", stock: 2, tone: "blue" },
];
const state = {
  cart: JSON.parse(localStorage.getItem("mobileStoreCart") || "[]"),
  stock: JSON.parse(localStorage.getItem("mobileStoreStock") || "null") || Object.fromEntries(PRODUCTS.map(p => [p.id, p.stock])),
};
const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
function save() { localStorage.setItem("mobileStoreCart", JSON.stringify(state.cart)); localStorage.setItem("mobileStoreStock", JSON.stringify(state.stock)); updateBadge(); }
function updateBadge() { document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0)); }
function addToCart(id) {
  if (!state.stock[id]) return alert("This product is out of stock.");
  const existing = state.cart.find(item => item.id === id);
  if (existing) existing.quantity += 1; else state.cart.push({ id, quantity: 1 });
  state.stock[id] -= 1; save(); renderProducts(); renderCart();
}
function changeQuantity(id, delta) {
  const item = state.cart.find(i => i.id === id); if (!item) return;
  if (delta > 0 && !state.stock[id]) return alert("No more stock available.");
  item.quantity += delta; state.stock[id] -= delta;
  if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
  save(); renderCart(); renderProducts();
}
function productCard(product) {
  const available = state.stock[product.id];
  return `<article class="product-card"><div class="product-image ${product.tone}"><span class="stock ${available <= 3 ? "low" : ""}">${available ? `${available} in stock` : "Sold out"}</span></div><div class="product-info"><h3>${product.name}</h3><div class="price-row"><span class="muted">${product.category}</span><span class="price">${money(product.price)}</span></div><button class="add" data-add="${product.id}" ${available ? "" : "disabled"}>${available ? "Add to cart" : "Sold out"}</button></div></article>`;
}
function renderProducts(filter = "all") {
  const grid = document.querySelector("[data-products]"); if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p => filter === "all" || p.category === filter).map(productCard).join("");
  grid.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add)));
  updateBadge();
}
function renderCart() {
  const list = document.querySelector("[data-cart-list]"); if (!list) return;
  if (!state.cart.length) { list.innerHTML = `<div class="empty"><h3>Your cart is empty</h3><p>Add a device from the shop to get started.</p><a class="primary" href="shop.html">Browse products</a></div>`; return; }
  list.innerHTML = state.cart.map(item => { const p = PRODUCTS.find(x => x.id === item.id); return `<div class="cart-item"><div class="mini-image"></div><div><strong>${p.name}</strong><div class="muted">${money(p.price)} each</div><div class="quantity"><button data-minus="${p.id}">−</button><span>${item.quantity}</span><button data-plus="${p.id}">+</button><button class="remove" data-remove="${p.id}">Remove</button></div></div><strong>${money(p.price * item.quantity)}</strong></div>`; }).join("");
  list.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => changeQuantity(b.dataset.minus, -1));
  list.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQuantity(b.dataset.plus, 1));
  list.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { const item = state.cart.find(i => i.id === b.dataset.remove); state.stock[b.dataset.remove] += item.quantity; state.cart = state.cart.filter(i => i.id !== b.dataset.remove); save(); renderCart(); renderProducts(); });
  const subtotal = state.cart.reduce((sum, item) => sum + PRODUCTS.find(p => p.id === item.id).price * item.quantity, 0);
  document.querySelectorAll("[data-subtotal]").forEach(el => el.textContent = money(subtotal));
  document.querySelectorAll("[data-total]").forEach(el => el.textContent = money(subtotal + (subtotal ? 0 : 0)));
  updateBadge();
}
function renderTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + PRODUCTS.find(p => p.id === item.id).price * item.quantity, 0);
  document.querySelectorAll("[data-subtotal]").forEach(el => el.textContent = money(subtotal));
  document.querySelectorAll("[data-total]").forEach(el => el.textContent = money(subtotal));
}
function checkout() {
  const form = document.querySelector("[data-payment-form]"); if (!form) return;
  form.addEventListener("submit", event => { event.preventDefault(); if (!state.cart.length) return alert("Your cart is empty."); localStorage.setItem("mobileStoreOrder", JSON.stringify({ total: document.querySelector("[data-total]").textContent, number: `MS-${Date.now().toString().slice(-6)}` })); state.cart = []; save(); location.href = "success.html"; });
}
document.addEventListener("DOMContentLoaded", () => {
  updateBadge(); renderProducts(); renderCart(); renderTotals(); checkout();
  document.querySelectorAll("[data-filter]").forEach(button => button.onclick = () => { document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active")); button.classList.add("active"); renderProducts(button.dataset.filter); });
});
