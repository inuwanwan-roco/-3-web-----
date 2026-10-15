// OUR PROMISE uses the NEWS carousel's native swipe, 4s interval and 700ms motion.
// Keep the controller scoped here so NEWS and the shared header remain unchanged.
(() => {
    const section = document.querySelector('#our-promise');
    const list = section?.querySelector('.p-brand-story__promises');
    const controls = section?.querySelector('.p-brand-story__promise-controls');
    if (!list || !controls) return;

    const cards = [...list.children];
    if (cards.length < 2) return;
    const mobile = matchMedia('(max-width: 768px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const position = controls.querySelector('.p-brand-story__promise-position');
    const playback = controls.querySelector('.p-brand-story__promise-playback');
    let active = false;
    let current = 0;
    let slides = cards;
    let frame = 0;
    let settleTimer = 0;
    let autoplayTimer = 0;
    let moving = false;
    let pointerDown = false;
    let touching = false;
    let inView = false;
    let paused = false;
    let measuredWidth = 0;

    // Touching the scrollable region also focuses it on mobile browsers.
    // Pause for keyboard focus or an interactive card child, not that touch focus.
    const hasReadingFocus = () => list.matches(':focus-visible') ||
        cards.some((card) => card.contains(document.activeElement));
    const stopAutoplay = () => clearTimeout(autoplayTimer);
    const canAutoplay = () => active && inView && !paused && !moving && !pointerDown &&
        !document.hidden && !reducedMotion.matches && !hasReadingFocus();
    const scheduleAutoplay = () => {
        stopAutoplay();
        if (canAutoplay()) {
            autoplayTimer = setTimeout(() => {
                if (canAutoplay()) moveBy(1);
            }, 4000);
        }
    };
    const updatePlayback = () => {
        playback.disabled = reducedMotion.matches;
        playback.textContent = reducedMotion.matches ? '自動再生なし' : paused ? '再生' : '一時停止';
        playback.setAttribute('aria-pressed', String(paused));
        playback.setAttribute('aria-label', reducedMotion.matches ?
            '動きを減らす設定により自動再生は無効です' :
            paused ? '約束の自動再生を再開' : '約束の自動再生を一時停止');
    };
    const offset = (index) => slides[index].offsetLeft - slides[0].offsetLeft;
    const nearest = () => slides.reduce((best, card, index) =>
        Math.abs(offset(index) - list.scrollLeft) < Math.abs(offset(best) - list.scrollLeft) ? index : best, 0);
    const cancelMotion = () => {
        cancelAnimationFrame(frame);
        moving = false;
        list.classList.remove('is-moving');
    };
    const finish = (visualIndex) => {
        current = (visualIndex - 1 + cards.length) % cards.length;
        // Inert copies make last-to-first advance by one card, without a rewind.
        if (visualIndex === 0 || visualIndex === slides.length - 1) {
            list.classList.add('is-moving');
            list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
        }
        cancelMotion();
        position.textContent = `${current + 1} / ${cards.length}`;
        scheduleAutoplay();
    };
    const moveTo = (visualIndex) => {
        if (!active) return;
        stopAutoplay();
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
        copy.dataset.promiseClone = '';
        copy.inert = true;
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('aria-labelledby');
        copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        return copy;
    };
    const alignCurrent = () => {
        cancelMotion();
        list.classList.add('is-moving');
        list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
        list.classList.remove('is-moving');
    };
    const configure = () => {
        stopAutoplay();
        clearTimeout(settleTimer);
        cancelMotion();
        pointerDown = false;
        touching = false;
        list.querySelectorAll('[data-promise-clone]').forEach((copy) => copy.remove());
        active = mobile.matches;
        controls.hidden = !active;
        if (active) {
            list.tabIndex = 0;
            list.setAttribute('aria-roledescription', 'カルーセル');
            list.prepend(makeCopy(cards.at(-1)));
            list.append(makeCopy(cards[0]));
            slides = [...list.children];
            alignCurrent();
        } else {
            slides = cards;
            list.removeAttribute('tabindex');
            list.removeAttribute('aria-roledescription');
            list.scrollLeft = 0;
        }
        measuredWidth = list.clientWidth;
        position.textContent = `${current + 1} / ${cards.length}`;
        updatePlayback();
        scheduleAutoplay();
        window.ScrollTrigger?.refresh();
    };

    controls.querySelector('.p-brand-story__promise-previous').addEventListener('click', () => moveBy(-1));
    controls.querySelector('.p-brand-story__promise-next').addEventListener('click', () => moveBy(1));
    playback.addEventListener('click', () => {
        paused = !paused;
        updatePlayback();
        if (paused && active) { cancelMotion(); finish(nearest()); }
        else scheduleAutoplay();
    });
    list.addEventListener('keydown', (event) => {
        if (!active || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') moveTo(1);
        else if (event.key === 'End') moveTo(cards.length);
        else moveBy(event.key === 'ArrowRight' ? 1 : -1);
    });
    list.addEventListener('scroll', () => {
        if (!active || moving || Math.abs(list.scrollLeft - offset(current + 1)) < 1) return;
        stopAutoplay();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { if (!pointerDown) finish(nearest()); }, 180);
    }, { passive: true });
    list.addEventListener('pointerdown', () => {
        if (!active) return;
        pointerDown = true;
        stopAutoplay();
        cancelMotion();
    }, { passive: true });
    const release = () => {
        if (!active || !pointerDown || touching) return;
        pointerDown = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => finish(nearest()), 180);
    };
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    // Touch panning cancels pointer events before the finger leaves the screen.
    list.addEventListener('touchstart', () => {
        if (!active) return;
        touching = true;
        pointerDown = true;
        stopAutoplay();
        cancelMotion();
    }, { passive: true });
    const releaseTouch = (event) => {
        if (event.touches.length) return;
        touching = false;
        release();
    };
    window.addEventListener('touchend', releaseTouch, { passive: true });
    window.addEventListener('touchcancel', releaseTouch, { passive: true });
    list.addEventListener('wheel', () => {
        if (!active) return;
        stopAutoplay();
        cancelMotion();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { if (!pointerDown) finish(nearest()); }, 180);
    }, { passive: true });
    list.addEventListener('focusin', () => {
        stopAutoplay();
        if (active && moving) { cancelMotion(); alignCurrent(); }
    });
    list.addEventListener('focusout', () => queueMicrotask(scheduleAutoplay));
    const suspend = () => {
        stopAutoplay();
        if (active && moving) { cancelMotion(); finish(nearest()); }
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.1;
        if (inView) scheduleAutoplay();
        else suspend();
    }, { threshold: [0, 0.1] });
    visibilityObserver.observe(list);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) suspend();
        else scheduleAutoplay();
    });
    mobile.addEventListener('change', configure);
    reducedMotion.addEventListener('change', () => {
        stopAutoplay();
        updatePlayback();
        if (active) { cancelMotion(); alignCurrent(); }
        scheduleAutoplay();
    });
    const resizeObserver = new ResizeObserver(() => {
        if (Math.abs(list.clientWidth - measuredWidth) < 0.5) return;
        measuredWidth = list.clientWidth;
        clearTimeout(settleTimer);
        if (active) alignCurrent();
        scheduleAutoplay();
        window.ScrollTrigger?.refresh();
    });
    resizeObserver.observe(list);
    configure();
})();
