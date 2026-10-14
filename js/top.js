// Keep mobile hero framing stable when browser chrome changes viewport height.
// Width changes (including orientation changes) recalculate the initial framing.
const mobileHero = document.querySelector('.p-hero');
if (mobileHero) {
    const mobileHeroQuery = window.matchMedia('(max-width: 768px)');
    let heroViewportWidth;
    const setMobileHeroHeight = () => {
        const width = document.documentElement.clientWidth;
        if (width === heroViewportWidth) return;
        heroViewportWidth = width;
        mobileHero.style.removeProperty('--hero-mobile-height');
        if (mobileHeroQuery.matches) {
            mobileHero.style.setProperty('--hero-mobile-height', `${mobileHero.getBoundingClientRect().height}px`);
        }
    };
    setMobileHeroHeight();
    window.addEventListener('resize', setMobileHeroHeight, { passive: true });
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
function updateScrollBackground() {
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
    // Match the hero edge to the existing background, including the first paint.
    mobileHero?.style.setProperty("--hero-edge-color", document.body.style.backgroundColor);
}

window.addEventListener("scroll", updateScrollBackground, { passive: true });
updateScrollBackground();

// ==========================================
// 03. Scroll Animation
// ==========================================
// ------------------------------------------
// Products
// ------------------------------------------
//Products Scroll Animation

gsap.registerPlugin(ScrollTrigger);
// Reveal only the cards entering view, rather than scrubbing the whole grid.
const productReveal = gsap.matchMedia();
productReveal.add("(prefers-reduced-motion: no-preference)", (context) => {
    const cards = gsap.utils.toArray(".p-products .p-product-card");
    if (!cards.length) return;

    // Pause the card's hover transition while GSAP owns its transform.
    gsap.set(cards, { opacity: 0, y: 10, transition: "none" });
    ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        interval: 0.1,
        onEnter: (batch) => context.add(() => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                stagger: 0.12,
                clearProps: "opacity,transform,transition"
            });
        })
    });
});

// ------------------------------------------
// Brand Story: reveal the content together once; keep the no-JS default visible.
// ------------------------------------------

const brandReveal = gsap.matchMedia();
brandReveal.add("(prefers-reduced-motion: no-preference)", () => {
    const brandContent = document.querySelector(".p-brand > .l-container");
    if (!brandContent) return;

    gsap.from(brandContent, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        clearProps: "opacity,transform",
        scrollTrigger: {
            trigger: brandContent,
            start: "top 85%",
            once: true
        }
    });
});

// ------------------------------------------
// Section Heading
// ------------------------------------------

gsap.utils.toArray(".c-section-heading").forEach((heading) => {
    if (heading.closest(".p-brand")) return;

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