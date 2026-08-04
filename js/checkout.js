// ==========================================
// 01. Cart
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
// Render Checkout
// ------------------------------------------

function renderCheckout() {
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

// 初期表示
renderCheckout();

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
                    ?
                    `<p class="p-summary-product__option">
                        ${item.optionName} :
                        ${item.optionValue}
                      </p>`
                    :
                    ""
                  }
            </div>
            <span class="p-summary-product__quantity">
                ×${item.quantity}
            </span>
        </div>
      `;
}

// ==========================================
// 02. Summary
// ==========================================
// ------------------------------------------
// Update Summary
// ------------------------------------------

function updateSummary(cart) {
    const totalQuantity = cart.reduce(
        (sum, item) => {
            return sum + item.quantity;
        },
        0
    );

    const subtotal = cart.reduce(
        (sum, item) => {
            return sum +
                item.price * item.quantity;
        },
        0
    );

    // ------------------------------------------
    // Shipping
    // ------------------------------------------

    const shipping = subtotal >= 5000 ? 0 : 550;

    // ------------------------------------------
    // Payment Fee
    // ------------------------------------------

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    );

    let paymentFee = 0;

    switch (payment.value) {
        case "convenience":
            paymentFee = 220;
            break;

        case "cod":
            paymentFee = 330;
            break;
    }


    document.getElementById(
        "checkout-count"
    ).textContent =
        `${totalQuantity}点`;

    document.getElementById(
        "checkout-subtotal"
    ).textContent =
        `¥${subtotal.toLocaleString()}`;

    document.getElementById(
      "checkout-shipping"
    ).textContent =
        shipping === 0
          ? "無料"
          : `¥${shipping.toLocaleString()}`;

    document.getElementById(
        "checkout-fee"
    ).textContent =
        paymentFee === 0
          ? "¥0"
          : `¥${paymentFee.toLocaleString()}`;
        
    const shippingMessage =
      document.getElementById(
        "checkout-shipping-message"
      );

    shippingMessage.textContent =
        shipping === 0
            ? "送料無料"
            : "5,000円以上のお買い上げで送料無料";

      const total =
        subtotal +
        shipping +
        paymentFee;

      document.getElementById(
          "checkout-total"
      ).textContent =
          `¥${total.toLocaleString()}`;
}

// ==========================================
// 03. Payment
// ==========================================

document
    .querySelectorAll(
        'input[name="payment"]'
    )
    .forEach((radio) => {

        radio.addEventListener(
            "change",
            () => {
                renderCheckout();
            }
        );
    });