// Native swipe and scroll snap, enhanced with keyboard and button controls.
(() => {
    const section = document.querySelector('.p-news');
    const list = section?.querySelector('.p-news__list');
    const controls = section?.querySelector('.p-news__controls');
    if (!list || !controls) return;

    const cards = [...list.querySelectorAll('.p-news-card')];
    if (cards.length < 2) return;
    const mobile = matchMedia('(max-width: 768px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const position = controls.querySelector('.p-news__position');
    let active = false;
    let current = 0;
    let slides = cards;
    let frame = 0;
    let settleTimer = 0;
    let moving = false;
    let pointerDown = false;

    const offset = (index) => slides[index].offsetLeft - slides[0].offsetLeft;
    const nearest = () => slides.reduce((best, card, index) =>
        Math.abs(offset(index) - list.scrollLeft) < Math.abs(offset(best) - list.scrollLeft) ? index : best, 0);
    const updatePosition = () => { position.textContent = `${current + 1} / ${cards.length}`; };
    const cancelMotion = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        moving = false;
        list.classList.remove('is-moving');
    };
    const finish = (visualIndex) => {
        current = (visualIndex - 1 + cards.length) % cards.length;
        // The inert end copies let the last-to-first transition move one card.
        if (visualIndex === 0 || visualIndex === slides.length - 1) {
            list.classList.add('is-moving');
            list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
        }
        cancelMotion();
        updatePosition();
    };
    const moveTo = (visualIndex) => {
        if (!active) return;
        clearTimeout(settleTimer);
        cancelMotion();
        visualIndex = Math.max(0, Math.min(slides.length - 1, visualIndex));
        if (reducedMotion.matches) {
            list.scrollTo({ left: offset(visualIndex), behavior: 'instant' });
            finish(visualIndex);
            return;
        }
        const from = list.scrollLeft;
        const to = offset(visualIndex);
        const started = performance.now();
        moving = true;
        list.classList.add('is-moving');
        const tick = (now) => {
            const progress = Math.min(1, (now - started) / 700);
            list.scrollLeft = from + (to - from) * (1 - (1 - progress) ** 3);
            if (progress < 1) frame = requestAnimationFrame(tick);
            else finish(visualIndex);
        };
        frame = requestAnimationFrame(tick);
    };
    const moveBy = (amount) => moveTo(nearest() + amount);
    const makeCopy = (card) => {
        const copy = card.cloneNode(true);
        copy.dataset.newsClone = '';
        copy.inert = true;
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('id');
        copy.removeAttribute('tabindex');
        copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        return copy;
    };
    const configure = () => {
        cancelMotion();
        clearTimeout(settleTimer);
        list.querySelectorAll('[data-news-clone]').forEach((copy) => copy.remove());
        active = mobile.matches;
        controls.hidden = !active;
        cards.forEach((card) => {
            if (active) card.tabIndex = 0;
            else card.removeAttribute('tabindex');
        });
        if (active) {
            list.tabIndex = 0;
            list.setAttribute('aria-roledescription', 'カルーセル');
            list.prepend(makeCopy(cards.at(-1)));
            list.append(makeCopy(cards[0]));
            slides = [...list.querySelectorAll('.p-news-card')];
            list.classList.add('is-moving');
            list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
            list.classList.remove('is-moving');
        } else {
            slides = cards;
            list.removeAttribute('tabindex');
            list.removeAttribute('aria-roledescription');
            list.scrollLeft = 0;
        }
        updatePosition();
    };

    controls.querySelector('.p-news__previous').addEventListener('click', () => moveBy(-1));
    controls.querySelector('.p-news__next').addEventListener('click', () => moveBy(1));
    list.addEventListener('keydown', (event) => {
        if (!active) return;
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'Home') moveTo(1);
            else if (event.key === 'End') moveTo(cards.length);
            else moveBy(event.key === 'ArrowRight' ? 1 : -1);
        }
    });
    list.addEventListener('scroll', () => {
        if (!active || moving) return;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            if (!pointerDown) finish(nearest());
        }, 180);
    }, { passive: true });
    list.addEventListener('pointerdown', () => {
        pointerDown = true;
        cancelMotion();
    }, { passive: true });
    const release = () => {
        if (!pointerDown) return;
        pointerDown = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => finish(nearest()), 180);
    };
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    list.addEventListener('wheel', cancelMotion, { passive: true });
    mobile.addEventListener('change', configure);
    reducedMotion.addEventListener('change', () => {
        if (active) { cancelMotion(); finish(nearest()); }
    });
    window.addEventListener('resize', () => {
        if (active) { cancelMotion(); moveTo(current + 1); }
    }, { passive: true });
    configure();
})();
