/* Simple Store: products, search, filters, cart and WhatsApp ordering.
   Layout, classes and ids match index.html and style.css exactly. */

// ====== SETTINGS: change these ======
const WHATSAPP_NUMBER = "919999999999";   // country code + number, digits only
const STORE_EMAIL = "hello@example.com";
const CURRENCY = "₹";

// ====== PRODUCTS (images go in the images/ folder) ======
const products = [
  // Fashion
  { id: 1,  name: "Tommy Hilfiger Backpack",       category: "Fashion",     price: 1999, emoji: "🎒", images: ["images/backpack.jpg"] },
  { id: 2,  name: "Printed Oversized T-Shirt",     category: "Fashion",     price: 699,  emoji: "👕", images: ["images/classic-tshirt.jpg"] },
  { id: 3,  name: "Bruton Running Shoes",          category: "Fashion",     price: 799,  emoji: "👟", images: ["images/running-shoes.jpg"] },

  // Electronics
  { id: 4,  name: "boAt Bluetooth Speaker",        category: "Electronics", price: 2499, emoji: "🔊", images: ["images/bluetooth-speaker.jpg"] },
  { id: 5,  name: "boAt Wired Earphones",          category: "Electronics", price: 399,  emoji: "🎧", images: ["images/headphones.jpg"] },
  { id: 6,  name: "Melbon Smartwatch",             category: "Electronics", price: 1499, emoji: "⌚", images: ["images/smart-watch.jpg"] },

  // Home
  { id: 7,  name: "Planter with Metal Stand",      category: "Home",        price: 599,  emoji: "🪴", images: ["images/ceramic-vase.jpg"] },
  { id: 8,  name: "Insulated Tumbler with Straw",  category: "Home",        price: 699,  emoji: "🥤", images: ["images/Insulated Tumbler.jpg"] },
  { id: 9,  name: "Floral Embroidered Cushion",    category: "Home",        price: 449,  emoji: "🛋️", images: ["images/cushion-cover.jpg"] },
  { id: 10, name: "Wooden Floor Lamp",             category: "Home",        price: 2299, emoji: "💡", images: ["images/desk-lamp.jpg"] },
  { id: 11, name: "Storage Baskets (Set of 3)",    category: "Home",        price: 499,  emoji: "🧺", images: ["images/storage-baskets.jpg"] }
];

// ====== ELEMENTS ======
const $ = (id) => document.getElementById(id);
const grid = $("productGrid");
const searchInput = $("searchInput");
const filterButtons = document.querySelectorAll(".filter");
const cartButton = $("cartButton");
const cartCount = $("cartCount");
const cartPanel = $("cartPanel");
const overlay = $("overlay");
const cartItemsEl = $("cartItems");
const cartTotalEl = $("cartTotal");
const checkoutModal = $("checkoutModal");

let activeCategory = "All";
let cart = [];
try { cart = JSON.parse(localStorage.getItem("simpleStoreCart")) || []; } catch (e) { cart = []; }

// ====== HELPERS ======
const money = (n) => CURRENCY + Number(n).toFixed(2);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const findProduct = (id) => products.find((p) => p.id === id);
const saveCart = () => { try { localStorage.setItem("simpleStoreCart", JSON.stringify(cart)); } catch (e) {} };

// ====== PRODUCT IMAGES ======
function productImageHTML(product) {
  const imgs = product.images || [];
  if (!imgs.length) return `<div class="no-product-image">No image</div>`;
  const thumbs = imgs.length > 1
    ? `<div class="product-thumbnails">${imgs.map((src, i) => `
        <button class="product-thumbnail ${i === 0 ? "active" : ""}" type="button" data-src="${esc(src)}" aria-label="Show image ${i + 1} of ${esc(product.name)}">
          <img src="${esc(src)}" alt="">
        </button>`).join("")}</div>`
    : "";
  return `
    <div class="product-fallback" aria-hidden="true">${product.emoji || "🛍️"}</div>
    <img class="product-photo" src="${esc(imgs[0])}" alt="${esc(product.name)}" loading="lazy" onerror="this.remove()">
    ${thumbs}`;
}

