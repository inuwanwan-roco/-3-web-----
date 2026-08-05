// ==========================================
// 01. Order
// ==========================================

// ------------------------------------------
// Get Order
// ------------------------------------------

function getOrder() {

    return JSON.parse(

        localStorage.getItem("order")

    );

}

// ------------------------------------------
// Render Order
// ------------------------------------------

function renderOrder() {

    const order = getOrder();

    if (!order) {

        window.location.href =
            "checkout.html";

        return;

    }

    document.getElementById(
        "confirm-name"
    ).textContent =
        order.name;

    document.getElementById(
        "confirm-kana"
    ).textContent =
        order.kana;

    document.getElementById(
        "confirm-email"
    ).textContent =
        order.email;

    document.getElementById(
        "confirm-phone"
    ).textContent =
        order.phone;

    document.getElementById(
        "confirm-postal"
    ).textContent =
        order.postal;

    document.getElementById(
        "confirm-prefecture"
    ).textContent =
        order.prefecture;

    document.getElementById(
        "confirm-city"
    ).textContent =
        order.city;

    document.getElementById(
        "confirm-street"
    ).textContent =
        order.street;

    document.getElementById(
        "confirm-building"
    ).textContent =
        order.building;

    const paymentName = {

        credit: "クレジットカード",

        paypay: "PayPay",

        convenience: "コンビニ払い",

        cod: "代金引換"

    };

    document.getElementById(
        "confirm-payment"
    ).textContent =
        paymentName[order.payment];

}

renderOrder();

// ==========================================
// 02. Cart
// ==========================================

// ------------------------------------------
// Get Cart
// ------------------------------------------

function getCart() {

    return JSON.parse(

        localStorage.getItem("cart")

    ) || [];

}

// ------------------------------------------
// Render Cart
// ------------------------------------------

function renderCart() {

    const cart = getCart();

    const productsContainer =
        document.querySelector(
            ".p-summary__products"
        );

    productsContainer.innerHTML = "";

    cart.forEach((item) => {

        productsContainer.innerHTML +=
            createSummaryItem(item);

    });

    updateSummary(cart);

}

renderCart();

// ==========================================
// 03. Summary
// ==========================================

// ------------------------------------------
// Update Summary
// ------------------------------------------

function updateSummary(cart) {

    const totalQuantity = cart.reduce(

        (sum, item) =>

            sum + item.quantity,

        0

    );

    const subtotal = cart.reduce(

        (sum, item) =>

            sum + item.price * item.quantity,

        0

    );

    const order = getOrder();

    let shipping = subtotal >= 5000 ? 0 : 550;

    let paymentFee = 0;

    switch (order.payment) {

        case "convenience":

            paymentFee = 220;

            break;

        case "cod":

            paymentFee = 330;

            break;

    }

    document.getElementById(
        "confirm-count"
    ).textContent =
        `${totalQuantity}点`;

    document.getElementById(
        "confirm-subtotal"
    ).textContent =
        `¥${subtotal.toLocaleString()}`;

    document.getElementById(
        "confirm-shipping"
    ).textContent =

        shipping === 0

            ? "無料"

            : `¥${shipping.toLocaleString()}`;

    document.getElementById(
        "confirm-fee"
    ).textContent =

        paymentFee === 0

            ? "¥0"

            : `¥${paymentFee.toLocaleString()}`;

    document.getElementById(
        "confirm-shipping-message"
    ).textContent =

        shipping === 0

            ? "送料無料"

            : "5,000円以上のお買い上げで送料無料";

    document.getElementById(
        "confirm-total"
    ).textContent =

        `¥${(

            subtotal +

            shipping +

            paymentFee

        ).toLocaleString()}`;
}

// ------------------------------------------
// Create Summary Item
// ------------------------------------------

function createSummaryItem(item) {

    return `

        <div class="p-summary-product">
            <img
                src="${item.image}"
                alt="${item.name}"
                class="p-summary-product__image">
            <div class="p-summary-product__body">
                <p class="p-summary-product__name">
                    ${item.name}
                </p>
                ${
                    item.optionValue
                        ? `
                        <p class="p-summary-product__option">
                            ${item.optionName} :
                            ${item.optionValue}
                        </p>
                        `
                        : ""
                }
            </div>
            <span class="p-summary-product__quantity">
                ×${item.quantity}
            </span>
        </div>
    `;
}

// ==========================================
// 04. Submit
// ==========================================

// ------------------------------------------
// Submit Order
// ------------------------------------------

document
    .getElementById(
        "confirm-submit"
    )
    .addEventListener(
        "click",

        submitOrder
    );

function submitOrder() {

    window.location.href =
        "complete.html";
}