/* ==========================================================================
   Product card + shared product helpers
   One markup for every breakpoint; desktop/mobile differences live in CSS.
   "Añadir" buttons carry data-add-to-cart="<id>" and are handled by a single
   delegated listener in js/app.js.
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, formatPrice, joinList } = CCC.utils;

  const ROAST_LABELS = { Ligero: "Tostión ligera", Medio: "Tostión media", Oscuro: "Tostión oscura" };

  function productUrl(product) {
    return CCC.url(`pages/producto.html?id=${product.id}`);
  }

  function roastLabel(roast) {
    return ROAST_LABELS[roast] || `Tostión ${roast}`;
  }

  function typesLabel(product) {
    return joinList(product.types).replace(" y ", " o ");
  }

  /** Product image, or a clearly labelled temporary placeholder. */
  function renderProductImage(product, { lazy = true, className = "" } = {}) {
    if (!product.image) {
      return `
        <div class="product-placeholder ${className}" role="img" aria-label="Imagen de ${escapeHtml(product.name)} pendiente">
          ${CCC.icons.render("inventory-2", "product-placeholder__icon")}
          <span class="product-placeholder__text">Imagen próximamente</span>
        </div>`;
    }
    return `<img class="${className}" src="${CCC.url(product.image)}" alt="${escapeHtml(
      `${product.name} (${product.weight}) — ${product.brand}`
    )}" width="900" height="900" ${lazy ? 'loading="lazy" decoding="async"' : 'fetchpriority="high"'}>`;
  }

  function renderProductCard(product) {
    const url = productUrl(product);
    const eyebrow = `${roastLabel(product.roast)} · ${joinList(product.flavors.slice(0, 2))}`;
    return `
      <article class="product-card" data-product-id="${product.id}">
        <a class="product-card__media" href="${url}" tabindex="-1" aria-hidden="true">
          <span class="product-card__badge product-card__badge--${product.badgeTone}">${escapeHtml(product.badge)}</span>
          <span class="roast-dot roast-dot--${product.roast.toLowerCase()}" title="${roastLabel(product.roast)}"></span>
          ${renderProductImage(product, { className: "product-card__image" })}
        </a>
        <div class="product-card__body">
          <p class="product-card__eyebrow">${escapeHtml(eyebrow)}</p>
          <h3 class="product-card__title">
            <a href="${url}">${escapeHtml(product.name)} <span class="product-card__weight">(${escapeHtml(product.weight)})</span></a>
          </h3>
          <p class="product-card__seller"><span class="product-card__seller-prefix">Vendido por: </span>${escapeHtml(product.brand)}</p>
          <p class="product-card__meta">
            <span>${CCC.icons.render("terrain")}${escapeHtml(product.department)}</span>
            <span>${escapeHtml(typesLabel(product))}</span>
          </p>
        </div>
        <div class="product-card__footer">
          <div class="product-card__price-row">
            <p class="product-card__price">${formatPrice(product.price)} <span>COP</span></p>
            <span class="product-card__status" data-status="${CCC.utils.normalizeText(product.status).replace(/\s+/g, "-")}">${escapeHtml(product.status)}</span>
          </div>
          <div class="product-card__actions">
            <a class="btn btn--soft btn--sm product-card__view" href="${url}">Ver producto<span class="visually-hidden">: ${escapeHtml(product.name)}</span></a>
            <button class="btn btn--primary btn--sm product-card__add" type="button" data-add-to-cart="${product.id}">
              ${CCC.icons.render("add-shopping-cart", "product-card__add-icon")}
              ${CCC.icons.render("add", "product-card__add-icon-mobile")}
              <span data-label>Añadir</span><span class="visually-hidden"> ${escapeHtml(product.name)} al carrito</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  CCC.components = CCC.components || {};
  CCC.components.productCard = {
    render: renderProductCard,
    renderImage: renderProductImage,
    productUrl,
    roastLabel,
    typesLabel,
  };
})(window.CCC = window.CCC || {});
