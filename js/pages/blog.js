/* ==========================================================================
   Blog page controller — pages/blog.html (list) · pages/blog.html?id=<post>
   Posts come from CCC.data.posts (demo content).
   ========================================================================== */
(function (CCC) {
  "use strict";

  const { escapeHtml, qs, formatDate } = CCC.utils;
  const icon = (name, className) => CCC.icons.render(name, className);
  const postUrl = (post) => CCC.url(`pages/blog.html?id=${post.id}`);

  function renderCard(post) {
    return `
      <article class="post-card reveal">
        <a class="post-card__media" href="${postUrl(post)}" tabindex="-1" aria-hidden="true">
          <img src="${CCC.url(post.image)}" alt="" width="900" height="491" loading="lazy">
          <span class="post-featured__badge">${escapeHtml(post.category)}</span>
        </a>
        <div class="post-card__body">
          <p class="post-meta"><time datetime="${post.date}">${formatDate(post.date)}</time> · ${escapeHtml(post.readTime)}</p>
          <h2 class="post-card__title"><a href="${postUrl(post)}">${escapeHtml(post.title)}</a></h2>
          <p class="post-card__excerpt">${escapeHtml(post.excerpt)}</p>
          <a class="link-arrow link-arrow--sm" href="${postUrl(post)}">Leer artículo${icon("arrow-right-alt")}<span class="visually-hidden">: ${escapeHtml(post.title)}</span></a>
        </div>
      </article>`;
  }

  function renderList(posts) {
    return `
      <header class="section-head page-head">
        <p class="eyebrow">Revista Digital &amp; Cultura</p>
        <h1 class="section-head__title section-head__title--primary">Historias del Café</h1>
        <p class="section-head__text">Aprende sobre catación, técnicas de extracción y los secretos de cada cordillera.</p>
      </header>
      <p class="demo-note">${icon("info")}<span>Artículos de demostración: los textos definitivos los publicará el equipo editorial de Compro Café de Colombia.</span></p>
      <div class="post-grid">${posts.map(renderCard).join("")}</div>`;
  }

  function relatedCatalogLink(post) {
    const params = CCC.filters.toSearchParams({ ...CCC.filters.createEmptyState(), ...post.relatedFilter });
    return CCC.url(`index.html?${params}#catalogo`);
  }

  function renderArticle(post, posts) {
    const others = posts.filter((item) => item.id !== post.id).slice(0, 3);
    return `
      <article class="article">
        <header class="article__head">
          <p class="eyebrow">${escapeHtml(post.category)}</p>
          <h1 class="article__title">${escapeHtml(post.title)}</h1>
          <p class="post-meta"><time datetime="${post.date}">${formatDate(post.date)}</time> · ${escapeHtml(post.readTime)} · ${escapeHtml(post.topic)}</p>
        </header>
        <figure class="article__media">
          <img src="${CCC.url(post.image)}" alt="${escapeHtml(post.imageAlt)}" width="1200" height="655" fetchpriority="high">
        </figure>
        <div class="article__body">
          <p class="article__lead">${escapeHtml(post.excerpt)}</p>
          ${post.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          <p class="demo-note">${icon("info")}<span>Contenido de demostración. Este artículo será reemplazado por la publicación oficial.</span></p>
          <a class="btn btn--primary" href="${relatedCatalogLink(post)}">Ver cafés relacionados</a>
        </div>
      </article>
      <section class="article-more" aria-labelledby="more-title">
        <h2 class="article-more__title" id="more-title">Sigue leyendo</h2>
        <div class="post-grid">${others.map(renderCard).join("")}</div>
      </section>`;
  }

  async function init() {
    const container = qs("[data-blog-page]");
    const posts = CCC.data.posts;
    const id = new URLSearchParams(window.location.search).get("id");
    const crumb = qs("[data-breadcrumb-current]");

    if (!id) {
      container.innerHTML = renderList(posts);
      return;
    }

    const post = posts.find((item) => item.id === id);
    if (!post) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state__icon">${icon("search")}</span>
          <h1 class="empty-state__title">Artículo no encontrado</h1>
          <p class="empty-state__text">El artículo que buscas no existe o fue movido.</p>
          <a class="btn btn--primary" href="${CCC.url("pages/blog.html")}">Ver todas las historias</a>
        </div>`;
      crumb.textContent = "Artículo no encontrado";
      return;
    }

    document.title = `${post.title} · Compro Café de Colombia`;
    crumb.innerHTML = `<a href="${CCC.url("pages/blog.html")}">Blog</a>`;
    crumb.removeAttribute("aria-current");
    crumb.insertAdjacentHTML("afterend", `<li aria-current="page">${escapeHtml(post.category)}</li>`);
    container.innerHTML = renderArticle(post, posts);
  }

  CCC.pages = CCC.pages || {};
  CCC.pages.blog = { init };
})(window.CCC = window.CCC || {});
