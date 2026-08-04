// ==========================================
// 01. Cart
// ==========================================
// ------------------------------------------
// Add to Cart
// ------------------------------------------

const cartButtons = document.querySelectorAll(
    ".p-products-card__cart"
);

cartButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".p-products-card");
        const item = createCartItem(card);

        if (!item) {
            return;
        }
        saveCart(item);
        showToast("カートに追加しました");
    });
});

// ------------------------------------------
// Create Cart Item
// ------------------------------------------

function createCartItem(card) {
    const optionFieldset = card.querySelector(
        ".p-products-option"
    );

    const optionName = optionFieldset
        ? optionFieldset.dataset.optionName
        : "";

    const checkedOption = card.querySelector(
        'input[type="radio"]:checked'
    );

    const optionValue = checkedOption
        ? checkedOption.value
        : "";

    const quantitySelect = card.querySelector(
        ".p-products-quantity__select"
    );

    const quantity = quantitySelect
        ? Number(quantitySelect.value)
        : 1;

    if (
        card.classList.contains(
            "p-products-card--accordion"
        ) &&
        !checkedOption
    ) {

        showToast(`${optionName}を選択してください`);
        return null;
    }

    return {
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        image: card.dataset.image,
        optionName,
        optionValue,
        quantity
    };
}

// ------------------------------------------
// Save Cart
// ------------------------------------------

function saveCart(item) {
    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    const existingItem =
        cart.find((product) => {
            return (
                product.id === item.id &&
                product.optionName === item.optionName &&
                product.optionValue === item.optionValue
            );
        });

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}

// ==========================================
// 02. Accordion
// ==========================================
// ------------------------------------------
// Select Type
// ------------------------------------------
const accordionButtons = document.querySelectorAll(
    ".p-products-accordion__button"
);

accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const content =
            button.nextElementSibling;

        button.classList.toggle("is-open");

        content.classList.toggle("is-open");

        button.setAttribute(
            "aria-expanded",
            button.classList.contains("is-open")
        );
    });
});


// ==========================================
// 03. Sidebar
// ==========================================
// ------------------------------------------
// Sticky Sidebar
// ------------------------------------------

// ここにサイドバー固定処理を追加


// ==========================================
// 04. Filter
// ==========================================
// ------------------------------------------
// Category Filter
// ------------------------------------------

// 将来的に追加


// ==========================================
// 05. Animation
// ==========================================
// ------------------------------------------
// Products Animation
// ------------------------------------------

// 将来的に追加