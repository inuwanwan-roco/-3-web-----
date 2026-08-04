// ==========================================
// 01. Cart
// ==========================================

// ------------------------------------------
// Initialize
// ------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

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
    const cartList =
        document.querySelector(
            ".p-cart__list"
        );
    cartList.innerHTML = "";
    cart.forEach((item) => {
        cartList.innerHTML +=
            createCartCard(item);
    });

    updateSummary(cart);
}

// ------------------------------------------
// Create Cart Card
// ------------------------------------------

function createCartCard(item) {
    return `
        <article class="p-cart-card">
          <div class="p-cart-card__image">
            <img src="${item.image}"
                  alt="${item.name}">
          </div>
          <div class="p-cart-card__body">
            <h3 class="p-cart-card__title">
                ${item.name}
            </h3>
            ${
                item.optionName
                  ? `
                <p class="p-cart-card__option">
                  ${item.optionName}：
                  ${item.optionValue}
                </p>
                    `
                  : ""
              }
              <p class="p-cart-card__price">
                  ¥${item.price.toLocaleString()}
              </p>
              <div class="p-cart-card__quantity">
                <button
                  class="p-cart-card__quantity-btn"
                  data-action="decrease"
                  data-id="${item.id}"
                  data-option-name="${item.optionName}"
                  data-option="${item.optionValue}">
                  −
                </button>
                <span class="p-cart-card__quantity-value">
                  ${item.quantity}
                </span>
                <button
                    class="p-cart-card__quantity-btn"
                    data-action="increase"
                    data-id="${item.id}"
                    data-option-name="${item.optionName}"
                    data-option="${item.optionValue}">
                    ＋
                </button>
              </div>
          </div>
          <button
            class="p-cart-card__remove">
              i class="fa-solid fa-trash"></i>
          </button>
        </article>
      `;
}

// ------------------------------------------
// Update Summary
// ------------------------------------------

function updateSummary(cart) {
    const totalQuantity = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    const totalPrice = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    document.getElementById("cart-count").textContent =
        `${totalQuantity}点`;

    document.getElementById("cart-subtotal").textContent =
        `¥${totalPrice.toLocaleString()}`;

    document.getElementById("cart-total").textContent =
        `¥${totalPrice.toLocaleString()}`;

}

// ------------------------------------------
// Update Quantity
// ------------------------------------------

function updateQuantity(id, optionName, optionValue, action) {
    const cart = getCart();
    const item = cart.find((product) => {

        return (
            product.id === id &&
            product.optionName === optionName &&
            product.optionValue === optionValue
        );
    });

    if (!item) return;
    if (action === "increase") {
        item.quantity++;
    }

    if (action === "decrease" && item.quantity > 1) {
        item.quantity--;
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
    renderCart();
}

// ------------------------------------------
// Quantity Button
// ------------------------------------------

document.addEventListener("click", (event) => {
    if (
        !event.target.classList.contains(
            "p-cart-card__quantity-btn"
        )
    ) {
        return;
    }
    updateQuantity(
        event.target.dataset.id,
        event.target.dataset.optionName,
        event.target.dataset.option,
        event.target.dataset.action
    );
});