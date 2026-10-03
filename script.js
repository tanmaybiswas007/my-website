
const products = [
  { id: 1, name: "Classic T-Shirt", category: "Fashion", price: 24.99, icon: "👕" },
  { id: 2, name: "Running Shoes", category: "Fashion", price: 59.99, icon: "👟" },
  { id: 3, name: "Wireless Headphones", category: "Electronics", price: 79.99, icon: "🎧" },
  { id: 4, name: "Smart Watch", category: "Electronics", price: 99.99, icon: "⌚" },
  { id: 5, name: "Coffee Mug", category: "Home", price: 14.99, icon: "☕" },
  { id: 6, name: "Desk Lamp", category: "Home", price: 34.99, icon: "💡" },
  { id: 7, name: "Backpack", category: "Fashion", price: 44.99, icon: "🎒" },
  { id: 8, name: "Bluetooth Speaker", category: "Electronics", price: 49.99, icon: "🔊" }
];

let cart = JSON.parse(localStorage.getItem("simpleStoreCart")) || [];
let selectedCategory = "All";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutModal = document.getElementById("checkoutModal");

function renderProducts() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = products.filter(product => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });

  productGrid.innerHTML = filtered.length
    ? filtered.map(product => `
      <article class="product">
        <div class="product-image">${product.icon}</div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          <div class="product-bottom">
            <span class="price">$${product.price.toFixed(2)}</span>
            <button class="add" onclick="addToCart(${product.id})">Add to cart</button>
          </div>
        </div>
      </article>
    `).join("")
    : `<p>No products found.</p>`;
}

function saveCart() {
  localStorage.setItem("simpleStoreCart", JSON.stringify(cart));
}

function addToCart(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty">Your cart is empty.<br>Add something you like!</div>`;
    cartTotal.textContent = "$0.00";
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-image">${product.icon}</div>
        <div>
          <strong>${product.name}</strong>
          <div>$${product.price.toFixed(2)}</div>
          <div class="qty">
            <button onclick="changeQuantity(${product.id}, -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>
          <button class="remove" onclick="removeFromCart(${product.id})">Remove</button>
        </div>
        <strong>$${itemTotal.toFixed(2)}</strong>
      </div>
    `;
  }).join("");

  cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    renderProducts();
  });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  checkoutModal.classList.add("show");
});

document.getElementById("closeModal").addEventListener("click", () => {
  checkoutModal.classList.remove("show");
});

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) checkoutModal.classList.remove("show");
});

document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  alert("Thank you! Your demo order has been placed.");
  cart = [];
  saveCart();
  renderCart();
  checkoutModal.classList.remove("show");
  closeCart();
  event.target.reset();
});

renderProducts();
renderCart();
