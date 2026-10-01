/* ==========================================================================
   UI primitives
   • overlays: drawers, bottom sheets and menus (focus trap, Esc, backdrop,
     scroll lock, focus restore)
   • toast:    short confirmations ("Producto añadido")
   • reveal:   discreet fade-in of sections on scroll
   ========================================================================== */
(function (CCC) {
  "use strict";

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const TRANSITION_FALLBACK_MS = 420;

  const openStack = [];

  /* ---------------------------------------------------------------- overlays */

  function getFocusable(container) {
    return CCC.utils
      .qsa(FOCUSABLE, container)
      .filter((element) => element.offsetParent !== null || element === document.activeElement);
  }

  function handleKeydown(event) {
    const current = openStack[openStack.length - 1];
    if (!current) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeOverlay(current.element);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusable(current.element);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleCloseClick(event) {
    const current = openStack[openStack.length - 1];
    if (current && event.target.closest("[data-close]")) closeOverlay(current.element);
  }

  /**
   * Opens a drawer/sheet. The element should contain [data-close] elements
   * (backdrop, close button). Options:
   *   trigger      element that opened it (gets aria-expanded + focus back)
   *   initialFocus selector or element to focus first
   *   toggleHidden false for panels that stay in the DOM on desktop
   *   onClose      callback after closing
   */
  function openOverlay(element, options = {}) {
    if (!element || openStack.some((entry) => entry.element === element)) return;
    const entry = {
      element,
      trigger: options.trigger || document.activeElement,
      toggleHidden: options.toggleHidden !== false,
      onClose: options.onClose,
    };
    openStack.push(entry);

    if (entry.toggleHidden) element.hidden = false;
    element.inert = false;
    element.addEventListener("click", handleCloseClick);
    if (entry.trigger && entry.trigger.setAttribute) entry.trigger.setAttribute("aria-expanded", "true");

    document.body.classList.add("is-locked");
    if (openStack.length === 1) document.addEventListener("keydown", handleKeydown);

    requestAnimationFrame(() => {
      element.classList.add("is-open");
      const target =
        (typeof options.initialFocus === "string"
          ? element.querySelector(options.initialFocus)
          : options.initialFocus) || getFocusable(element)[0];
      if (target) target.focus({ preventScroll: true });
    });
  }

  function closeOverlay(element) {
    const index = openStack.findIndex((entry) => entry.element === element);
    if (index === -1) return;
    const [entry] = openStack.splice(index, 1);

    element.classList.remove("is-open");
    element.removeEventListener("click", handleCloseClick);
    if (entry.trigger && entry.trigger.setAttribute) entry.trigger.setAttribute("aria-expanded", "false");

    if (openStack.length === 0) {
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", handleKeydown);
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (element.classList.contains("is-open")) return; /* reopened meanwhile */
      if (entry.toggleHidden) element.hidden = true;
      else element.inert = true;
    };
    element.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, TRANSITION_FALLBACK_MS);

    if (entry.trigger && typeof entry.trigger.focus === "function" && document.contains(entry.trigger)) {
      entry.trigger.focus({ preventScroll: true });
    }
    if (typeof entry.onClose === "function") entry.onClose();
  }

  function isOverlayOpen(element) {
    return openStack.some((entry) => entry.element === element);
  }

  /* ------------------------------------------------------------------- toast */

  let toastTimer;

  function showToast({ title, message, icon = "check-circle" }) {
    const region = document.getElementById("toast-region");
    if (!region) return;
    const { escapeHtml } = CCC.utils;
    region.innerHTML = `
      <div class="toast" role="status">
        ${CCC.icons.render(icon, "toast__icon")}
        <div>
          <p class="toast__title">${escapeHtml(title)}</p>
          ${message ? `<p class="toast__message">${escapeHtml(message)}</p>` : ""}
        </div>
      </div>`;
    const toast = region.firstElementChild;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ------------------------------------------------------------------ reveal */

  let revealObserver = null;

  function observeReveal(scope) {
    const elements = CCC.utils.qsa(".reveal:not(.is-visible)", scope);
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    elements.forEach((element) => revealObserver.observe(element));
  }

  /* -------------------------------------------------------- small helpers */

  /** Smooth-scrolls to an element, honouring the sticky header offset. */
  function scrollToElement(element) {
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  CCC.ui = {
    openOverlay,
    closeOverlay,
    isOverlayOpen,
    showToast,
    observeReveal,
    scrollToElement,
  };
})(window.CCC = window.CCC || {});
