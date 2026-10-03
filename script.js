```javascript
/* =========================================
   WHATSAPP NUMBER
   ========================================= */

const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";


/* =========================================
   CART
   ========================================= */

let cart = [];


/* =========================================
   ADD PRODUCT
   ========================================= */

function addToCart(name, price) {

    const existingProduct = cart.find(
        item => item.name === name
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCart();
}


/* =========================================
   REMOVE PRODUCT
   ========================================= */

function removeFromCart(name) {

    const product = cart.find(
        item => item.name === name
    );

    if (!product) {
        return;
    }

    product.quantity--;

    if (product.quantity <= 0) {

        cart = cart.filter(
            item => item.name !== name
        );
    }

    updateCart();
}


/* =========================================
   UPDATE CART DISPLAY
   ========================================= */

function updateCart() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.textContent = "0.00";

        return;
    }


    let html = "";
    let total = 0;


    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        html += `
            <div class="cart-item">

                <div>
                    <strong>${item.name}</strong>
                    <br>
                    €${item.price.toFixed(2)}
                    × ${item.quantity}
                </div>

                <div>
                    <strong>
                        €${itemTotal.toFixed(2)}
                    </strong>

                    <br>

                    <button
                        onclick="removeFromCart('${item.name}')"
                    >
                        −
                    </button>

                    <button
                        onclick="addToCart('${item.name}', ${item.price})"
                    >
                        +
                    </button>
                </div>

            </div>
        `;
    });


    cartItems.innerHTML = html;

    cartTotal.textContent =
        total.toFixed(2);
}


/* =========================================
   CALCULATE TOTAL
   ========================================= */

function calculateTotal() {

    return cart.reduce(
        (total, item) => {

            return total +
                item.price * item.quantity;

        },
        0
    );
}


/* =========================================
   CREATE WHATSAPP ORDER
   ========================================= */

document
    .getElementById("orderForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        /* Check cart */

        if (cart.length === 0) {

            alert(
                "Your cart is empty. Please add a product first."
            );

            return;
        }


        /* Customer information */

        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const address =
            document.getElementById("customerAddress").value.trim();

        const city =
            document.getElementById("customerCity").value.trim();

        const postal =
            document.getElementById("customerPostal").value.trim();


        /* Create order number */

        const orderNumber =
            "ORD-" +
            Date.now().toString().slice(-6);


        /* Current date/time */

        const orderDate =
            new Date().toLocaleString();


        /* Product list */

        let productText = "";


        cart.forEach(item => {

            const itemTotal =
                item.price * item.quantity;

            productText +=
                `• ${item.name} × ${item.quantity} = €${itemTotal.toFixed(2)}\n`;
        });


        /* Total */

        const total =
            calculateTotal();


        /* WhatsApp message */

        const message = `🛒 *NEW ORDER*

*Order Number:* ${orderNumber}

*CUSTOMER DETAILS*
Name: ${name}
Phone: ${phone}

*DELIVERY ADDRESS*
${address}
${city}
${postal}

*ORDER DETAILS*
${productText}
*TOTAL: €${total.toFixed(2)}*

Order Time:
${orderDate}

Thank you!`;


        /* Encode message */

        const encodedMessage =
            encodeURIComponent(message);


        /* WhatsApp URL */

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;


        /* Open WhatsApp */

        window.open(
            whatsappURL,
            "_blank"
        );

    });


/* =========================================
   INITIAL CART
   ========================================= */

updateCart();
```
