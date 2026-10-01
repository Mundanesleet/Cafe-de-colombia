/* ==========================================================================
   Filters — pure functions over a "filter state" object
   State shape:
   {
     query: string,
     brands: string[], departments: string[], flavors: string[],
     roasts: string[], types: string[], methods: string[],
     maxPrice: number | null,
     sort: "relevance" | "price-asc" | "price-desc" | "name-asc" | "newest"
   }
   Values inside one facet are OR-ed; different facets are AND-ed.
   ========================================================================== */
(function (CCC) {
  "use strict";

  /* facet key → product field, label shown in chips, URL param */
  const FACETS = {
    brands: { field: "brand", label: "Marca", param: "marca" },
    departments: { field: "department", label: "Origen", param: "departamento" },
    flavors: { field: "flavors", label: "Sabor", param: "sabor" },
    roasts: { field: "roast", label: "Tostión", param: "tostion" },
    types: { field: "types", label: "Tipología", param: "tipologia" },
    methods: { field: "methods", label: "Preparación", param: "preparacion" },
  };

  const SORTS = {
    relevance: { label: "Más populares", compare: (a, b) => a.popularity - b.popularity },
    "price-asc": { label: "Precio: menor a mayor", compare: (a, b) => a.price - b.price },
    "price-desc": { label: "Precio: mayor a menor", compare: (a, b) => b.price - a.price },
    "name-asc": { label: "Nombre: A-Z", compare: (a, b) => a.name.localeCompare(b.name, "es") },
    newest: { label: "Novedades", compare: (a, b) => b.addedAt.localeCompare(a.addedAt) },
  };

  /** "Ligero" → "Ligera" (the label used with "tostión"). */
  function roastLabel(value) {
    const roast = CCC.data.taxonomy.roasts.find((item) => item.value === value);
    return roast ? roast.label : value;
  }

  function createEmptyState() {
    return {
      query: "",
      brands: [],
      departments: [],
      flavors: [],
      roasts: [],
      types: [],
      methods: [],
      maxPrice: null,
      sort: "relevance",
    };
  }

  function cloneState(state) {
    const copy = { ...state };
    Object.keys(FACETS).forEach((key) => {
      copy[key] = state[key].slice();
    });
    return copy;
  }

  function matchesFacet(product, facetKey, selected) {
    if (selected.length === 0) return true;
    const value = product[FACETS[facetKey].field];
    return Array.isArray(value)
      ? value.some((item) => selected.includes(item))
      : selected.includes(value);
  }

  /** Applies search + every facet + price, then sorts. Never mutates input. */
  function filterProducts(products, state) {
    const searched = CCC.search.searchProducts(products, state.query);
    const filtered = searched.filter(
      (product) =>
        Object.keys(FACETS).every((key) => matchesFacet(product, key, state[key])) &&
        (state.maxPrice == null || product.price <= state.maxPrice)
    );
    const sorter = SORTS[state.sort] || SORTS.relevance;
    return filtered.slice().sort(sorter.compare);
  }

  /** Flat list of active filters, used to render removable chips. */
  function getActiveFilters(state) {
    const active = [];
    if (state.query) {
      active.push({ facet: "query", value: state.query, label: `Búsqueda: “${state.query}”` });
    }
    Object.keys(FACETS).forEach((key) => {
      state[key].forEach((value) => {
        const label = key === "roasts" ? `Tostión ${roastLabel(value).toLowerCase()}` : value;
        active.push({ facet: key, value, label });
      });
    });
    if (state.maxPrice != null) {
      active.push({
        facet: "maxPrice",
        value: state.maxPrice,
        label: `Hasta ${CCC.utils.formatPrice(state.maxPrice)}`,
      });
    }
    return active;
  }

  function removeFilter(state, facet, value) {
    const next = cloneState(state);
    if (facet === "query") next.query = "";
    else if (facet === "maxPrice") next.maxPrice = null;
    else next[facet] = next[facet].filter((item) => item !== value);
    return next;
  }

  /** Clears filters but keeps the sort order chosen by the user. */
  function clearFilters(state) {
    return { ...createEmptyState(), sort: state.sort };
  }

  function countActiveFilters(state) {
    return getActiveFilters(state).length;
  }

  /* ---- URL <-> state (shareable, back-button friendly links) ---- */

  function toSearchParams(state) {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    Object.keys(FACETS).forEach((key) => {
      if (state[key].length) params.set(FACETS[key].param, state[key].join(","));
    });
    if (state.maxPrice != null) params.set("precio", String(state.maxPrice));
    if (state.sort !== "relevance") params.set("orden", state.sort);
    return params;
  }

  function fromSearchParams(params) {
    const state = createEmptyState();
    state.query = (params.get("q") || "").trim();
    Object.keys(FACETS).forEach((key) => {
      const raw = params.get(FACETS[key].param);
      state[key] = raw ? raw.split(",").map((item) => item.trim()).filter(Boolean) : [];
    });
    const price = Number(params.get("precio"));
    state.maxPrice = Number.isFinite(price) && price > 0 ? price : null;
    const sort = params.get("orden");
    state.sort = SORTS[sort] ? sort : "relevance";
    return state;
  }

  CCC.filters = {
    FACETS,
    SORTS,
    createEmptyState,
    cloneState,
    filterProducts,
    getActiveFilters,
    removeFilter,
    clearFilters,
    countActiveFilters,
    toSearchParams,
    fromSearchParams,
  };
})(window.CCC = window.CCC || {});
