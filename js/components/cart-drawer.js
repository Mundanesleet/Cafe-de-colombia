/* ==========================================================================
   Cart drawer — renders CCC.cartService state; never stores state itself.
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, formatPrice, qs, qsa, pluralize } = CCC.utils;
  const icon = (name, className) => CCC.icons.render(name, className);

  let drawer;

  function renderLine(item) {
    const url = CCC.url(`pages/producto.html?id=${item.productId}`);
    const media = item.image
      ? `<img src="${CCC.url(item.image)}" alt="" width="80" height="80" loading="lazy">`
      : `<span class="cart-line__placeholder">${icon("inventory-2")}</span>`;
    return `
      <li class="cart-line" data-line-id="${escapeHtml(item.lineId)}">
        <a class="cart-line__media" href="${url}" tabindex="-1" aria-hidden="true">${media}</a>
        <div class="cart-line__info">
          <a class="cart-line__name" href="${url}">${escapeHtml(item.name)}</a>
          <p class="cart-line__detail">${escapeHtml(item.weight)} · ${escapeHtml(item.grind)}</p>
          <p class="cart-line__unit">${formatPrice(item.price)} c/u</p>
          <div class="cart-line__controls">
            <div class="qty-stepper qty-stepper--sm" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
              <button type="button" data-cart-action="decrease" aria-label="Disminuir cantidad">${icon("remove")}</button>
              <output aria-live="polite">${item.quantity}</output>
              <button type="button" data-cart-action="increase" aria-label="Aumentar cantidad" ${
                item.quantity >= CCC.cartService.MAX_QUANTITY ? "disabled" : ""
              }>${icon("add")}</button>
            </div>
            <button class="cart-line__remove" type="button" data-cart-action="remove">
              ${icon("delete")}<span>Eliminar</span><span class="visually-hidden"> ${escapeHtml(item.name)}</span>
            </button>
          </div>
        </div>
        <p class="cart-line__total">${formatPrice(item.total)}</p>
      </li>`;
  }

  function renderEmpty() {
    return `
      <div class="cart-empty">
        <span class="cart-empty__icon">${icon("shopping-bag")}</span>
        <p class="cart-empty__title">Tu carrito está vacío</p>
        <p class="cart-empty__text">Explora cafés de diferentes regiones, perfiles y tostiones.</p>
        <a class="btn btn--primary" href="${CCC.components.layout.homeLink("#catalogo")}" data-close>Explorar cafés</a>
      </div>`;
  }

  function renderSummary(cart) {
    return `
      <dl class="cart-summary">
        <div><dt>Subtotal (${pluralize(cart.count, "producto", "productos")})</dt><dd>${formatPrice(cart.subtotal)}</dd></div>
        <div><dt>Envío</dt><dd class="cart-summary__note">Se calcula al finalizar</dd></div>
        <div class="cart-summary__total"><dt>Total</dt><dd>${formatPrice(cart.total)} <span>COP</span></dd></div>
      </dl>
      <button class="btn btn--primary btn--block" type="button" data-checkout>
        ${icon("lock")} Finalizar compra
      </button>
      <button class="btn btn--soft btn--block" type="button" data-close>Seguir comprando</button>
      <p class="cart-summary__secure">Pago 100% seguro a través de ePayco: tarjeta de crédito, débito o PSE.</p>`;
  }

  function render(cart) {
    qsa("[data-cart-count]").forEach((badge) => {
      badge.textContent = cart.count > 99 ? "99+" : String(cart.count);
      badge.classList.toggle("is-empty", cart.count === 0);
    });
    qsa("[data-cart-open]").forEach((button) =>
      button.setAttribute(
        "aria-label",
        cart.count ? `Abrir carrito de compras (${pluralize(cart.count, "producto", "productos")})` : "Abrir carrito de compras, vacío"
      )
    );

    if (!drawer) return;
    qs("[data-cart-heading-count]", drawer).textContent = cart.count ? `(${cart.count})` : "";
    qs("[data-cart-items]", drawer).innerHTML = cart.items.length
      ? `<ul class="cart-lines">${cart.items.map(renderLine).join("")}</ul>`
      : renderEmpty();
    const summary = qs("[data-cart-summary]", drawer);
    summary.hidden = cart.items.length === 0;
    summary.innerHTML = cart.items.length ? renderSummary(cart) : "";
  }

  function handleAction(event) {
    const button = event.target.closest("[data-cart-action]");
    if (button) {
      const line = button.closest("[data-line-id]");
      const lineId = line.dataset.lineId;
      const item = CCC.cartService.getCart().items.find((entry) => entry.lineId === lineId);
      if (!item) return;
      const action = button.dataset.cartAction;
      if (action === "increase") CCC.cartService.updateQuantity(lineId, item.quantity + 1);
      if (action === "decrease") CCC.cartService.updateQuantity(lineId, item.quantity - 1);
      if (action === "remove") {
        CCC.cartService.removeFromCart(lineId);
        CCC.ui.showToast({ title: "Producto eliminado", message: `${item.name} salió de tu carrito.`, icon: "delete" });
      }
      /* Keep keyboard focus inside the drawer after the list re-renders. */
      const sameLine = qs(`[data-line-id="${CSS.escape(lineId)}"] [data-cart-action="${action}"]`, drawer);
      (sameLine && !sameLine.disabled ? sameLine : qs(".cart-drawer__head [data-close]", drawer)).focus();
      return;
    }
    if (event.target.closest("[data-checkout]")) {
      CCC.ui.showToast({
        title: "Checkout en construcción",
        message: "El pago con ePayco / PSE se conectará en la fase de backend. Tu carrito queda guardado.",
        icon: "info",
      });
    }
  }

  function open(trigger) {
    CCC.ui.openOverlay(drawer, { trigger });
  }

  function mount() {
    drawer = document.getElementById("cart-drawer");
    drawer.addEventListener("click", handleAction);
    qsa("[data-cart-open]").forEach((button) => button.addEventListener("click", () => open(button)));
    window.addEventListener("cart:change", (event) => render(event.detail));
    render(CCC.cartService.getCart());
  }

  CCC.components = CCC.components || {};
  CCC.components.cartDrawer = { mount, open };
})(window.CCC = window.CCC || {});
