/* ==========================================================================
   Product service — the ONLY place that knows where products come from.
   Every function is async so the UI already behaves as if it talked to an API.
   To connect a backend, set CCC.config.apiBaseUrl (js/core/config.js); the
   endpoints expected are documented in README.md.
   ========================================================================== */
(function (CCC) {
  "use strict";

  let cache = null;

  async function fetchJson(path) {
    const response = await fetch(`${CCC.config.apiBaseUrl}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`API ${response.status} en ${path}`);
    return response.json();
  }

  /** Returns every product. Results are cached for the page lifetime. */
  async function getProducts() {
    if (cache) return cache;
    cache = CCC.config.apiBaseUrl
      ? await fetchJson("/products")
      : CCC.data.products.slice();
    return cache;
  }

  /** Returns one product or null. Accepts numbers or numeric strings. */
  async function getProductById(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return null;
    if (CCC.config.apiBaseUrl && !cache) {
      try {
        return await fetchJson(`/products/${numericId}`);
      } catch (error) {
        return null;
      }
    }
    const products = await getProducts();
    return products.find((product) => product.id === numericId) || null;
  }

  /** Products sharing department, roast or flavors with the given one. */
  async function getRelatedProducts(product, limit = 4) {
    const products = await getProducts();
    return products
      .filter((candidate) => candidate.id !== product.id)
      .map((candidate) => {
        let score = 0;
        if (candidate.department === product.department) score += 3;
        if (candidate.roast === product.roast) score += 2;
        score += candidate.flavors.filter((flavor) => product.flavors.includes(flavor)).length;
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score || a.candidate.popularity - b.candidate.popularity)
      .slice(0, limit)
      .map((entry) => entry.candidate);
  }

  /** Unique sorted values for a product field, with product counts. */
  function getFacetValues(products, field) {
    const counts = new Map();
    products.forEach((product) => {
      const values = Array.isArray(product[field]) ? product[field] : [product[field]];
      values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    });
    return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value.localeCompare(b.value, "es")
    );
  }

  CCC.productService = {
    getProducts,
    getProductById,
    getRelatedProducts,
    getFacetValues,
  };
})(window.CCC = window.CCC || {});
