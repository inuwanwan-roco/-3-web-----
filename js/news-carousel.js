// Native swipe and scroll snap with visible-only, interruptible mobile autoplay.
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
    const playback = controls.querySelector('.p-news__playback');
    let active = false;
    let current = 0;
    let slides = cards;
    let frame = 0;
    let settleTimer = 0;
    let moving = false;
    let pointerDown = false;
    let touching = false;
    let autoplayTimer = 0;
    let inView = false;
    let paused = false;
    let expandedCard = null;
    let collapsedHeight = 0;
    let measuredWidth = 0;
    let heightTimer = 0;
    let gesture = null;
    const textMeasure = document.createElement('canvas').getContext('2d');

    const hasCardFocus = () => cards.some((card) => card.contains(document.activeElement) &&
        !card.classList.contains('is-pointer-focus'));
    const stopAutoplay = () => { clearTimeout(autoplayTimer); autoplayTimer = 0; };
    const canAutoplay = () => active && inView && !paused && !moving && !pointerDown &&
        !document.hidden && !reducedMotion.matches && !hasCardFocus() && !expandedCard;
    const scheduleAutoplay = () => {
        stopAutoplay();
        if (canAutoplay()) {
            autoplayTimer = setTimeout(() => {
                autoplayTimer = 0;
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
            paused ? 'ニュースの自動再生を再開' : 'ニュースの自動再生を一時停止');
    };

    // Fit only NEWS copy; preserve a readable 14px minimum and allow extra wrapping.
    const fitTypography = () => {
        list.style.setProperty('--news-title-size', '24px');
        list.style.setProperty('--news-body-size', '16px');
        for (const [selector, property, maximum] of [
            ['.p-news-card__title .p-news-card__line', '--news-title-size', 24],
            [`.p-news-card__copy--${active ? 'mobile' : 'desktop'} .p-news-card__line`, '--news-body-size', 16]
        ]) {
            let size = maximum;
            cards.forEach((card) => {
                const style = getComputedStyle(card);
                const available = card.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                card.querySelectorAll(selector).forEach((line) => {
                    const computed = getComputedStyle(line);
                    textMeasure.font = computed.font;
                    const text = line.textContent;
                    const tracking = (parseFloat(computed.letterSpacing) || 0) * [...text].length;
                    const width = textMeasure.measureText(text).width;
                    size = Math.min(size, (available - tracking - 1) / width * maximum);
                });
            });
            list.style.setProperty(property, `${Math.max(14, Math.floor(size * 100) / 100)}px`);
        }
    };
    const naturalHeight = (card, open) => {
        // Measure a hidden copy so rapid repeated taps never reset an in-flight transition.
        const copy = card.cloneNode(true);
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        copy.classList.toggle('is-expanded', open);
        copy.inert = true;
        copy.setAttribute('aria-hidden', 'true');
        Object.assign(copy.style, {
            position: 'absolute', left: '0', top: '0', visibility: 'hidden',
            width: `${card.getBoundingClientRect().width}px`, height: 'auto',
            minHeight: '0', transition: 'none', transform: 'none'
        });
        list.append(copy);
        const height = copy.getBoundingClientRect().height;
        copy.remove();
        return height;
    };
    const applyHeights = (animate = true) => {
        if (!active) return;
        const targets = slides.map((card) => card === expandedCard ? naturalHeight(card, true) : collapsedHeight);
        if (!animate) {
            list.style.transition = 'none';
            slides.forEach((card) => { card.style.transition = 'none'; });
        }
        slides.forEach((card, index) => { card.style.height = `${targets[index]}px`; });
        const style = getComputedStyle(list);
        const chrome = list.offsetHeight - list.clientHeight;
        list.style.height = `${Math.max(...targets) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + chrome}px`;
        if (!animate) {
            void list.offsetHeight;
            list.style.removeProperty('transition');
            slides.forEach((card) => card.style.removeProperty('transition'));
        }
        clearTimeout(heightTimer);
        heightTimer = setTimeout(() => {
            window.ScrollTrigger?.refresh();
            scheduleAutoplay();
        }, animate && !reducedMotion.matches ? 360 : 0);
    };
    const refreshCards = () => {
        fitTypography();
        measuredWidth = list.clientWidth;
        if (active) {
            collapsedHeight = Math.max(...cards.map((card) => naturalHeight(card, false)));
            applyHeights(false);
        } else {
            list.style.removeProperty('height');
            cards.forEach((card) => card.style.removeProperty('height'));
        }
    };
    const setExpanded = (card, open) => {
        if (!active) return;
        stopAutoplay();
        if (expandedCard && expandedCard !== card) {
            expandedCard.classList.remove('is-expanded');
            expandedCard.setAttribute('aria-expanded', 'false');
        }
        expandedCard = open ? card : null;
        card.classList.toggle('is-expanded', open);
        card.setAttribute('aria-expanded', String(open));
        applyHeights();
    };
    const collapseExpanded = () => {
        if (expandedCard) setExpanded(expandedCard, false);
    };

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
        const next = (visualIndex - 1 + cards.length) % cards.length;
        if (next !== current) collapseExpanded();
        current = next;
        // The inert end copies let the last-to-first transition move one card.
        if (visualIndex === 0 || visualIndex === slides.length - 1) {
            list.classList.add('is-moving');
            list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
        }
        cancelMotion();
        updatePosition();
        scheduleAutoplay();
    };
    const moveTo = (visualIndex) => {
        if (!active) return;
        collapseExpanded();
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
        copy.dataset.newsClone = '';
        copy.inert = true;
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('id');
        copy.removeAttribute('tabindex');
        copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        return copy;
    };
    const configure = () => {
        stopAutoplay();
        pointerDown = false;
        touching = false;
        cancelMotion();
        clearTimeout(settleTimer);
        list.querySelectorAll('[data-news-clone]').forEach((copy) => copy.remove());
        expandedCard = null;
        active = mobile.matches;
        section.classList.toggle('p-news--expandable', active);
        controls.hidden = !active;
        cards.forEach((card) => {
            card.classList.remove('is-expanded', 'is-pointer-focus');
            card.style.removeProperty('height');
            if (active) {
                card.tabIndex = 0;
                card.setAttribute('role', 'button');
                card.setAttribute('aria-expanded', 'false');
                card.setAttribute('aria-controls', card.querySelector('.p-news-card__text').id);
                card.setAttribute('aria-labelledby', card.querySelector('h3').id);
                card.setAttribute('aria-describedby', `${card.querySelector('time').id} ${card.querySelector('.p-news-card__text').id} news-expand-hint`);
            } else {
                ['tabindex', 'role', 'aria-expanded', 'aria-controls', 'aria-labelledby', 'aria-describedby'].forEach((name) => card.removeAttribute(name));
            }
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
        refreshCards();
        updatePosition();
        updatePlayback();
        scheduleAutoplay();
        // The controls change section height; keep existing scroll triggers aligned.
        window.ScrollTrigger?.refresh();
    };

    controls.querySelector('.p-news__previous').addEventListener('click', () => moveBy(-1));
    controls.querySelector('.p-news__next').addEventListener('click', () => moveBy(1));
    list.addEventListener('keydown', (event) => {
        if (!active) return;
        cards.forEach((card) => card.classList.remove('is-pointer-focus'));
        const card = event.target.closest('.p-news-card:not([data-news-clone])');
        if (card && !event.target.closest('a, button, input, textarea, select') && ['Enter', ' '].includes(event.key)) {
            event.preventDefault();
            setExpanded(card, expandedCard !== card);
            return;
        }
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'Home') moveTo(1);
            else if (event.key === 'End') moveTo(cards.length);
            else moveBy(event.key === 'ArrowRight' ? 1 : -1);
        }
    });
    list.addEventListener('scroll', () => {
        if (!active || moving || Math.abs(list.scrollLeft - offset(current + 1)) < 1) return;
        stopAutoplay();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            if (!pointerDown) finish(nearest());
        }, 180);
    }, { passive: true });
    list.addEventListener('pointerdown', (event) => {
        gesture = { x: event.clientX, y: event.clientY, moved: false };
        event.target.closest('.p-news-card')?.classList.add('is-pointer-focus');
        pointerDown = true;
        stopAutoplay();
        cancelMotion();
    }, { passive: true });
    const release = () => {
        if (!pointerDown || touching) return;
        pointerDown = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => finish(nearest()), 180);
    };
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', () => {
        gesture = null;
        release();
    }, { passive: true });
    window.addEventListener('pointermove', (event) => {
        if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) >= 10) gesture.moved = true;
    }, { passive: true });
    list.addEventListener('click', (event) => {
        const card = event.target.closest('.p-news-card:not([data-news-clone])');
        if (!active || !card || event.target.closest('a, button, input, textarea, select')) return;
        const isTap = event.detail === 0 || (gesture && !gesture.moved &&
            Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 10);
        gesture = null;
        if (isTap) setExpanded(card, expandedCard !== card);
    });
    // Native touch panning cancels pointer events before the finger is lifted.
    list.addEventListener('touchstart', () => {
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
        gesture = null;
        stopAutoplay();
        cancelMotion();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { if (active) finish(nearest()); }, 180);
    }, { passive: true });
    list.addEventListener('focusin', () => {
        if (hasCardFocus()) {
            stopAutoplay();
            cancelMotion();
        }
    });
    list.addEventListener('focusout', () => queueMicrotask(() => {
        cards.forEach((card) => {
            if (!card.contains(document.activeElement)) card.classList.remove('is-pointer-focus');
        });
        scheduleAutoplay();
    }));
    playback.addEventListener('click', () => {
        paused = !paused;
        updatePlayback();
        if (paused && active) { cancelMotion(); finish(nearest()); }
        else scheduleAutoplay();
    });
    const suspend = () => {
        stopAutoplay();
        if (active && moving) {
            const index = nearest();
            cancelMotion();
            list.scrollTo({ left: offset(index), behavior: 'instant' });
            finish(index);
        }
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
        if (active) { cancelMotion(); finish(nearest()); }
    });
    const resizeObserver = new ResizeObserver(() => {
        if (Math.abs(list.clientWidth - measuredWidth) < 0.5) return;
        refreshCards();
        if (active) {
            cancelMotion();
            list.classList.add('is-moving');
            list.scrollTo({ left: offset(current + 1), behavior: 'instant' });
            list.classList.remove('is-moving');
        }
        scheduleAutoplay();
    });
    resizeObserver.observe(list);
    configure();
    document.fonts.ready.then(() => {
        refreshCards();
        window.ScrollTrigger?.refresh();
    });
})();
