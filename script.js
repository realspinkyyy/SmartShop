const cart = JSON.parse(localStorage.getItem("cart")) || {};
const cartItems = document.getElementById("cartItems");
const scannerButton = document.getElementById("startScan");
const checkoutButton = document.getElementById("checkout");
const receiptContainer = document.getElementById("receiptContainer");
const receipt = document.getElementById("receipt");
const printButton = document.getElementById("printReceipt");
const darkModeToggle = document.getElementById("darkModeToggle");

let beepSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

function updateCartUI() {
    cartItems.innerHTML = "";
    for (let code in cart) {
        const item = cart[code];
        let li = document.createElement("li");
        li.classList.add("cart-item");
        li.innerHTML = `
            <span>${item.name} - £${item.price.toFixed(2)}</span>
            <button onclick="updateQuantity('${code}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${code}', 1)">+</button>
        `;
        cartItems.appendChild(li);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateQuantity(code, change) {
    if (cart[code]) {
        cart[code].quantity += change;
        if (cart[code].quantity <= 0) {
            delete cart[code];
        }
        updateCartUI();
    }
}

scannerButton.addEventListener("click", () => {
    const codeReader = new ZXing.BrowserBarcodeReader();
    codeReader.decodeFromInputVideoDevice(undefined, "video").then(result => {
        beepSound.play();
        addToCart(result.text);
    }).catch(err => console.error(err));
});

function addToCart(code) {
    fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 1) {
                const name = data.product.product_name || "Unknown Item";
                const price = (Math.random() * 5 + 1).toFixed(2);
                if (cart[code]) {
                    cart[code].quantity++;
                } else {
                    cart[code] = { name, price: parseFloat(price), quantity: 1 };
                }
                updateCartUI();
            } else {
                alert("Item not found in database.");
            }
        });
}

checkoutButton.addEventListener("click", () => {
    let total = 0;
    let orderNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    let receiptHTML = `<h2>Receipt #${orderNum}</h2><ul>`;
    
    for (let code in cart) {
        const item = cart[code];
        receiptHTML += `<li>${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}</li>`;
        total += item.price * item.quantity;
    }

    receiptHTML += `</ul><h3>Total: £${total.toFixed(2)}</h3>
    <img src="https://barcode.tec-it.com/barcode.ashx?data=${orderNum}" />
    <br><br>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://your-smart-shop.com" />
    `;

    receipt.innerHTML = receiptHTML;
    receiptContainer.classList.remove("hidden");
    localStorage.removeItem("cart");
    cartItems.innerHTML = "";
});

printButton.addEventListener("click", () => {
    window.print();
});

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
updateCartUI();
