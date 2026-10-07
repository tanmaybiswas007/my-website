/* STORE SETTINGS
   Update these values for your shop. WhatsApp needs the country code plus
   number, using digits only (no + sign, spaces, or dashes). */
const STORE = {
  name: "SimpleStore",
  email: "hello@example.com",
  whatsapp: "919432440130",
  currency: "INR",
  locale: "en-US"
};

/* PRODUCT CATALOG
   Add or edit products here. To show product photos, put the image files in
   your site's images/products/ folder and replace the empty strings with
   paths such as "images/products/t-shirt-front.jpg". Add at least three
   paths to each product's images array; the first photo is the main image
   and the remaining photos appear as selectable thumbnails. Keep icon as a
   fallback for products whose image paths are still empty or unavailable. */
const products = [
  { id: 1, name: "Classic T-Shirt", category: "Fashion", price: 24.99, icon: "👕", images: ["", "", ""] },
  { id: 2, name: "Running Shoes", category: "Fashion", price: 59.99, icon: "👟", images: ["", "", ""] },
  { id: 3, name: "Wireless Headphones", category: "Electronics", price: 79.99, icon: "🎧", images: ["", "", ""] },
  { id: 4, name: "Smart Watch", category: "Electronics", price: 99.99, icon: "⌚", images: ["", "", ""] },
  { id: 5, name: "Coffee Mug", category: "Home", price: 14.99, icon: "☕", images: ["", "", ""] },
  { id: 6, name: "Desk Lamp", category: "Home", price: 34.99, icon: "💡", images: ["", "", ""] },
  { id: 7, name: "Backpack", category: "Fashion", price: 44.99, icon: "🎒", images: ["", "", ""] },
  { id: 8, name: "Bluetooth Speaker", category: "Electronics", price: 49.99, icon: "🔊", images: ["", "", ""] },
   { id: 9, name: "Ceramic Vase", category: "Home", price: 699, icon: "🏺", images: ["", "", ""] },
  { id: 10, name: "Cushion Cover", category: "Home", price: 399, icon: "🛋️", images: ["/images/wagh bakri.jpg", "", ""] },
  { id: 11, name: "Storage Basket", category: "Home", price: 899, icon: "🧺", images: ["/images/lipton_tea.jpg", "/images/red label.jpg", "my-website/images/tata gold.jpg"] }];

// This key names the cart saved in the visitor's browser between page visits.
const CART_KEY = "simpleStoreCart";
let cart = loadCart();
let selectedCategory = "All";

// Cache the page elements once so the functions below can update them.
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutModal = document.getElementById("checkoutModal");

// Format every displayed price with the store's selected currency and locale.
const money = new Intl.NumberFormat(STORE.locale, { style: "currency", currency: STORE.currency });

// Restore a valid cart from local storage; ignore damaged or outdated data.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

// Escape catalog text before inserting it into HTML, so special characters
// in product names or photo paths do not become markup.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

// Build the product cards from the catalog and apply the current search/filter.
function renderProducts() {
  const search = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(product => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    return categoryMatch && `${product.name} ${product.category}`.toLowerCase().includes(search);
  });

  productGrid.innerHTML = filtered.length ? filtered.map(product => {
    const photos = (product.images || []).filter(path => typeof path === "string" && path.trim());
    const mainPhoto = photos[0];
    const gallery = mainPhoto
      ? `<img class="product-photo" src="${escapeHTML(mainPhoto)}" alt="${escapeHTML(product.name)}" loading="lazy">
         <span class="product-fallback" aria-hidden="true">${escapeHTML(product.icon)}</span>
         ${photos.length > 1 ? `<div class="product-thumbnails" aria-label="More photos of ${escapeHTML(product.name)}">${photos.map((path, index) => `
           <button class="product-thumbnail${index === 0 ? " active" : ""}" type="button" data-photo="${escapeHTML(path)}" data-product="${product.id}" aria-label="Show photo ${index + 1} of ${escapeHTML(product.name)}" aria-pressed="${index === 0}">
             <img src="${escapeHTML(path)}" alt="" loading="lazy">
           </button>`).join("")}</div>` : ""}`
      : `<span class="product-fallback" aria-hidden="true">${escapeHTML(product.icon)}</span>`;

    return `
    <article class="product" data-product-card="${product.id}">
      <div class="product-image">${gallery}</div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <div class="product-bottom">
          <span class="price">${money.format(product.price)}</span>
          <button class="add" type="button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">Add to cart</button>
        </div>
      </div>
    </article>`;
  }).join("") : `<p class="no-results">No products found. Try another search.</p>`;
}

// Store cart changes locally so a refresh does not immediately empty it.
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* Cart still works until the page is closed. */ }
}

