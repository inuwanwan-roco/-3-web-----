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
}

// ------------------------------------------
// Create Cart Card
// ------------------------------------------

function createCartCard(item) {
    return `
        <article class="p-cart-card">
            <div class="p-cart-card__image">
                <img
                    src="${item.image}"
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
                <p class="p-cart-card__quantity">

                    数量：${item.quantity}
                </p>
            </div>
            <button
                class="p-cart-card__remove">
                <i class="fa-solid fa-trash"></i>
            </button>
        </article>
    `;
}