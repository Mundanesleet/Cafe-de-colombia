/* ==========================================================================
   Home page controller
   • Finder ("Encuentra tu café") → jumps to the catalog with a filter applied
   • Catalog: search + filters (draft → apply) + sort + pagination, URL-synced
   • Colombia Cafetera region spotlight (tabs)
   • Blog cards
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, formatPrice, qs, qsa, pluralize, formatDate } = CCC.utils;
  const { filters: F } = CCC;
  const icon = (name, className) => CCC.icons.render(name, className);

  const compactQuery = window.matchMedia("(max-width: 1023px)");
  const wideQuery = window.matchMedia(CCC.config.catalog.wideQuery);

  const state = {
    products: [],
    applied: F.createEmptyState(), /* what the grid shows */
    draft: F.createEmptyState(),   /* what the filter panel is editing */
    page: 1,
  };

  const els = {};

  /* ===================================================================
     Finder
     =================================================================== */

  function renderFinderOptions(card) {
    const attrs = (value) =>
      `data-finder-facet="${card.facet}" data-finder-value="${escapeHtml(value)}"`;

    if (card.layout === "rows") {
      return `<div class="finder-card__rows">${card.options
        .map(
          (option) => `
            <button class="finder-row" type="button" ${attrs(option.value)}>
              <span class="finder-row__name">${escapeHtml(option.value)}</span>
              <span class="finder-row__note${option.value === "Medio" ? " finder-row__note--highlight" : ""}">${escapeHtml(option.note)}</span>
            </button>`
        )
        .join("")}</div>`;
    }
    const chipClass = card.layout === "caps" ? "chip chip--caps" : "chip";
    return `<div class="finder-card__chips">${card.options
      .map((option) => `<button class="${chipClass}" type="button" ${attrs(option)}>${escapeHtml(option)}</button>`)
      .join("")}</div>`;
  }

  function renderFinder() {
    const container = qs("[data-finder]");
    container.innerHTML = CCC.data.finder
      .map(
        (card) => `
          <article class="finder-card reveal" id="${card.id}" aria-labelledby="finder-${card.id}">
            <div class="finder-card__head">
              <span class="icon-tile icon-tile--${card.tone}">${icon(card.icon)}</span>
              <h3 class="finder-card__title" id="finder-${card.id}">${escapeHtml(card.title)}</h3>
              <p class="finder-card__text">${escapeHtml(card.text)}</p>
            </div>
            ${renderFinderOptions(card)}
          </article>`
      )
      .join("");

    container.addEventListener("click", (event) => {
      const option = event.target.closest("[data-finder-facet]");
      if (!option) return;
      applyQuickFilter(option.dataset.finderFacet, [option.dataset.finderValue]);
    });
  }

  /** Replaces all filters with a single facet selection and shows the catalog. */
  function applyQuickFilter(facet, values) {
    const next = F.clearFilters(state.applied);
    next[facet] = values.slice();
    commit(next);
    CCC.components.layout.setSearchValue("");
    CCC.ui.scrollToElement(els.catalog);
  }

  /* ===================================================================
     Catalog — filter panel
     =================================================================== */

  function facetCounts(field) {
    return CCC.productService.getFacetValues(state.products, field);
  }

  function checkboxList(name, options, selected, { counts = true } = {}) {
    return options
      .map(
        ({ value, count }) => `
          <label class="check-row" data-option="${escapeHtml(CCC.utils.normalizeText(value))}">
            <span class="check-row__main">
              <input type="checkbox" name="${name}" value="${escapeHtml(value)}" ${selected.includes(value) ? "checked" : ""}>
              <span>${escapeHtml(value)}</span>
            </span>
            ${counts ? `<span class="check-row__count">${count}</span>` : ""}
          </label>`
      )
      .join("");
  }

  function renderFilterBody() {
    const draft = state.draft;
    const { taxonomy } = CCC.data;
    const { min, max, step } = CCC.config.price;
    const priceValue = draft.maxPrice ?? max;
    const flavorCounts = new Map(facetCounts("flavors").map((item) => [item.value, item.count]));
    const typeCounts = new Map(facetCounts("types").map((item) => [item.value, item.count]));
    const selectedType = draft.types[0] || "";

    els.filterBody.innerHTML = `
      <fieldset class="filter-group">
        <legend class="filter-group__title">Marca / Vendedor</legend>
        <div class="filter-search">
          <label class="visually-hidden" for="brand-search">Buscar marca</label>
          <input id="brand-search" type="search" placeholder="Buscar marca..." autocomplete="off" data-brand-search>
          ${icon("search", "filter-search__icon")}
        </div>
        <div class="filter-group__scroll" data-brand-list>
          ${checkboxList("brands", facetCounts("brand"), draft.brands, { counts: false })}
          <p class="filter-group__empty" data-brand-empty hidden>Ninguna marca coincide.</p>
        </div>
      </fieldset>

      <fieldset class="filter-group">
        <legend class="filter-group__title">Departamento de Origen</legend>
        <div class="filter-group__list filter-group__list--departments">
          ${checkboxList("departments", facetCounts("department"), draft.departments)}
        </div>
      </fieldset>

      <fieldset class="filter-group">
        <legend class="filter-group__title">Sabores</legend>
        <div class="pill-options">
          ${taxonomy.flavors
            .map(
              (flavor) => `
                <button class="pill-option" type="button" data-toggle-facet="flavors" data-value="${escapeHtml(flavor)}" aria-pressed="${draft.flavors.includes(flavor)}">
                  ${escapeHtml(flavor)}<span class="visually-hidden"> (${flavorCounts.get(flavor) || 0} cafés)</span>
                </button>`
            )
            .join("")}
        </div>
      </fieldset>

      <fieldset class="filter-group">
        <legend class="filter-group__title">Nivel de Tostión</legend>
        <div class="segmented">
          ${taxonomy.roasts
            .map(
              (roast) => `
                <button class="segmented__option" type="button" data-toggle-facet="roasts" data-value="${roast.value}" aria-pressed="${draft.roasts.includes(roast.value)}">
                  ${roast.label}
                </button>`
            )
            .join("")}
        </div>
      </fieldset>

      <fieldset class="filter-group">
        <legend class="filter-group__title">Tipología</legend>
        <div class="filter-group__list">
          <label class="check-row"><span class="check-row__main"><input type="radio" name="types" value="" ${selectedType === "" ? "checked" : ""}><span>Todas las tipologías</span></span></label>
          ${taxonomy.types
            .map(
              (type) => `
                <label class="check-row">
                  <span class="check-row__main"><input type="radio" name="types" value="${type.value}" ${selectedType === type.value ? "checked" : ""}><span>${escapeHtml(type.label)}</span></span>
                  <span class="check-row__count">${typeCounts.get(type.value) || 0}</span>
                </label>`
            )
            .join("")}
        </div>
      </fieldset>

      <div class="filter-group">
        <div class="filter-group__row">
          <label class="filter-group__title" for="price-range">Precio</label>
          <output class="filter-price__value" for="price-range" data-price-label></output>
        </div>
        <input class="range" id="price-range" type="range" min="${min}" max="${max}" step="${step}" value="${priceValue}" data-price>
        <div class="filter-price__bounds" aria-hidden="true"><span>$${min / 1000}k</span><span>$${max / 1000}k</span></div>
      </div>`;

    updatePriceUi();
    updateApplyPreview();
  }

  function updatePriceUi() {
    const range = qs("[data-price]", els.filterBody);
    const { min, max } = CCC.config.price;
    const value = Number(range.value);
    qs("[data-price-label]", els.filterBody).textContent = `${formatPrice(min)} - ${formatPrice(value)} COP`;
    range.style.setProperty("--fill", `${((value - min) / (max - min)) * 100}%`);
  }

  /** Reads the panel controls into state.draft. */
  function readDraftFromForm() {
    const form = els.filterForm;
    const draft = state.draft;
    draft.brands = qsa('input[name="brands"]:checked', form).map((input) => input.value);
    draft.departments = qsa('input[name="departments"]:checked', form).map((input) => input.value);
    const type = qs('input[name="types"]:checked', form);
    draft.types = type && type.value ? [type.value] : [];
    const price = Number(qs("[data-price]", form).value);
    draft.maxPrice = price >= CCC.config.price.max ? null : price;
  }

  function updateApplyPreview() {
    const count = F.filterProducts(state.products, state.draft).length;
    els.applyButton.textContent = `Aplicar filtros (${count})`;
  }

  function bindFilterPanel() {
    const form = els.filterForm;

    form.addEventListener("change", (event) => {
      if (event.target.matches("[data-brand-search]")) return;
      readDraftFromForm();
      updateApplyPreview();
    });

    form.addEventListener("input", (event) => {
      if (event.target.matches("[data-price]")) {
        updatePriceUi();
        readDraftFromForm();
        updateApplyPreview();
      }
      if (event.target.matches("[data-brand-search]")) filterBrandList(event.target.value);
    });

    form.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-toggle-facet]");
      if (!toggle) return;
      const facet = toggle.dataset.toggleFacet;
      const value = toggle.dataset.value;
      const selected = state.draft[facet];
      const index = selected.indexOf(value);
      if (index === -1) selected.push(value);
      else selected.splice(index, 1);
      toggle.setAttribute("aria-pressed", String(index === -1));
      updateApplyPreview();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      readDraftFromForm();
      commit({ ...F.cloneState(state.draft), query: state.applied.query, sort: state.applied.sort });
      if (compactQuery.matches && CCC.ui.isOverlayOpen(els.filterPanel)) {
        CCC.ui.closeOverlay(els.filterPanel);
        CCC.ui.scrollToElement(qs(".catalog-toolbar", els.catalog));
      }
    });

    qs("[data-filters-reset]", form).addEventListener("click", () => {
      clearAll();
      const firstControl = qs("input", els.filterBody);
      if (firstControl) firstControl.focus();
    });

    const trigger = qs("[data-filters-open]");
    trigger.addEventListener("click", () => {
      CCC.ui.openOverlay(els.filterPanel, {
        trigger,
        toggleHidden: false,
        initialFocus: ".filters-panel__close",
      });
    });

    const syncPanelMode = () => {
      if (compactQuery.matches) {
        if (!CCC.ui.isOverlayOpen(els.filterPanel)) els.filterPanel.inert = true;
      } else {
        if (CCC.ui.isOverlayOpen(els.filterPanel)) CCC.ui.closeOverlay(els.filterPanel);
        els.filterPanel.inert = false;
        els.filterPanel.classList.remove("is-open");
      }
    };
    syncPanelMode();
    compactQuery.addEventListener("change", syncPanelMode);
  }

  function filterBrandList(query) {
    const needle = CCC.utils.normalizeText(query);
    let visible = 0;
    qsa("[data-brand-list] .check-row", els.filterBody).forEach((row) => {
      const match = row.dataset.option.includes(needle);
      row.hidden = !match;
      if (match) visible += 1;
    });
    qs("[data-brand-empty]", els.filterBody).hidden = visible > 0;
  }

  /* ===================================================================
     Catalog — results, chips, sorting, pagination
     =================================================================== */

  function pageSize() {
    return wideQuery.matches ? CCC.config.catalog.pageSizeWide : CCC.config.catalog.pageSizeCompact;
  }

  function commit(nextState, { keepPage = false } = {}) {
    state.applied = nextState;
    state.draft = F.cloneState(nextState);
    if (!keepPage) state.page = 1;
    syncUrl();
    renderFilterBody();
    renderResults();
  }

  function clearAll() {
    CCC.components.layout.setSearchValue("");
    commit(F.clearFilters(state.applied));
  }

  function syncUrl() {
    const params = F.toSearchParams(state.applied).toString();
    const url = `${window.location.pathname}${params ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }

  function renderActiveFilters() {
    const active = F.getActiveFilters(state.applied);
    els.activeFilters.innerHTML = active.length
      ? active
          .map(
            (filter) => `
              <li class="active-chip">
                <span>${escapeHtml(filter.label)}</span>
                <button type="button" data-remove-facet="${filter.facet}" data-remove-value="${escapeHtml(String(filter.value))}" aria-label="Quitar filtro: ${escapeHtml(filter.label)}">
                  ${icon("close")}
                </button>
              </li>`
          )
          .join("") +
        `<li><button class="active-filters__clear" type="button" data-clear-all>Limpiar todos</button></li>`
      : `<li class="active-filters__none">Ninguno · mostrando todo el catálogo</li>`;

    const counter = qs("[data-filters-count]");
    counter.hidden = active.length === 0;
    counter.textContent = String(active.length);
    qs("[data-filters-open]").setAttribute(
      "aria-label",
      active.length ? `Filtrar cafés (${pluralize(active.length, "filtro activo", "filtros activos")})` : "Filtrar cafés"
    );
  }

  function renderEmptyState() {
    return `
      <div class="empty-state">
        <span class="empty-state__icon">${icon("search")}</span>
        <h3 class="empty-state__title">No encontramos cafés con esos criterios</h3>
        <p class="empty-state__text">Prueba con otra búsqueda o quita algunos filtros para ver más opciones.</p>
        <button class="btn btn--primary" type="button" data-clear-all>Limpiar filtros</button>
      </div>`;
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      els.pagination.innerHTML = "";
      els.pagination.hidden = true;
      return;
    }
    els.pagination.hidden = false;
    const current = state.page;
    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      if (page === 1 || page === totalPages || Math.abs(page - current) <= 1) pages.push(page);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    els.pagination.innerHTML = `
      <p class="pagination__status">Página ${current} de ${totalPages}</p>
      <ul class="pagination__list">
        <li><button class="pagination__btn pagination__btn--nav" type="button" data-goto-page="${current - 1}" aria-label="Página anterior" ${current === 1 ? "disabled" : ""}>${icon("chevron-left")}</button></li>
        ${pages
          .map((page) =>
            page === "…"
              ? `<li class="pagination__gap" aria-hidden="true">…</li>`
              : `<li><button class="pagination__btn" type="button" data-goto-page="${page}" ${
                  page === current ? 'aria-current="page"' : ""
                } aria-label="Página ${page}">${page}</button></li>`
          )
          .join("")}
        <li><button class="pagination__btn pagination__btn--nav" type="button" data-goto-page="${current + 1}" aria-label="Página siguiente" ${current === totalPages ? "disabled" : ""}>${icon("chevron-right")}</button></li>
      </ul>`;
  }

  function renderResults() {
    const results = F.filterProducts(state.products, state.applied);
    const size = pageSize();
    const totalPages = Math.max(1, Math.ceil(results.length / size));
    state.page = Math.min(state.page, totalPages);
    const pageItems = results.slice((state.page - 1) * size, state.page * size);

    els.grid.innerHTML = pageItems.length
      ? pageItems.map(CCC.components.productCard.render).join("")
      : renderEmptyState();
    els.grid.classList.toggle("is-empty", pageItems.length === 0);

    els.count.textContent = results.length
      ? `Mostrando ${pageItems.length} de ${pluralize(results.length, "café", "cafés")} de origen verificados`
      : "Sin resultados";

    els.sort.value = state.applied.sort;
    renderActiveFilters();
    renderPagination(totalPages);
  }

  function bindCatalog() {
    els.sort.innerHTML = Object.entries(F.SORTS)
      .map(([value, sort]) => `<option value="${value}">${sort.label}</option>`)
      .join("");
    els.sort.addEventListener("change", () => commit({ ...state.applied, sort: els.sort.value }));

    els.catalog.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-facet]");
      if (remove) {
        const facet = remove.dataset.removeFacet;
        if (facet === "query") CCC.components.layout.setSearchValue("");
        const value = facet === "maxPrice" ? Number(remove.dataset.removeValue) : remove.dataset.removeValue;
        commit(F.removeFilter(state.applied, facet, value));
        const nextChip = qs("[data-remove-facet], [data-clear-all]", els.activeFilters);
        (nextChip || qs("[data-filters-open]")).focus();
        return;
      }
      if (event.target.closest("[data-clear-all]")) {
        clearAll();
        return;
      }
      const pageButton = event.target.closest("[data-goto-page]");
      if (pageButton && !pageButton.disabled) {
        state.page = Number(pageButton.dataset.gotoPage);
        renderResults();
        CCC.ui.scrollToElement(els.catalog);
        const currentButton = qs('[aria-current="page"]', els.pagination);
        if (currentButton) currentButton.focus({ preventScroll: true });
      }
    });

    window.addEventListener("catalog:search", (event) => {
      const { query, submit } = event.detail;
      if (query !== state.applied.query) commit({ ...state.applied, query });
      if (submit) CCC.ui.scrollToElement(els.catalog);
    });

    wideQuery.addEventListener("change", () => renderResults());
  }

  /* ===================================================================
     Colombia Cafetera
     =================================================================== */

  function renderRegionSpotlight(region) {
    return `
      <div class="spotlight__top">
        <div class="spotlight__labels">
          <span class="tag tag--green spotlight__badge">Zona Cafetera Seleccionada</span>
          <span class="spotlight__count">22 Departamentos Productores</span>
        </div>
        <span class="tag tag--green spotlight__tag-mobile">${escapeHtml(region.tag)}</span>
        <h3 class="spotlight__title">${escapeHtml(region.title)}</h3>
        <p class="spotlight__text">${escapeHtml(region.description)}</p>
      </div>
      <dl class="spotlight__metrics">
        <div><dt>Altitud media</dt><dd>${escapeHtml(region.altitude)}</dd></div>
        <div><dt>Acidez</dt><dd>${escapeHtml(region.acidity)}</dd></div>
        <div><dt>Cuerpo</dt><dd>${escapeHtml(region.body)}</dd></div>
      </dl>
      <figure class="spotlight__media">
        <img src="${CCC.url(region.image)}" alt="${escapeHtml(region.imageAlt)}" width="1400" height="718" loading="lazy">
        <figcaption class="spotlight__caption">
          <span>${escapeHtml(region.departments.join(" · "))}</span>
          <button class="btn btn--light btn--xs" type="button" data-region-filter="${region.id}">Ver cafés de esta región</button>
        </figcaption>
      </figure>`;
  }

  function renderRegions() {
    const container = qs("[data-regions]");
    const regions = CCC.data.regions;
    container.innerHTML = `
      <div class="regions__list">
        <div class="regions__tabs no-scrollbar" role="tablist" aria-label="Regiones cafeteras">
          ${regions
            .map(
              (region, index) => `
                <button class="region-tab" type="button" role="tab" id="region-tab-${region.id}" aria-controls="region-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-region="${region.id}">
                  <span class="region-tab__row">
                    <span class="region-tab__name">${escapeHtml(region.name)}</span>
                    <span class="region-tab__short">${escapeHtml(region.shortName)}</span>
                    <span class="region-tab__tag region-tab__tag--${region.tagTone}">${escapeHtml(region.tag)}</span>
                  </span>
                  <span class="region-tab__summary">${escapeHtml(region.summary)}</span>
                </button>`
            )
            .join("")}
        </div>
        <div class="regions__cta">
          <span>¿Buscas una denominación específica?</span>
          <a href="#encuentra-tu-cafe">Ver mapa completo</a>
        </div>
      </div>
      <div class="spotlight" id="region-panel" role="tabpanel" aria-labelledby="region-tab-${regions[0].id}" tabindex="0" data-region-panel>
        ${renderRegionSpotlight(regions[0])}
      </div>`;

    const tabs = qsa(".region-tab", container);
    const panel = qs("[data-region-panel]", container);

    const select = (tab, focus) => {
      const region = regions.find((item) => item.id === tab.dataset.region);
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tab.id);
      panel.classList.remove("is-swapping");
      void panel.offsetWidth;
      panel.innerHTML = renderRegionSpotlight(region);
      panel.classList.add("is-swapping");
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    };

    container.addEventListener("click", (event) => {
      const tab = event.target.closest(".region-tab");
      if (tab) {
        select(tab, false);
        return;
      }
      const filterButton = event.target.closest("[data-region-filter]");
      if (filterButton) {
        const region = regions.find((item) => item.id === filterButton.dataset.regionFilter);
        applyQuickFilter("departments", region.departments);
      }
    });

    qs('[role="tablist"]', container).addEventListener("keydown", (event) => {
      const index = tabs.indexOf(document.activeElement);
      if (index === -1) return;
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next = null;
      if (event.key in keys) next = tabs[(index + keys[event.key] + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        select(next, true);
      }
    });
  }

  /* ===================================================================
     Blog
     =================================================================== */

  function renderBlog() {
    const posts = CCC.data.posts;
    const featured = posts.find((post) => post.featured) || posts[0];
    const others = posts.filter((post) => post !== featured);
    const postUrl = (post) => CCC.url(`pages/blog.html?id=${post.id}`);

    qs("[data-blog]").innerHTML = `
      <article class="post-featured reveal">
        <a class="post-featured__media" href="${postUrl(featured)}" tabindex="-1" aria-hidden="true">
          <img src="${CCC.url(featured.image)}" alt="" width="1200" height="655" loading="lazy">
          <span class="post-featured__badge">${escapeHtml(featured.category)}</span>
        </a>
        <div class="post-featured__body">
          <p class="post-meta"><time datetime="${featured.date}">${formatDate(featured.date)}</time> · ${escapeHtml(featured.readTime)} · ${escapeHtml(featured.topic)}</p>
          <h3 class="post-featured__title"><a href="${postUrl(featured)}">${escapeHtml(featured.title)}</a></h3>
          <p class="post-featured__excerpt">${escapeHtml(featured.excerpt)}</p>
          <a class="link-arrow link-arrow--sm" href="${postUrl(featured)}">
            <span>Leer artículo completo</span>${icon("arrow-right-alt")}
            <span class="visually-hidden">: ${escapeHtml(featured.title)}</span>
          </a>
        </div>
      </article>
      <div class="post-list">
        ${others
          .map(
            (post) => `
              <article class="post-row reveal">
                <a class="post-row__media" href="${postUrl(post)}" tabindex="-1" aria-hidden="true">
                  <img src="${CCC.url(post.image)}" alt="" width="900" height="491" loading="lazy">
                </a>
                <div class="post-row__body">
                  <p class="post-row__category">${escapeHtml(post.category)} <span class="post-row__date">· <time datetime="${post.date}">${formatDate(post.date)}</time></span></p>
                  <h3 class="post-row__title"><a href="${postUrl(post)}">${escapeHtml(post.title)}</a></h3>
                  <p class="post-row__excerpt">${escapeHtml(post.excerpt)}</p>
                </div>
              </article>`
          )
          .join("")}
      </div>`;
  }

  /* ===================================================================
     Init
     =================================================================== */

  async function init({ products }) {
    state.products = products;
    Object.assign(els, {
      catalog: document.getElementById("catalogo"),
      grid: qs("[data-product-grid]"),
      count: qs("[data-results-count]"),
      sort: qs("[data-sort]"),
      pagination: qs("[data-pagination]"),
      activeFilters: qs("[data-active-filters]"),
      filterPanel: qs("[data-filters-panel]"),
      filterForm: qs("[data-filters-form]"),
      filterBody: qs("[data-filters-body]"),
      applyButton: qs("[data-filters-apply]"),
    });

    renderFinder();
    renderRegions();
    renderBlog();

    const initial = F.fromSearchParams(new URLSearchParams(window.location.search));
    CCC.components.layout.setSearchValue(initial.query);
    bindCatalog();
    bindFilterPanel();
    commit(initial);

    qs("[data-collection-cta]").addEventListener("click", () => {
      commit({ ...F.clearFilters(state.applied), sort: "price-asc" });
    });

    /* Arriving with a search or filter in the URL: land on the results. */
    if (window.location.search && !window.location.hash) {
      requestAnimationFrame(() => CCC.ui.scrollToElement(els.catalog));
    }
  }

  CCC.pages = CCC.pages || {};
  CCC.pages.home = { init };
})(window.CCC = window.CCC || {});
