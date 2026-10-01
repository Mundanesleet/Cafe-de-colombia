/* ==========================================================================
   App bootstrap — shared by every page
   1. icons + layout (header, footer, menu, cart drawer)
   2. global "add to cart" handling for any [data-add-to-cart] button
   3. page controller selected by <body data-page="…">
   ========================================================================== */
(function (CCC) {
  "use strict";

  const ADDED_FEEDBACK_MS = 1600;

  function handleAddToCart(products) {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-to-cart]");
      if (!button) return;
      const product = products.find((item) => item.id === Number(button.dataset.addToCart));
      if (!product) return;

      CCC.cartService.addToCart(product);
      showAddedFeedback(button);
      CCC.ui.showToast({
        title: "Producto añadido",
        message: `${product.name} (${product.weight}) se agregó a tu carrito.`,
      });
    });
  }

  function showAddedFeedback(button) {
    const label = button.querySelector("[data-label]");
    if (!label) return;
    button.classList.add("is-added");
    label.textContent = "Añadido";
    clearTimeout(button._addedTimer);
    button._addedTimer = setTimeout(() => {
      button.classList.remove("is-added");
      label.textContent = "Añadir";
    }, ADDED_FEEDBACK_MS);

    document.querySelectorAll(".cart-badge").forEach((badge) => {
      badge.classList.remove("is-bumping");
      void badge.offsetWidth; /* restart the animation */
      badge.classList.add("is-bumping");
    });
  }

  async function start() {
    document.documentElement.classList.add("js");
    CCC.icons.injectSprite();

    let products = [];
    try {
      products = await CCC.productService.getProducts();
    } catch (error) {
      console.error("No se pudieron cargar los productos", error);
    }

    CCC.components.layout.mount({ productCount: products.length });
    CCC.components.cartDrawer.mount();
    handleAddToCart(products);

    const page = CCC.pages && CCC.pages[document.body.dataset.page];
    if (page) await page.init({ products });

    CCC.ui.observeReveal(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window.CCC = window.CCC || {});
