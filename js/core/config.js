/* ==========================================================================
   App configuration
   The only file that needs to change when the static data is replaced by a
   real backend (see README → "Conectar una API").
   ========================================================================== */
(function (CCC) {
  "use strict";

  const body = document.body;

  CCC.config = {
    /* Relative path from the current page to the site root ("." or ".."). */
    root: (body && body.dataset.root) || ".",

    /* Set to e.g. "/api" to load products from a backend instead of js/data. */
    apiBaseUrl: null,

    currency: "COP",
    locale: "es-CO",

    storageKeys: {
      cart: "ccc.cart.v1",
    },

    catalog: {
      /* Products per page: 3 columns × 3 rows on wide screens, 2 × 4 otherwise. */
      pageSizeWide: 9,
      pageSizeCompact: 8,
      wideQuery: "(min-width: 1280px)",
    },

    /* Price slider bounds for the catalog filter. */
    price: { min: 18000, max: 70000, step: 1000 },
  };

  /** Builds a URL relative to the site root, e.g. url("pages/producto.html?id=3"). */
  CCC.url = function url(path) {
    return `${CCC.config.root}/${path}`;
  };
})(window.CCC = window.CCC || {});
