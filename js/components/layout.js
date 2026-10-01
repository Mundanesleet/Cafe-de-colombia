/* ==========================================================================
   Layout — header, mobile menu, footer and global overlay containers.
   Rendered once per page into:
     <div data-component="header"></div>  and  <div data-component="footer"></div>
   so the chrome is defined in a single place for every page.
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, qs, qsa, debounce } = CCC.utils;
  const icon = (name, className) => CCC.icons.render(name, className);

  const isHome = () => document.body.dataset.page === "home";

  /** Same-page anchor on the home page, absolute link from inner pages. */
  function homeLink(hash = "") {
    return isHome() ? hash || "#top" : CCC.url(`index.html${hash}`);
  }

  function getNavigation() {
    return {
      primary: [
        { id: "catalogo", label: "Compra aquí", href: homeLink("#catalogo") },
        { id: "colombia-cafetera", label: "Colombia Cafetera", href: homeLink("#colombia-cafetera") },
        {
          id: "acerca",
          label: "Acerca de",
          children: [
            { label: "Sabores", href: homeLink("#sabores") },
            { label: "Tostiones", href: homeLink("#tostiones") },
            { label: "Preparación", href: homeLink("#preparacion") },
            { label: "Molienda", href: CCC.url("pages/blog.html?id=guia-molienda") },
            { label: "Atributos", href: homeLink("#historia-del-cafe") },
          ],
        },
        { id: "coleccion-cafetera", label: "Colección Cafetera", href: homeLink("#coleccion-cafetera"), badge: "Curaduría" },
        { id: "historias", label: "Blog", href: homeLink("#historias") },
      ],
      footer: [
        {
          title: "Compra",
          links: [
            { label: "Todos los cafés", href: homeLink("#catalogo") },
            { label: "Colección Cafetera", href: homeLink("#coleccion-cafetera") },
            { label: "Buscar por sabor", href: homeLink("#sabores") },
            { label: "Buscar por origen", href: homeLink("#colombia-cafetera") },
            { label: "Descuentos & Kits", href: homeLink("#coleccion-cafetera") },
          ],
        },
        {
          title: "Conoce el café",
          links: [
            { label: "Colombia Cafetera", href: homeLink("#colombia-cafetera") },
            { label: "Sabores", href: homeLink("#sabores") },
            { label: "Tostiones", href: homeLink("#tostiones") },
            { label: "Preparación", href: homeLink("#preparacion") },
            { label: "Molienda", href: CCC.url("pages/blog.html?id=guia-molienda") },
            { label: "Atributos", href: homeLink("#historia-del-cafe") },
          ],
        },
        {
          title: "Ayuda & Soporte",
          links: [
            { label: "Preguntas frecuentes", href: CCC.url("pages/informacion.html#preguntas-frecuentes") },
            { label: "Contacto", href: CCC.url("pages/informacion.html#contacto") },
            { label: "Términos y condiciones", href: CCC.url("pages/informacion.html#terminos") },
            { label: "Política de cambios", href: CCC.url("pages/informacion.html#cambios") },
            { label: "Envíos Almacafé", href: CCC.url("pages/informacion.html#envios") },
          ],
        },
      ],
    };
  }

  const LOGO_ALT = "Compro Café de Colombia · Federación Nacional de Cafeteros de Colombia";

  /* ------------------------------------------------------------------ header */

  function renderPrimaryNav(items) {
    return items
      .map((item) => {
        if (item.children) {
          return `
            <li class="nav-dropdown">
              <button class="primary-nav__link nav-dropdown__toggle" type="button" aria-expanded="false" aria-controls="nav-${item.id}">
                ${escapeHtml(item.label)} ${icon("expand-more", "nav-dropdown__chevron")}
              </button>
              <ul class="nav-dropdown__menu" id="nav-${item.id}">
                ${item.children
                  .map((child) => `<li><a class="nav-dropdown__link" href="${child.href}">${escapeHtml(child.label)}</a></li>`)
                  .join("")}
              </ul>
            </li>`;
        }
        return `
          <li class="${item.badge ? "primary-nav__item--badge" : ""}">
            <a class="primary-nav__link" href="${item.href}" data-nav="${item.id}">${escapeHtml(item.label)}</a>
            ${item.badge ? `<span class="pill-badge">${escapeHtml(item.badge)}</span>` : ""}
          </li>`;
      })
      .join("");
  }

  function renderHeader() {
    const nav = getNavigation();
    return `
      <a class="skip-link" href="#main">Saltar al contenido</a>
      <header class="site-header" id="site-header">
        <div class="announcement">
          <p class="announcement__text">
            <span class="announcement__dot" aria-hidden="true"></span>
            <span class="announcement__full">Café 100% de origen colombiano certificado · Apoyando a más de 548.000 familias caficultoras</span>
            <span class="announcement__short">Café 100% de origen colombiano certificado · FNC</span>
          </p>
        </div>
        <div class="header-main">
          <div class="container header-main__inner">
            <a class="brand" href="${homeLink("#top")}" aria-label="Compro Café de Colombia — inicio">
              <img class="brand__logo" src="${CCC.url("assets/logos/compro-cafe-colombia-fnc.png")}" alt="${LOGO_ALT}" width="1176" height="243">
            </a>
            <nav class="primary-nav" aria-label="Principal">
              <ul class="primary-nav__list">${renderPrimaryNav(nav.primary)}</ul>
            </nav>
            <div class="header-actions">
              <form class="header-search" role="search" data-search-form>
                <label class="visually-hidden" for="header-search-input">Buscar cafés</label>
                ${icon("search", "header-search__icon")}
                <input class="header-search__input" id="header-search-input" type="search" name="q" placeholder="Buscar café, marca..." autocomplete="off" enterkeyhint="search" data-search-input>
              </form>
              <button class="icon-btn search-toggle" type="button" aria-label="Buscar cafés" aria-expanded="false" aria-controls="mobile-search" data-search-toggle>
                ${icon("search")}
              </button>
              <button class="account-link" type="button" data-account>
                ${icon("account-circle")}<span class="account-link__label">Mi cuenta</span>
              </button>
              <button class="icon-btn cart-btn" type="button" aria-label="Abrir carrito de compras" aria-controls="cart-drawer" aria-expanded="false" data-cart-open>
                ${icon("shopping-bag")}
                <span class="cart-badge" data-cart-count aria-hidden="true">0</span>
              </button>
              <button class="icon-btn menu-toggle" type="button" aria-label="Abrir menú de navegación" aria-controls="mobile-menu" aria-expanded="false" data-menu-open>
                ${icon("menu")}
              </button>
            </div>
          </div>
          <div class="mobile-search" id="mobile-search" hidden>
            <form class="container mobile-search__form" role="search" data-search-form>
              <label class="visually-hidden" for="mobile-search-input">Buscar cafés</label>
              ${icon("search", "mobile-search__icon")}
              <input class="mobile-search__input" id="mobile-search-input" type="search" name="q" placeholder="Busca por marca, región, sabor..." autocomplete="off" enterkeyhint="search" data-search-input>
            </form>
          </div>
        </div>
      </header>`;
  }

  /* ------------------------------------------------------------- mobile menu */

  function renderMobileMenu(productCount) {
    const about = getNavigation().primary.find((item) => item.children).children;
    return `
      <div class="drawer drawer--right menu-drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú de navegación" hidden>
        <div class="drawer__backdrop" data-close></div>
        <div class="drawer__panel">
          <div class="menu-drawer__head">
            <span class="menu-drawer__title">Menú oficial</span>
            <button class="icon-btn" type="button" aria-label="Cerrar menú" data-close>${icon("close")}</button>
          </div>
          <nav class="menu-drawer__nav" aria-label="Menú móvil">
            <a class="menu-drawer__link menu-drawer__link--accent" href="${homeLink("#catalogo")}" data-close>
              <span>Compra Aquí (Catálogo)</span>
              <span class="menu-drawer__count">${productCount}</span>
            </a>
            <a class="menu-drawer__link" href="${homeLink("#colombia-cafetera")}" data-close>Colombia Cafetera</a>
            <a class="menu-drawer__link" href="${homeLink("#coleccion-cafetera")}" data-close>
              <span>Colección Cafetera</span><span class="pill-badge">Curaduría</span>
            </a>
            <hr class="menu-drawer__divider">
            <p class="menu-drawer__label">Conocimiento del café</p>
            ${about
              .map((link) => `<a class="menu-drawer__sublink" href="${link.href}" data-close>${escapeHtml(link.label)}</a>`)
              .join("")}
            <hr class="menu-drawer__divider">
            <a class="menu-drawer__link" href="${homeLink("#historias")}" data-close>Blog &amp; Historias del Café</a>
            <button class="menu-drawer__link" type="button" data-account data-close>
              <span class="menu-drawer__with-icon">${icon("account-circle")}Mi Cuenta / Pedidos</span>
            </button>
          </nav>
          <p class="menu-drawer__foot">Garantía y respaldo de la Federación Nacional de Cafeteros de Colombia.</p>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------- cart drawer */

  function renderCartDrawer() {
    return `
      <div class="drawer drawer--right cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" hidden>
        <div class="drawer__backdrop" data-close></div>
        <div class="drawer__panel">
          <div class="cart-drawer__head">
            <div>
              <p class="cart-drawer__eyebrow">Compra directa · Despacho Almacafé</p>
              <h2 class="cart-drawer__title" id="cart-drawer-title">Tu carrito <span data-cart-heading-count></span></h2>
            </div>
            <button class="icon-btn" type="button" aria-label="Cerrar carrito" data-close>${icon("close")}</button>
          </div>
          <div class="cart-drawer__body" data-cart-items></div>
          <div class="cart-drawer__footer" data-cart-summary></div>
        </div>
      </div>
      <div class="toast-region" id="toast-region" aria-live="polite" aria-atomic="true"></div>`;
  }

  /* ------------------------------------------------------------------ footer */

  function renderFooter() {
    const year = new Date().getFullYear();
    const columns = getNavigation()
      .footer.map(
        (column) => `
          <details class="footer-col" open>
            <summary class="footer-col__title">${escapeHtml(column.title)}${icon("expand-more", "footer-col__chevron")}</summary>
            <ul class="footer-col__list">
              ${column.links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("")}
            </ul>
          </details>`
      )
      .join("");

    return `
      <footer class="site-footer">
        <div class="container site-footer__grid">
          <div class="footer-brand">
            <div class="footer-brand__logo-row">
              <img class="footer-brand__logo" src="${CCC.url("assets/logos/compro-cafe-colombia-fnc.png")}" alt="${LOGO_ALT}" width="1176" height="243" loading="lazy">
              <span class="footer-brand__name">Café de Colombia</span>
            </div>
            <p class="footer-brand__text">Compro Café de Colombia con respaldo institucional de la Federación Nacional de Cafeteros de Colombia. Sello oficial de Denominación de Origen 100% Café de Colombia.</p>
            <p class="footer-brand__seal">${icon("verified")}<span>548.000 Familias Caficultoras en 22 departamentos</span></p>
          </div>
          ${columns}
        </div>
        <div class="container site-footer__bottom">
          <p>© ${year} Federación Nacional de Cafeteros de Colombia · Compro Café de Colombia. Todos los derechos reservados.</p>
          <div class="site-footer__meta">
            <p class="site-footer__secure">${icon("lock")}<span>Pagos seguros PSE / ePayco</span></p>
            <ul class="payment-badges" aria-label="Medios de pago">
              <li>PSE</li><li>ePayco</li><li>Tarjetas de Crédito</li>
            </ul>
            <div class="site-footer__social">
              <button class="icon-btn" type="button" aria-label="Instagram" data-social>${icon("photo-camera")}</button>
              <button class="icon-btn" type="button" aria-label="Canal de video" data-social>${icon("play-circle")}</button>
              <button class="icon-btn" type="button" aria-label="Compartir esta página" data-share>${icon("share")}</button>
            </div>
          </div>
        </div>
      </footer>`;
  }

  /* --------------------------------------------------------------- behaviour */

  /** Publishes the sticky header height as --header-h (used for anchor offsets). */
  function updateHeaderHeight() {
    const header = document.getElementById("site-header");
    if (!header) return;
    /* On mobile the announcement bar scrolls away (negative sticky top). */
    const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
    document.documentElement.style.setProperty("--header-h", `${header.offsetHeight + Math.min(0, stickyTop)}px`);
  }

  function syncHeaderHeight() {
    updateHeaderHeight();
    window.addEventListener("resize", debounce(updateHeaderHeight, 150));
  }

  function bindDropdowns() {
    qsa(".nav-dropdown").forEach((dropdown) => {
      const toggle = qs(".nav-dropdown__toggle", dropdown);
      const setOpen = (open) => {
        dropdown.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      };
      toggle.addEventListener("click", () => setOpen(!dropdown.classList.contains("is-open")));
      dropdown.addEventListener("mouseenter", () => setOpen(true));
      dropdown.addEventListener("mouseleave", () => setOpen(false));
      dropdown.addEventListener("focusout", (event) => {
        if (!dropdown.contains(event.relatedTarget)) setOpen(false);
      });
      dropdown.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          setOpen(false);
          toggle.focus();
        }
      });
      qsa("a", dropdown).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    });
  }

  function bindMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const trigger = qs("[data-menu-open]");
    trigger.addEventListener("click", () => CCC.ui.openOverlay(menu, { trigger }));
  }

  function bindSearch() {
    const inputs = qsa("[data-search-input]");
    const toggle = qs("[data-search-toggle]");
    const panel = document.getElementById("mobile-search");

    toggle.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      updateHeaderHeight();
      if (willOpen) qs("input", panel).focus();
    });

    const emit = (query, submit) =>
      window.dispatchEvent(new CustomEvent("catalog:search", { detail: { query, submit } }));
    const emitDebounced = debounce(emit, 220);

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        inputs.forEach((other) => {
          if (other !== input) other.value = input.value;
        });
        if (isHome()) emitDebounced(input.value.trim(), false);
      });
    });

    qsa("[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = qs("input", form).value.trim();
        if (isHome()) {
          emit(query, true);
          qs("input", form).blur();
        } else {
          window.location.href = CCC.url(`index.html${query ? `?q=${encodeURIComponent(query)}` : ""}#catalogo`);
        }
      });
    });
  }

  function setSearchValue(value) {
    qsa("[data-search-input]").forEach((input) => {
      input.value = value;
    });
  }

  function bindFooterAccordions() {
    const desktop = window.matchMedia("(min-width: 768px)");
    const details = qsa(".footer-col");
    const apply = () =>
      details.forEach((item) => {
        item.open = desktop.matches;
      });
    apply();
    desktop.addEventListener("change", apply);
    details.forEach((item) =>
      qs("summary", item).addEventListener("click", (event) => {
        if (desktop.matches) event.preventDefault();
      })
    );
  }

  function bindPlaceholders() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-account]")) {
        CCC.ui.showToast({
          title: "Mi cuenta",
          message: "El inicio de sesión y el historial de pedidos llegarán en la siguiente fase del proyecto.",
          icon: "info",
        });
      } else if (event.target.closest("[data-social]")) {
        CCC.ui.showToast({
          title: "Redes sociales",
          message: "Los enlaces oficiales se conectarán cuando el cliente los confirme.",
          icon: "info",
        });
      } else if (event.target.closest("[data-share]")) {
        sharePage();
      }
    });
  }

  async function sharePage() {
    const data = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      CCC.ui.showToast({ title: "Enlace copiado", message: "Ya puedes compartir esta página." });
    } catch (error) {
      /* User cancelled the share sheet: nothing to do. */
    }
  }

  /** Highlights the nav item of the section in view (home page only). */
  function bindScrollSpy() {
    if (!isHome() || !("IntersectionObserver" in window)) return;
    const links = qsa(".primary-nav__link[data-nav]");
    const sections = links.map((link) => document.getElementById(link.dataset.nav)).filter(Boolean);
    const setActive = (id) =>
      links.forEach((link) => {
        const active = link.dataset.nav === id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    setActive("catalogo");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  function mount({ productCount }) {
    const headerSlot = qs('[data-component="header"]');
    const footerSlot = qs('[data-component="footer"]');
    if (headerSlot) headerSlot.outerHTML = renderHeader();
    if (footerSlot) footerSlot.outerHTML = renderFooter();
    document.body.insertAdjacentHTML("beforeend", renderMobileMenu(productCount) + renderCartDrawer());

    syncHeaderHeight();
    bindDropdowns();
    bindMobileMenu();
    bindSearch();
    bindFooterAccordions();
    bindPlaceholders();
    bindScrollSpy();
  }

  CCC.components = CCC.components || {};
  CCC.components.layout = { mount, homeLink, setSearchValue, isHome };
})(window.CCC = window.CCC || {});