// Add one unit, save the change, redraw the cart, and open it for feedback.
function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity++;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  openCart();
}

// Increase/decrease a cart line; removing the last unit deletes that line.
function changeQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart();
  renderCart();
}

// Remove a cart line completely.
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

// Refresh the cart count, item rows, and calculated total.
function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.setAttribute("aria-label", `${totalItems} items in cart`);

  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty">Your cart is empty.<br>Add something you like!</div>`;
    cartTotal.textContent = money.format(0);
    return;
  }

  const total = cart.reduce((sum, item) => {
    const product = products.find(entry => entry.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `
      <div class="cart-item">
        <div class="cart-item-image" aria-hidden="true">${product.icon}</div>
        <div class="cart-product-details">
          <strong>${product.name}</strong>
          <div>${money.format(product.price)} each</div>
          <div class="qty" aria-label="Quantity for ${product.name}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button>
          </div>
          <button class="remove" type="button" data-remove="${product.id}">Remove</button>
        </div>
        <strong>${money.format(product.price * item.quantity)}</strong>
      </div>`;
  }).join("");
  cartTotal.textContent = money.format(total);
}

// Show the slide-out cart and dim the page behind it.
function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.getElementById("closeCart").focus();
}

// Hide the slide-out cart and its background overlay.
function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.classList.remove("show");
}

// Open the customer-details form only when there is something to order.
function openCheckout() {
  if (!cart.length) {
    alert("Your cart is empty. Add a product before ordering.");
    return;
  }
  checkoutModal.classList.add("show");
  checkoutModal.querySelector("input").focus();
}

// Hide the customer-details form.
function closeCheckout() {
  checkoutModal.classList.remove("show");
}

// Create the readable order text that WhatsApp will open for the customer.
function orderMessage(details) {
  const lines = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `• ${product.name} × ${item.quantity} — ${money.format(product.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0);
  return [
    `Hello ${STORE.name}, I'd like to place an order:`,
    "",
    ...lines,
    "",
    `Total: ${money.format(total)}`,
    "",
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Delivery address: ${details.address}`,
    details.note ? `Note: ${details.note}` : "",
    "",
    "Please confirm availability, delivery charges, and payment details."
  ].filter(Boolean).join("\n");
}

// Fill store contact links and the current copyright year from STORE settings.
function configureContactDetails() {
  const emailHref = `mailto:${STORE.email}`;
  const whatsappHref = `https://wa.me/${STORE.whatsapp}`;
  const emailLink = document.getElementById("contactEmail");
  const footerEmail = document.getElementById("footerEmail");
  const whatsappLink = document.getElementById("contactWhatsApp");

  emailLink.href = emailHref;
  emailLink.querySelector("span").textContent = STORE.email;
  footerEmail.href = emailHref;
  footerEmail.textContent = STORE.email;
  whatsappLink.href = whatsappHref;
  document.getElementById("contactWhatsAppText").textContent = `WhatsApp us: +${STORE.whatsapp}`;
  document.getElementById("year").textContent = new Date().getFullYear();
}

// Connect buttons and forms to the functions above using event listeners.
document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));

  // Clicking a thumbnail swaps the main product photo without re-rendering.
  const thumbnail = event.target.closest("[data-photo]");
  if (thumbnail) {
    const card = thumbnail.closest("[data-product-card]");
    card.querySelectorAll(".product-thumbnail").forEach(item => {
      item.classList.toggle("active", item === thumbnail);
      item.setAttribute("aria-pressed", String(item === thumbnail));
    });
    card.querySelector(".product-photo").src = thumbnail.dataset.photo;
  }
});

// If a configured image file cannot load, reveal the product icon fallback.
// Hide unavailable thumbnail buttons so visitors can only select working photos.
productGrid.addEventListener("error", event => {
  if (event.target.matches(".product-photo")) event.target.hidden = true;
  const thumbnail = event.target.closest(".product-thumbnail");
  if (thumbnail) thumbnail.hidden = true;
}, true);

cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(filter => filter.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    renderProducts();
  });
});

document.getElementById("checkoutButton").addEventListener("click", openCheckout);
document.getElementById("closeModal").addEventListener("click", closeCheckout);
checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) closeCheckout();
});

document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) return;
  // Read the validated form and encode the order so it can be sent as a URL.
  const details = Object.fromEntries(new FormData(event.currentTarget).entries());
  const whatsappUrl = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(orderMessage(details))}`;
  // WhatsApp opens in a new tab/app; the customer reviews and sends the message.
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  closeCheckout();
  closeCart();
});

// Escape closes whichever cart or checkout overlay is open.
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCheckout();
    closeCart();
  }
});

// Initial page setup: populate contact details, products, and saved cart.
configureContactDetails();
renderProducts();
renderCart();
