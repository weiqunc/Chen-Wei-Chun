"use strict";

function initNavigation() {
    const menu = document.querySelector(".menu");
    const navigation = document.getElementById("primary-navigation");
    if (!menu || !navigation) return;

    const menuLabel = menu.querySelector(".visually-hidden");
    const mobileLayout = window.matchMedia("(max-width: 760px)");
    const links = [...navigation.querySelectorAll("a[href^='#']")];
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    const header = document.querySelector(".site-header");
    let lastInteractionTarget = document.activeElement;
    let manualTarget = null;
    let manualSettled = false;
    let settledScrollY = window.scrollY;
    let settleTimer;
    let updateQueued = false;

    // Browsers can blur a hidden control before firing the media-query change.
    document.addEventListener("focusin", event => { lastInteractionTarget = event.target; });
    document.addEventListener("pointerdown", event => { lastInteractionTarget = event.target; });

    function setMenuOpen(open) {
        menu.setAttribute("aria-expanded", String(open));
        navigation.classList.toggle("is-open", open);
        if (menuLabel) menuLabel.textContent = open ? "Close menu" : "Open menu";
    }

    function setCurrentSection(id) {
        for (const link of links) {
            if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        }
    }

    function updateCurrentSection() {
        if (manualTarget || sections.length === 0) return;
        const readingLine = (header?.getBoundingClientRect().bottom || 0) + 32;
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= readingLine) current = section;
        }
        if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
            current = sections[sections.length - 1];
        }
        setCurrentSection(current.id);
    }

    function queueCurrentUpdate() {
        if (updateQueued) return;
        updateQueued = true;
        requestAnimationFrame(() => {
            updateQueued = false;
            updateCurrentSection();
        });
    }

    function releaseManualSelection() {
        manualTarget = null;
        manualSettled = false;
        clearTimeout(settleTimer);
        queueCurrentUpdate();
    }

    function markManualSelection(id) {
        if (!sections.some(section => section.id === id)) return;
        manualTarget = id;
        manualSettled = false;
        setCurrentSection(id);
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            manualSettled = true;
            settledScrollY = window.scrollY;
        }, 400);
    }

    menu.addEventListener("click", () => setMenuOpen(menu.getAttribute("aria-expanded") !== "true"));
    navigation.addEventListener("click", event => {
        if (event.target.closest("a")) setMenuOpen(false);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menu.focus();
        }
        const controlHandlesKeys = event.target.closest("input, select, textarea, button, [contenteditable='true']");
        if (!controlHandlesKeys && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
            releaseManualSelection();
        }
    });

    document.addEventListener("click", event => {
        if (!navigation.contains(event.target) && !menu.contains(event.target)) setMenuOpen(false);
        const link = event.target.closest("a[href^='#']");
        if (link && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            markManualSelection(link.hash.slice(1));
        }
    });

    mobileLayout.addEventListener("change", () => {
        const focusedElement = document.activeElement === document.body
            ? lastInteractionTarget : document.activeElement;
        const menuHadFocus = menu.contains(focusedElement);
        const navigationHadFocus = navigation.contains(focusedElement);
        setMenuOpen(false);
        if (mobileLayout.matches && navigationHadFocus) menu.focus();
        else if (!mobileLayout.matches && menuHadFocus) links[0]?.focus();
    });

    window.addEventListener("hashchange", () => {
        const id = window.location.hash.slice(1);
        if (sections.some(section => section.id === id)) markManualSelection(id);
        else releaseManualSelection();
    });
    window.addEventListener("scroll", () => {
        if (manualTarget && manualSettled && Math.abs(window.scrollY - settledScrollY) > 2) {
            releaseManualSelection();
        } else if (manualTarget && !manualSettled) {
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
                manualSettled = true;
                settledScrollY = window.scrollY;
            }, 140);
        }
        queueCurrentUpdate();
    }, { passive: true });
    const releaseOnScrollGesture = event => {
        if (!event.target.closest("input, select, textarea")) releaseManualSelection();
    };
    window.addEventListener("wheel", releaseOnScrollGesture, { passive: true });
    window.addEventListener("touchmove", releaseOnScrollGesture, { passive: true });
    window.addEventListener("resize", queueCurrentUpdate);
    if (typeof window.IntersectionObserver === "function") {
        const observer = new IntersectionObserver(queueCurrentUpdate, { threshold: [0, 0.1, 0.5, 1] });
        for (const section of sections) observer.observe(section);
    }

    menu.hidden = false;
    document.documentElement.classList.add("js");
    markManualSelection(window.location.hash.slice(1));
    queueCurrentUpdate();
}

function initTheme() {
    const selector = document.getElementById("theme-select");
    if (!selector) return;
    const storageKey = "chenwei-theme";
    const themes = ["system", "light", "dark"];
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    let preference = "system";
    try {
        const saved = localStorage.getItem(storageKey);
        if (themes.includes(saved)) preference = saved;
    } catch { /* The theme still works when storage is unavailable. */ }

    function applyTheme() {
        document.documentElement.dataset.theme = preference;
        selector.value = preference;
        const dark = preference === "dark" || (preference === "system" && systemTheme.matches);
        themeColor?.setAttribute("content", dark ? "#242424" : "#202020");
    }

    selector.addEventListener("change", () => {
        preference = themes.includes(selector.value) ? selector.value : "system";
        applyTheme();
        try { localStorage.setItem(storageKey, preference); } catch { /* Keep the in-memory preference. */ }
    });
    window.addEventListener("storage", event => {
        if (event.key !== storageKey && event.key !== null) return;
        preference = themes.includes(event.newValue) ? event.newValue : "system";
        applyTheme();
    });
    systemTheme.addEventListener("change", applyTheme);
    applyTheme();
    selector.hidden = false;
}

function initEmailCopy() {
    const button = document.querySelector(".copy-email");
    const emailLink = document.querySelector(".email");
    const status = document.getElementById("copy-status");
    const fallback = document.querySelector(".copy-fallback");
    const input = document.getElementById("email-to-copy");
    if (!button || !emailLink || !status || !fallback || !input) return;
    const email = emailLink.textContent.trim();
    input.value = email;
    input.addEventListener("click", () => input.select());

    button.addEventListener("click", async () => {
        const buttonHadFocus = document.activeElement === button;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(email);
            fallback.hidden = true;
            status.textContent = "Email address copied.";
        } catch {
            fallback.hidden = false;
            input.focus();
            input.select();
            status.textContent = "Email selected. Press Ctrl+C or ⌘C to copy, or touch and hold on mobile.";
        } finally {
            button.disabled = false;
            button.removeAttribute("aria-busy");
            if (buttonHadFocus && document.activeElement === document.body) button.focus({ preventScroll: true });
        }
    });
    button.hidden = false;
}

initNavigation();
initTheme();
initEmailCopy();
