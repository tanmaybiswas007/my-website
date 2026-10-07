/* =========================================================
   STORE SETTINGS
========================================================= */

const STORE = {

    name: "SimpleStore",

    email: "hello@example.com",

    /*
       Country code + phone number.
       No +, spaces or dashes.
    */
    whatsapp: "919432440130",

    currency: "INR",

    locale: "en-IN"

};


/* =========================================================
   PRODUCT CATALOG
========================================================= */

const products = [

    {
        id: 1,
        name: "Classic T-Shirt",
        category: "Fashion",
        price: 2499,
        images: [
            "images/classic-tshirt.jpg"
        ]
    },

    {
        id: 2,
        name: "Running Shoes",
        category: "Fashion",
        price: 5999,
        images: [
            "images/running-shoes.jpg"
        ]
    },

    {
        id: 3,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 7999,
        images: [
            "images/headphones.jpg"
        ]
    },

    {
        id: 4,
        name: "Smart Watch",
        category: "Electronics",
        price: 9999,
        images: [
            "images/smart-watch.jpg"
        ]
    },

    {
        id: 5,
        name: "Coffee Mug",
        category: "Home",
        price: 499,
        images: [
            "images/coffee-mug.jpg"
        ]
    },

    {
        id: 6,
        name: "Desk Lamp",
        category: "Home",
        price: 1499,
        images: [
            "images/desk-lamp.jpg"
        ]
    },

    {
        id: 7,
        name: "Backpack",
        category: "Fashion",
        price: 2999,
        images: [
            "images/backpack.jpg"
        ]
    },

    {
        id: 8,
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 3999,
        images: [
            "images/bluetooth-speaker.jpg"
        ]
    },

    {
        id: 9,
        name: "Ceramic Vase",
        category: "Home",
        price: 699,
        images: [
            "images/ceramic-vase.jpg"
        ]
    },

    {
        id: 10,
        name: "Cushion Cover",
        category: "Home",
        price: 399,
        images: [
            "images/cushion-cover.jpg"
        ]
    },

    {
        id: 11,
        name: "Storage Basket",
        category: "Home",
        price: 899,
        images: [
            "images/storage-basket.jpg",
              ]
    }

];


/* =========================================================
   CART
========================================================= */

const CART_KEY = "simpleStoreCart";

let cart = loadCart();

let selectedCategory = "All";


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const productGrid =
    document.getElementById("productGrid");

const searchInput =
    document.getElementById("searchInput");

const cartPanel =
    document.getElementById("cartPanel");

const overlay =
    document.getElementById("overlay");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutModal =
    document.getElementById("checkoutModal");


/* =========================================================
   MONEY FORMAT
========================================================= */

const money = new Intl.NumberFormat(
    STORE.locale,
    {
        style: "currency",
        currency: STORE.currency
    }
);


/* =========================================================
   LOAD CART
========================================================= */

