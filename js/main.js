
// ==========================================
// 01. UI
// ==========================================

// Toast

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    const text = toast.querySelector(".c-toast__text");

    text.textContent = message;

    toast.classList.add("is-show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.remove("is-show");
    }, 2000);
}

// ==========================================
// 02. Utility
// ==========================================

