
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


// Shared header: preserve page interactions while exposing mobile navigation.
document.querySelectorAll('.l-header').forEach((siteHeader) => {
    const toggle = siteHeader.querySelector('.l-header__toggle');
    const navigation = siteHeader.querySelector('.l-header__nav');
    const updateScroll = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 50);
    if (!siteHeader.classList.contains('l-header--steady')) {
        updateScroll();
        window.addEventListener('scroll', updateScroll, { passive: true });
    }
    if (!toggle || !navigation) return;
    const setOpen = (open, focusMenu = false) => {
        siteHeader.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
        if (open && focusMenu) navigation.querySelector('a')?.focus();
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true', true));
    navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (!siteHeader.contains(event.target)) setOpen(false);
    });
    siteHeader.addEventListener('focusout', (event) => {
        if (event.relatedTarget && !siteHeader.contains(event.relatedTarget)) setOpen(false);
    });
    window.matchMedia('(max-width: 1100px)').addEventListener('change', () => setOpen(false));
});

// Shared footer TOP link: preserve smooth scrolling and honor reduced motion.
document.querySelector('.p-footer__back-to-top')?.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector('.l-header__logo a')?.focus({ preventScroll: true });
    window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
});