function loadCart() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter(item =>

            products.some(
                product => product.id === item.id
            )

            &&

            Number.isInteger(item.quantity)

            &&

            item.quantity > 0

        );

    } catch {

        return [];

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    try {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    } catch {

        // Cart will still work during this page visit.

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"

        })[character]
    );

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(product => {

            const categoryMatch =
                selectedCategory === "All"
                ||
                product.category === selectedCategory;


            return categoryMatch
                &&
                `${product.name} ${product.category}`
                    .toLowerCase()
                    .includes(search);

        });


    productGrid.innerHTML =
        filtered.length

        ?

        filtered.map(product => {

            const photos =
                (product.images || [])
                    .filter(
                        path =>
                            typeof path === "string"
                            &&
                            path.trim()
                    );


            const mainPhoto =
                photos[0];


            let gallery;


            if (mainPhoto) {

                gallery = `

                    <img
                        class="product-photo"
                        src="${escapeHTML(mainPhoto)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >

                    ${
                        photos.length > 1

                        ?

                        `
                        <div
                            class="product-thumbnails"
                            aria-label="More photos"
                        >

                            ${photos.map(
                                (path, index) => `

                                <button
                                    class="product-thumbnail ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }"
                                    type="button"
                                    data-photo="${escapeHTML(path)}"
                                    data-product="${product.id}"
                                    aria-label="Show photo ${
                                        index + 1
                                    }"
                                    aria-pressed="${
                                        index === 0
                                    }"
                                >

                                    <img
                                        src="${escapeHTML(path)}"
                                        alt=""
                                        loading="lazy"
                                    >

                                </button>

                            `
                            ).join("")}

                        </div>
                        `

                        :

                        ""

                    }

                `;

            } else {

                gallery = `

                    <div class="no-product-image">
                        Image not available
                    </div>

                `;

            }


            return `

                <article
                    class="product"
                    data-product-card="${product.id}"
                >

                    <div class="product-image">

                        ${gallery}

                    </div>


                    <div class="product-info">

                        <span class="product-category">
                            ${escapeHTML(product.category)}
                        </span>


                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>


                        <div class="product-bottom">

                            <span class="price">
                                ${money.format(product.price)}
                            </span>


                            <button
                                class="add"
                                type="button"
                                data-add="${product.id}"
                            >
                                Add to cart
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("")

        :

        `

            <p class="no-results">
                No products found.
                Try another search.
            </p>

        `;

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(id) {

    const item =
        cart.find(
            entry => entry.id === id
        );


    if (item) {

        item.quantity++;

    } else {

        cart.push({
            id: id,
            quantity: 1
        });

    }


    saveCart();

    renderCart();

    openCart();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(id, amount) {

    const item =
        cart.find(
            entry => entry.id === id
        );


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                entry => entry.id !== id
            );

    }


    saveCart();

    renderCart();

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    saveCart();

    renderCart();

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        totalItems;


    cartCount.setAttribute(
        "aria-label",
        `${totalItems} items in cart`
    );


    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="empty">

                Your cart is empty.

                <br>

                Add something you like!

            </div>

        `;


        cartTotal.textContent =
            money.format(0);

        return;

    }


    const total =
        cart.reduce(
            (sum, item) => {

                const product =
                    products.find(
                        entry =>
                            entry.id === item.id
                    );


                return (
                    sum +
                    product.price *
                    item.quantity
                );

            },
            0
        );


    cartItems.innerHTML =
        cart.map(item => {

            const product =
                products.find(
                    entry =>
                        entry.id === item.id
                );


            const image =
                product.images &&
                product.images.length
                    ? product.images[0]
                    : "";


            return `

                <div class="cart-item">

                    <div class="cart-item-image">

                        ${
                            image

                            ?

                            `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(product.name)}"
                            >
                            `

                            :

                            `
                            <div class="no-product-image">
                                No image
                            </div>
                            `
                        }

                    </div>


                    <div class="cart-product-details">

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>


                        <div>
                            ${money.format(product.price)}
                            each
                        </div>


                        <div
                            class="qty"
                            aria-label="Quantity"
                        >

                            <button
                                type="button"
                                data-quantity="${product.id}"
                                data-change="-1"
                            >
                                −
                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                data-quantity="${product.id}"
                                data-change="1"
                            >
                                +
                            </button>

                        </div>


                        <button
                            class="remove"
                            type="button"
                            data-remove="${product.id}"
                        >
                            Remove
                        </button>

                    </div>


                    <strong>

                        ${money.format(
                            product.price *
                            item.quantity
                        )}

                    </strong>

                </div>

            `;

        }).join("");


    cartTotal.textContent =
        money.format(total);

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    cartPanel.classList.add("open");

    cartPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    overlay.classList.add("show");

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

    cartPanel.classList.remove("open");

    cartPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    overlay.classList.remove("show");

}


/* =========================================================
   OPEN CHECKOUT
========================================================= */

function openCheckout() {

    if (!cart.length) {

        alert(
            "Your cart is empty. Add a product before ordering."
        );

        return;

    }


    checkoutModal.classList.add("show");


    checkoutModal
        .querySelector("input")
        .focus();

}


/* =========================================================
   CLOSE CHECKOUT
========================================================= */

function closeCheckout() {

    checkoutModal.classList.remove("show");

}


/* =========================================================
   ORDER MESSAGE
========================================================= */

function orderMessage(details) {

    const lines =
        cart.map(item => {

            const product =
                products.find(
                    entry =>
                        entry.id === item.id
                );


            return `• ${product.name} × ${item.quantity} — ${money.format(
                product.price * item.quantity
            )}`;

        });


    const total =
        cart.reduce(
            (sum, item) => {

                const product =
                    products.find(
                        entry =>
                            entry.id === item.id
                    );


                return (
                    sum +
                    product.price *
                    item.quantity
                );

            },
            0
        );


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

        details.note
            ? `Note: ${details.note}`
            : "",

        "",

        "Please confirm availability, delivery charges, and payment details."

    ]

    .filter(Boolean)

    .join("\n");

}


