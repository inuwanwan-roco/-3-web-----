// ==========================================
// Loading Animation
// ==========================================

const footprints = document.querySelector(
    ".p-loading__footprints"
);

const maxFootprints = 6;

let count = 0;

const interval = setInterval(() => {

    const paw = document.createElement("i");

    paw.className = "fa-solid fa-paw p-loading__paw";

    footprints.appendChild(paw);

    count++;

    if (count >= maxFootprints) {

        clearInterval(interval);

        setTimeout(() => {

            window.location.href = "complete.html";

        }, 1200);

    }

}, 450);