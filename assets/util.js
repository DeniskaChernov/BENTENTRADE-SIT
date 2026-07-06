/* ============================================================
   BENTENTRADE — tiny shared client helpers.
   Loaded before the feature scripts so they can reuse one copy of
   the language/i18n/escape helpers and the product-card SVG icons
   instead of each redefining them. Feature scripts still keep a
   local fallback, so a missing util.js never breaks a page.
   ============================================================ */
(function () {
  "use strict";

  function lang() {
    var s = null;
    try { s = localStorage.getItem("btt_lang"); } catch (e) { /* ignore */ }
    if (s === "ru" || s === "uz" || s === "en") return s;
    var dl = document.documentElement.lang;
    return dl === "uz" || dl === "en" ? dl : "ru";
  }

  function t(k) {
    var I = window.BTT_I18N || {};
    var d = I[lang()] || {};
    if (d[k] != null) return d[k];
    var ru = I.ru || {};
    return ru[k] != null ? ru[k] : k;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var SVG = {
    fav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  };

  window.BTT_UTIL = {
    lang: lang,
    t: t,
    esc: esc,
    SVG: SVG,
    FAV_SVG: SVG.fav,
    ADD_SVG: SVG.add,
  };
})();
