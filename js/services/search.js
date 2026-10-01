/* ==========================================================================
   Search — accent-insensitive text search over the catalog
   Matches name, brand, department, flavors, type, roast and tasting notes.
   Every word typed must match somewhere ("huila chocolate" → both).
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { normalizeText } = CCC.utils;

  function buildSearchIndex(product) {
    return normalizeText(
      [
        product.name,
        product.brand,
        product.department,
        product.roast,
        product.flavors.join(" "),
        product.types.join(" "),
        product.methods.join(" "),
        product.notes,
        product.weight,
      ].join(" ")
    );
  }

  const indexCache = new WeakMap();

  function getIndex(product) {
    if (!indexCache.has(product)) indexCache.set(product, buildSearchIndex(product));
    return indexCache.get(product);
  }

  function matchesQuery(product, query) {
    const terms = normalizeText(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const index = getIndex(product);
    return terms.every((term) => index.includes(term));
  }

  function searchProducts(products, query) {
    return products.filter((product) => matchesQuery(product, query));
  }

  CCC.search = { searchProducts, matchesQuery };
})(window.CCC = window.CCC || {});
