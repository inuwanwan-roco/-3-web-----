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

// ==========================================
// 04. Validation
// ==========================================
// ------------------------------------------
// Checkout Confirm Button
// ------------------------------------------

document
    .getElementById("checkout-confirm")
    .addEventListener("click", () => {
        validateForm();
    });

// ------------------------------------------
// Validate Form
// ------------------------------------------

function validateForm() {
    let isValid = true;

    const fields = [
        {
            id: "customer-name",
            message: "お名前を入力してください。"
        },
        {
            id: "customer-kana",
            message: "フリガナを入力してください。"
        },
        {
            id: "customer-email",
            message: "メールアドレスを入力してください。"
        },
        {
            id: "customer-phone",
            message: "電話番号を入力してください。"
        },
        {
            id: "postal-code",
            message: "郵便番号を入力してください。"
        },
        {
            id: "prefecture",
            message: "都道府県を選択してください。"
        },
        {
            id: "city",
            message: "市区町村を入力してください。"
        },
        {
            id: "street",
            message: "番地を入力してください。"
        }
    ];

    fields.forEach((field) => {

        const input =
            document.getElementById(field.id);

        const error =
            input.parentElement.querySelector(
                ".p-form-group__error"
            );

        input.classList.remove("is-error");
        error.textContent = "";

        if (input.value.trim() === "") {
            input.classList.add("is-error");
            error.textContent = field.message;
            isValid = false;
        }
    });

// ------------------------------------------
// Email Format
// ------------------------------------------

const email =
    document.getElementById(
        "customer-email"
    );

const emailError =
    email.parentElement.querySelector(
        ".p-form-group__error"
    );

const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (
    email.value.trim() !== "" &&
    !emailPattern.test(email.value)
) {

    email.classList.add("is-error");
    emailError.textContent =
        "メールアドレスの形式が正しくありません。";
    isValid = false;
}

// ------------------------------------------
// Phone Format
// ------------------------------------------

const phone =
    document.getElementById(
        "customer-phone"
    );

const phoneError =
    phone.parentElement.querySelector(
        ".p-form-group__error"
    );

const phoneValue =
    phone.value.replace(/-/g, "");

const phonePattern =
    /^\d{10,11}$/;

if (
    phone.value.trim() !== "" &&
    !phonePattern.test(phoneValue)
) {

    phone.classList.add("is-error");
    phoneError.textContent =
        "電話番号を正しく入力してください。";
    isValid = false;
}

// ------------------------------------------
// Postal Code Format
// ------------------------------------------

const postalCode =
    document.getElementById(
        "postal-code"
    );

const postalCodeError =
    postalCode.parentElement.querySelector(
        ".p-form-group__error"
    );

// ハイフンを除去
const postalCodeValue =
    postalCode.value.replace(/-/g, "");

const postalCodePattern =
    /^\d{7}$/;

if (
    postalCode.value.trim() !== "" &&
    !postalCodePattern.test(
        postalCodeValue
    )
) {

    postalCode.classList.add("is-error");
    postalCodeError.textContent =
        "郵便番号を正しく入力してください。";
    isValid = false;
}

    if (isValid) {
        saveOrder();
        window.location.href =
            "confirm.html";
    }
}

// ==========================================
// 05. Address
// ==========================================
// ------------------------------------------
// Postal Code Event
// ------------------------------------------

document
    .getElementById("postal-code")
    .addEventListener("blur", () => {
        searchAddress();
    });

// ------------------------------------------
// Search Address
// ------------------------------------------

async function searchAddress() {
    const postalCode = document
        .getElementById("postal-code")
        .value
        .replace(/-/g, "");

    if (postalCode.length !== 7) {
        return;
    }

    try {

        const response = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
        );

        const data = await response.json();

        console.log(data);

        if (
            data.status !== 200 ||
            !data.results
        ) {

            const postalCode =
                document.getElementById(
                    "postal-code"
                );

            const postalCodeError =
                postalCode.parentElement.querySelector(
                    ".p-form-group__error"
                );

            postalCode.classList.add("is-error");

            postalCodeError.textContent =
                "該当する住所が見つかりませんでした。";

            return;
        }

        const address =
            data.results[0];

        document.getElementById(
            "prefecture"
        ).value =
            address.address1;

        document.getElementById(
            "city"
        ).value =
            address.address2 +
            address.address3;

        // ------------------------------------------
        // Clear Validation
        // ------------------------------------------

        const prefecture =
            document.getElementById(
                "prefecture"
            );

        const city =
            document.getElementById(
                "city"
            );

        prefecture.classList.remove(
            "is-error"
        );

        city.classList.remove(
            "is-error"
        );

        prefecture
            .parentElement
            .querySelector(
                ".p-form-group__error"
            ).textContent = "";

        city
            .parentElement
            .querySelector(
                ".p-form-group__error"
            ).textContent = "";

            } catch (error) {

                console.error(
                    "住所検索エラー",
                    error
                );

                const postalCode =
                    document.getElementById(
                        "postal-code"
                    );

                const postalCodeError =
                    postalCode.parentElement.querySelector(
                        ".p-form-group__error"
                    );

                postalCode.classList.add(
                    "is-error"
                );

                postalCodeError.textContent =
                    "住所を取得できませんでした。時間をおいてもう一度お試しください。";
            }
}

// ==========================================
// 06. Order
// ==========================================

// ------------------------------------------
// // Save Order Data to Local Storage
// ------------------------------------------

function saveOrder() {
    const order = {
        name:
            document.getElementById(
                "customer-name"
            ).value,

        kana:
            document.getElementById(
                "customer-kana"
            ).value,

        email:
            document.getElementById(
                "customer-email"
            ).value,

        phone:
            document.getElementById(
                "customer-phone"
            ).value,

        postal:
            document.getElementById(
                "postal-code"
            ).value,

        prefecture:
            document.getElementById(
                "prefecture"
            ).value,

        city:
            document.getElementById(
                "city"
            ).value,

        street:
            document.getElementById(
                "street"
            ).value,

        building:
            document.getElementById(
                "building"
            ).value,

        payment:
            document.querySelector(
                'input[name="payment"]:checked'
            ).value
    };

    localStorage.setItem(
        "order",
        JSON.stringify(order)
    );
}

// ==========================================
// 07. Restore Order
// ==========================================

// ------------------------------------------
// Restore Order
// ------------------------------------------

function restoreOrder() {

    const order = JSON.parse(
        localStorage.getItem("order")
    );

    if (!order) {
        return;
    }

    document.getElementById(
        "customer-name"
    ).value =
        order.name;

    document.getElementById(
        "customer-kana"
    ).value =
        order.kana;

    document.getElementById(
        "customer-email"
    ).value =
        order.email;

    document.getElementById(
        "customer-phone"
    ).value =
        order.phone;

    document.getElementById(
        "postal-code"
    ).value =
        order.postal;

    document.getElementById(
        "prefecture"
    ).value =
        order.prefecture;

    document.getElementById(
        "city"
    ).value =
        order.city;

    document.getElementById(
        "street"
    ).value =
        order.street;

    document.getElementById(
        "building"
    ).value =
        order.building;

    document.querySelector(
        `input[name="payment"][value="${order.payment}"]`
    ).checked = true;

    renderCheckout();
}

restoreOrder();