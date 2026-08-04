// ==========================================
// 01. Header
// ==========================================

//Header Scroll Effect

const header = document.querySelector(".l-header");
if (header) {
    window.addEventListener("scroll", () => {
        header.classList.toggle("is-scrolled", window.scrollY > 50);
    });
}

// ==========================================
// 02. Background Animation
// ==========================================

//Scroll Background Color

const sections = [
    {element: document.querySelector(".p-hero"),
        color: [16, 32, 54]},

    {element: document.querySelector(".p-brand"),
        color: [28, 50, 80]},

    {element: document.querySelector(".p-products"),
        color: [55, 90, 140]},

    {element: document.querySelector(".p-special-care"),
        color: [120, 170, 220]},

    {element: document.querySelector(".p-news"),
        color: [205, 228, 245]},

    {element: document.querySelector(".p-contact"),
        color: [190, 215, 235]}
];

const footer = document.querySelector(".p-footer");
window.addEventListener("scroll", () => {
    const y =
        window.scrollY +
        window.innerHeight * 0.5;
    let changed = false;

    // Hero ～ Contact

    for (let i = 0; i < sections.length - 1; i++) {
        const current = sections[i];
        const next = sections[i + 1];
        const start = current.element.offsetTop;
        const end = next.element.offsetTop;

        if (y >= start && y <= end) {
            const t = (y - start) / (end - start);
            const r = Math.round(
                current.color[0] +
                (next.color[0] - current.color[0]) * t);
            const g = Math.round(
                current.color[1] +
                (next.color[1] - current.color[1]) * t);
            const b = Math.round(
                current.color[2] +
                (next.color[2] - current.color[2]) * t);

            document.body.style.backgroundColor =
                `rgb(${r}, ${g}, ${b})`;

            changed = true;
            break;
        }
    }

    // Footerだけ専用演出

    if (!changed) {
        const rect = footer.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            const progress = Math.min(
                1,
                (window.innerHeight - rect.top) / footer.offsetHeight);

            const start = [190, 215, 235];
            const end = [20, 48, 89];

            const r = Math.round(
                start[0] + (end[0] - start[0]) * progress);

            const g = Math.round(
                start[1] + (end[1] - start[1]) * progress);

            const b = Math.round(
                start[2] + (end[2] - start[2]) * progress);

            document.body.style.backgroundColor =
                `rgb(${r}, ${g}, ${b})`;
        }
    }
});

// ==========================================
// 03. Scroll Animation
// ==========================================
// ------------------------------------------
// Products
// ------------------------------------------
//Products Scroll Animation

gsap.registerPlugin(ScrollTrigger);
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".p-products",
        start: "top 80%",
        end: "bottom 30%",
        scrub: 1
    }
});

tl.from(".p-product-card", {
    opacity: 0,
    y: 80,
    duration: 1.2,
    ease: "power3.out",
    stagger: 0.18
});

// ------------------------------------------
// Section Heading
// ------------------------------------------

gsap.utils.toArray(".c-section-heading").forEach((heading) => {
    gsap.from(heading, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",

        scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            scrub: 1
        }
    });

});

// ------------------------------------------
// End Marker
// ------------------------------------------

const particle = document.querySelector(".c-end-marker__particle");

if (particle) {
    
    // 光の粒
    gsap.set(particle, {
        y: -8,
        opacity: 1
    });

    gsap.timeline({
        repeat: -1,
        repeatDelay: 1
    })
    .to(particle, {
        y: 180,
        duration: 2.5,
        ease: "none"
    })
    .to(particle, {
        opacity: 0,
        duration: 0.25
    })
    .set(particle, {
        y: -8,
        opacity: 1
    });
}