/* =========================================================
   CONTACT DETAILS
========================================================= */

function configureContactDetails() {

    const emailHref =
        `mailto:${STORE.email}`;


    const whatsappHref =
        `https://wa.me/${STORE.whatsapp}`;


    const emailLink =
        document.getElementById(
            "contactEmail"
        );


    const whatsappLink =
        document.getElementById(
            "contactWhatsApp"
        );


    emailLink.href =
        emailHref;


    emailLink.querySelector("span")
        .textContent =
        STORE.email;


    whatsappLink.href =
        whatsappHref;


    document.getElementById(
        "contactWhatsAppText"
    ).textContent =
        `WhatsApp us: +${STORE.whatsapp}`;


    document.getElementById(
        "year"
    ).textContent =
        new Date().getFullYear();

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById("closeCart")
    .addEventListener(
        "click",
        closeCart
    );


overlay.addEventListener(
    "click",
    closeCart
);


searchInput.addEventListener(
    "input",
    renderProducts
);


/* =========================================================
   PRODUCT GRID EVENTS
========================================================= */

productGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-add]"
            );


        if (button) {

            addToCart(
                Number(button.dataset.add)
            );

            return;

        }


        const thumbnail =
            event.target.closest(
                "[data-photo]"
            );


        if (thumbnail) {

            const card =
                thumbnail.closest(
                    "[data-product-card]"
                );


            card
                .querySelectorAll(
                    ".product-thumbnail"
                )
                .forEach(item => {

                    const active =
                        item === thumbnail;


                    item.classList.toggle(
                        "active",
                        active
                    );


                    item.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                });


            const mainPhoto =
                card.querySelector(
                    ".product-photo"
                );


            if (mainPhoto) {

                mainPhoto.src =
                    thumbnail.dataset.photo;

            }

        }

    }
);


/* =========================================================
   IMAGE ERROR HANDLING
========================================================= */

productGrid.addEventListener(
    "error",
    event => {

        if (
            event.target.matches(
                ".product-photo"
            )
        ) {

            event.target.replaceWith(
                createMissingImageMessage()
            );

        }


        const thumbnail =
            event.target.closest(
                ".product-thumbnail"
            );


        if (thumbnail) {

            thumbnail.hidden =
                true;

        }

    },
    true
);


function createMissingImageMessage() {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "no-product-image";


    message.textContent =
        "Image not available";


    return message;

}


/* =========================================================
   CART BUTTON EVENTS
========================================================= */

cartItems.addEventListener(
    "click",
    event => {

        const quantityButton =
            event.target.closest(
                "[data-quantity]"
            );


        const removeButton =
            event.target.closest(
                "[data-remove]"
            );


        if (quantityButton) {

            changeQuantity(

                Number(
                    quantityButton.dataset.quantity
                ),

                Number(
                    quantityButton.dataset.change
                )

            );

        }


        if (removeButton) {

            removeFromCart(
                Number(
                    removeButton.dataset.remove
                )
            );

        }

    }
);


/* =========================================================
   CATEGORY FILTERS
========================================================= */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(filter => {

                        filter.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.dataset.category;


                renderProducts();

            }
        );

    });


/* =========================================================
   CHECKOUT
========================================================= */

document
    .getElementById("checkoutButton")
    .addEventListener(
        "click",
        openCheckout
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeCheckout
    );


checkoutModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            checkoutModal
        ) {

            closeCheckout();

        }

    }
);


/* =========================================================
   WHATSAPP ORDER
========================================================= */

document
    .getElementById("checkoutForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!cart.length) {
                return;
            }


            const details =
                Object.fromEntries(
                    new FormData(
                        event.currentTarget
                    ).entries()
                );


            const whatsappUrl =
                `https://wa.me/${STORE.whatsapp}?text=${
                    encodeURIComponent(
                        orderMessage(details)
                    )
                }`;


            window.open(
                whatsappUrl,
                "_blank"
            );


            closeCheckout();

            closeCart();

        }
    );


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeCheckout();

            closeCart();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

configureContactDetails();

renderProducts();

renderCart();
