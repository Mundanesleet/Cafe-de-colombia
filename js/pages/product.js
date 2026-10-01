/* ==========================================================================
   Product page controller — pages/producto.html?id=<productId>
   Loads the product through CCC.productService.getProductById, so it works the
   same once the data comes from an API.
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, formatPrice, qs, joinList } = CCC.utils;
  const card = CCC.components.productCard;
  const icon = (name, className) => CCC.icons.render(name, className);

  function grindOptions(product) {
    return product.types.flatMap((type) => CCC.data.taxonomy.grinds[type] || [type]);
  }

  function catalogLink(param, value) {
    return CCC.url(`index.html?${param}=${encodeURIComponent(value)}#catalogo`);
  }

  function renderDetail(product) {
    const grinds = grindOptions(product);
    const roastName = card.roastLabel(product.roast).replace("Tostión ", "");
    const roastLabelText = roastName.charAt(0).toUpperCase() + roastName.slice(1);

    return `
      <article class="pd" data-product-id="${product.id}">
        <div class="pd__media">
          <span class="product-card__badge product-card__badge--${product.badgeTone}">${escapeHtml(product.badge)}</span>
          <span class="roast-dot roast-dot--${product.roast.toLowerCase()}" title="${card.roastLabel(product.roast)}"></span>
          ${card.renderImage(product, { lazy: false, className: "pd__image" })}
        </div>

        <div class="pd__info">
          <p class="pd__eyebrow">${escapeHtml(product.department)} · ${card.roastLabel(product.roast)}</p>
          <h1 class="pd__title">${escapeHtml(product.name)} <span class="pd__weight">(${escapeHtml(product.weight)})</span></h1>
          <p class="pd__seller">Vendido por: <strong>${escapeHtml(product.brand)}</strong></p>

          <div class="pd__price-row">
            <p class="pd__price">${formatPrice(product.price)} <span>COP</span></p>
            <span class="pd__status">${icon("check-circle")}${escapeHtml(product.status)}</span>
          </div>

          <p class="pd__notes">“${escapeHtml(product.notes)}”</p>

          <dl class="pd__specs">
            <div><dt>Origen</dt><dd><a href="${catalogLink("departamento", product.department)}">${escapeHtml(product.department)}</a></dd></div>
            <div><dt>Tostión</dt><dd>${escapeHtml(roastLabelText)}</dd></div>
            <div><dt>Presentación</dt><dd>${escapeHtml(product.weight)}</dd></div>
            <div><dt>Tipología</dt><dd>${escapeHtml(card.typesLabel(product))}</dd></div>
            <div class="pd__specs-wide">
              <dt>Perfil de sabor</dt>
              <dd class="pd__flavors">
                ${product.flavors
                  .map((flavor) => `<a class="pd__flavor" href="${catalogLink("sabor", flavor)}">${escapeHtml(flavor)}</a>`)
                  .join("")}
              </dd>
            </div>
          </dl>

          <form class="pd__buy" data-buy-form>
            <fieldset class="pd__grind">
              <legend class="pd__label">Selecciona molienda</legend>
              <div class="grind-options">
                ${grinds
                  .map(
                    (grind, index) => `
                      <label class="grind-option">
                        <input type="radio" name="grind" value="${escapeHtml(grind)}" ${index === 0 ? "checked" : ""}>
                        <span>${escapeHtml(grind)}</span>
                      </label>`
                  )
                  .join("")}
              </div>
            </fieldset>

            <div class="pd__buy-row">
              <div class="qty-stepper" role="group" aria-label="Cantidad">
                <button type="button" data-qty="-1" aria-label="Disminuir cantidad">${icon("remove")}</button>
                <input type="number" inputmode="numeric" min="1" max="${CCC.cartService.MAX_QUANTITY}" value="1" aria-label="Cantidad" data-qty-input>
                <button type="button" data-qty="1" aria-label="Aumentar cantidad">${icon("add")}</button>
              </div>
              <button class="btn btn--primary pd__add" type="submit">
                ${icon("add-shopping-cart")}<span data-label>Añadir al carrito</span>
              </button>
            </div>
            <p class="pd__subtotal">Subtotal: <strong data-subtotal>${formatPrice(product.price)} COP</strong></p>
          </form>

          <dl class="pd__dispatch">
            <div><dt>Centro de despacho</dt><dd class="pd__dispatch-accent">Almacafé Soacha, Cundinamarca</dd></div>
            <div><dt>Garantía FNC</dt><dd>100% Café Suave Lavado de Colombia</dd></div>
            <div><dt>Pago</dt><dd>ePayco · Tarjeta de crédito, débito o PSE</dd></div>
          </dl>
        </div>
      </article>

      <section class="pd-extra" aria-label="Más información del producto">
        <div class="pd-extra__block">
          <h2 class="pd-extra__title">Descripción</h2>
          <p class="pd-extra__text">${escapeHtml(product.description)}</p>
          ${
            product.demoAttributes
              ? `<p class="demo-note">${icon("info")}<span>Origen, perfil sensorial y descripción son datos de demostración, pendientes de validar con ${escapeHtml(product.brand)}.</span></p>`
              : ""
          }
        </div>
        <div class="pd-extra__block">
          <h2 class="pd-extra__title">Preparación recomendada</h2>
          <p class="pd-extra__text">Métodos con los que este café expresa mejor su perfil de ${escapeHtml(joinList(product.flavors).toLowerCase())}.</p>
          <div class="pd-extra__methods">
            ${product.methods
              .map((method) => `<a class="chip" href="${catalogLink("preparacion", method)}">${escapeHtml(method)}</a>`)
              .join("")}
          </div>
        </div>
      </section>`;
  }

  function renderNotFound() {
    return `
      <div class="empty-state pd-missing">
        <span class="empty-state__icon">${icon("search")}</span>
        <h1 class="empty-state__title">No encontramos este café</h1>
        <p class="empty-state__text">Es posible que el enlace esté incompleto o que el producto ya no esté disponible.</p>
        <a class="btn btn--primary" href="${CCC.url("index.html#catalogo")}">Volver al catálogo</a>
      </div>`;
  }

  function bindBuyForm(container, product) {
    const form = qs("[data-buy-form]", container);
    const input = qs("[data-qty-input]", form);
    const subtotal = qs("[data-subtotal]", form);
    const max = CCC.cartService.MAX_QUANTITY;

    const readQuantity = () => Math.max(1, Math.min(max, Math.floor(Number(input.value) || 1)));
    const update = () => {
      const quantity = readQuantity();
      subtotal.textContent = `${formatPrice(product.price * quantity)} COP`;
      qs('[data-qty="-1"]', form).disabled = quantity <= 1;
      qs('[data-qty="1"]', form).disabled = quantity >= max;
    };

    form.addEventListener("click", (event) => {
      const step = event.target.closest("[data-qty]");
      if (!step) return;
      input.value = readQuantity() + Number(step.dataset.qty);
      input.value = readQuantity();
      update();
    });
    input.addEventListener("input", update);
    input.addEventListener("blur", () => {
      input.value = readQuantity();
      update();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const quantity = readQuantity();
      const grind = qs('input[name="grind"]:checked', form).value;
      CCC.cartService.addToCart(product, { quantity, grind });
      CCC.ui.showToast({
        title: "Producto añadido",
        message: `${quantity} × ${product.name} (${grind}) en tu carrito.`,
      });
      CCC.components.cartDrawer.open(qs(".pd__add", form));
    });

    update();
  }

  async function renderRelated(product) {
    const related = await CCC.productService.getRelatedProducts(product, 4);
    if (!related.length) return;
    const section = qs("[data-related]");
    qs("[data-related-grid]", section).innerHTML = related.map(card.render).join("");
    section.hidden = false;
  }

  async function init() {
    const container = qs("[data-product-detail]");
    const id = new URLSearchParams(window.location.search).get("id");
    const product = id ? await CCC.productService.getProductById(id) : null;

    if (!product) {
      container.innerHTML = renderNotFound();
      document.title = "Producto no encontrado · Compro Café de Colombia";
      qs("[data-breadcrumb-current]").textContent = "Producto no encontrado";
      return;
    }

    document.title = `${product.name} (${product.weight}) · Compro Café de Colombia`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", `${product.name}: ${product.notes}. ${product.department}, Colombia.`);
    qs("[data-breadcrumb-current]").textContent = product.name;

    container.innerHTML = renderDetail(product);
    bindBuyForm(container, product);
    await renderRelated(product);
  }

  CCC.pages = CCC.pages || {};
  CCC.pages.product = { init };
})(window.CCC = window.CCC || {});
