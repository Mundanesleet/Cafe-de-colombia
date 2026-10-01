/* ==========================================================================
   Utils — small, framework-free helpers shared by every module
   ========================================================================== */
(function (CCC) {
  "use strict";

  const priceFormatter = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  });

  /** 49990 → "$49.990" */
  function formatPrice(value) {
    return `$${priceFormatter.format(Math.round(value || 0))}`;
  }

  /** Lowercases and strips accents so "Nariño" matches "narino". */
  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  }

  const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
  }

  function debounce(fn, wait) {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  /** Joins ["Chocolate", "Dulce", "Floral"] → "Chocolate, Dulce y Floral". */
  function joinList(items) {
    if (!items || items.length === 0) return "";
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function formatDate(isoDate) {
    const date = new Date(`${isoDate}T12:00:00`);
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  }

  CCC.utils = {
    formatPrice,
    normalizeText,
    escapeHtml,
    debounce,
    qs,
    qsa,
    joinList,
    pluralize,
    formatDate,
  };
})(window.CCC = window.CCC || {});