// ====== RENDER PRODUCTS ======
function renderProducts() {
  const q = searchInput.value.trim().toLowerCase();
  const list = products.filter((p) =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  if (!list.length) {
    grid.innerHTML = `<p class="no-results">No products found. Try another search or category.</p>`;
    return;
  }
  grid.innerHTML = list.map((p) => `
    <article class="product">
      <div class="product-image">${productImageHTML(p)}</div>
      <div class="product-info">
        <p class="product-category">${esc(p.category)}</p>
        <h3>${esc(p.name)}</h3>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add" type="button" data-add="${p.id}">Add</button>
        </div>
      </div>
    </article>`).join("");
}

grid.addEventListener("click", (e) => {
  const thumb = e.target.closest(".product-thumbnail");
  if (thumb) {
    const box = thumb.closest(".product-image");
    const photo = box.querySelector(".product-photo");
    if (photo) photo.src = thumb.dataset.src;
    box.querySelectorAll(".product-thumbnail").forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
    return;
  }
  const add = e.target.closest("[data-add]");
  if (add) addToCart(Number(add.dataset.add));
});

searchInput.addEventListener("input", renderProducts);
filterButtons.forEach((btn) => btn.addEventListener("click", () => {
  filterButtons.forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.category;
  renderProducts();
}));

// ====== CART ======
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1; else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + (findProduct(i.id)?.price || 0) * i.qty, 0);
}

function renderCart() {
  cart = cart.filter((i) => findProduct(i.id));
  cartCount.textContent = cart.reduce((n, i) => n + i.qty, 0);
  cartTotalEl.textContent = money(cartTotal());

  if (!cart.length) {
    cartItemsEl.innerHTML = `<p class="empty">Your cart is empty.</p>`;
    return;
  }
  cartItemsEl.innerHTML = cart.map((i) => {
    const p = findProduct(i.id);
    const img = p.images && p.images[0]
      ? `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" onerror="this.replaceWith(document.createTextNode('${p.emoji || "🛍️"}'))">`
      : `<span class="no-product-image">No image</span>`;
    return `
      <div class="cart-item">
        <div class="cart-item-image">${img}</div>
        <div class="cart-product-details">
          <strong>${esc(p.name)}</strong>
          <div>${money(p.price)}</div>
          <div class="qty">
            <button type="button" data-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span>${i.qty}</span>
            <button type="button" data-inc="${p.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <strong>${money(p.price * i.qty)}</strong><br>
          <button class="remove" type="button" data-remove="${p.id}">Remove</button>
        </div>
      </div>`;
  }).join("");
}

cartItemsEl.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
  else if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
  else if (t.dataset.remove) removeItem(Number(t.dataset.remove));
});

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
}
cartButton.addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// ====== CHECKOUT (WhatsApp) ======
function openModal() { checkoutModal.classList.add("show"); }
function closeModal() { checkoutModal.classList.remove("show"); }

$("checkoutButton").addEventListener("click", () => {
  if (!cart.length) { alert("Your cart is empty. Add a product first."); return; }
  closeCart();
  openModal();
});
$("closeModal").addEventListener("click", closeModal);
checkoutModal.addEventListener("click", (e) => { if (e.target === checkoutModal) closeModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); closeCart(); }
});

$("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lines = cart.map((i) => {
    const p = findProduct(i.id);
    return `• ${p.name} x ${i.qty} = ${money(p.price * i.qty)}`;
  });
  const note = (f.get("note") || "").toString().trim();
  const message =
    `Hello Simple Store, I would like to place an order:\n\n` +
    `${lines.join("\n")}\n\n` +
    `Total: ${money(cartTotal())}\n\n` +
    `Name: ${f.get("name")}\n` +
    `Phone: ${f.get("phone")}\n` +
    `Address: ${f.get("address")}` +
    (note ? `\nNote: ${note}` : "");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  closeModal();
});

// ====== CONTACT LINKS, YEAR ======
const waLink = $("contactWhatsApp");
waLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
$("contactWhatsAppText").textContent = "+" + WHATSAPP_NUMBER;
$("contactEmail").href = "mailto:" + STORE_EMAIL;
$("contactEmail").querySelector("span").textContent = STORE_EMAIL;
$("footerEmail").href = "mailto:" + STORE_EMAIL;
$("footerEmail").textContent = STORE_EMAIL;
$("year").textContent = new Date().getFullYear();

// ====== START ======
renderProducts();
renderCart();
