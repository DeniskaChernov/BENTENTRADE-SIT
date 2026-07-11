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

  /** Above-the-fold / LCP images stay eager; everything else lazy-loads. */
  function isEagerImg(img) {
    if (!img || img.tagName !== "IMG") return false;
    if (img.getAttribute("loading") === "eager") return true;
    if (img.getAttribute("fetchpriority") === "high") return true;
    if (img.closest(".site-head .brand")) return true;
    if (img.classList.contains("hero__img") && img.classList.contains("is-on")) return true;
    if (img.matches(".page-hero__collage > img, .cat-hero > img")) return true;
    if (img.closest(".pdp-stage") && img.classList.contains("is-on")) return true;
    return false;
  }

  function lazyImg(img) {
    if (!img || img.tagName !== "IMG") return;
    if (isEagerImg(img)) {
      if (!img.getAttribute("loading")) img.loading = "eager";
    } else if (!img.getAttribute("loading")) {
      img.loading = "lazy";
    }
    if (!img.hasAttribute("decoding")) img.decoding = "async";
  }

  function lazyBind(root) {
    var scope = root || document;
    if (scope.tagName === "IMG") {
      lazyImg(scope);
      return;
    }
    if (!scope.querySelectorAll) return;
    scope.querySelectorAll("img").forEach(lazyImg);
  }

  /** Catalog prices in products.js are USD units; display only in UZS. */
  var UZS_PER_USD = 12500;

  function toUzs(usdAmount) {
    return Math.round(Number(usdAmount) || 0) * UZS_PER_USD;
  }

  function formatMoney(amount, opts) {
    opts = opts || {};
    var n = opts.raw ? Math.round(Number(amount) || 0) : toUzs(amount);
    var spaced = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
    return spaced + "\u00a0сум";
  }

  function parseMoneyText(text) {
    return parseInt(String(text || "").replace(/[^\d]/g, ""), 10) || 0;
  }

  function managerUrl(text) {
    var msg = encodeURIComponent(text || "");
    return {
      telegram: "https://t.me/bententradeuz" + (msg ? "?text=" + msg : ""),
      whatsapp: "https://wa.me/998771044422" + (msg ? "?text=" + msg : ""),
    };
  }

  window.BTT_UTIL = {
    lang: lang,
    t: t,
    esc: esc,
    SVG: SVG,
    FAV_SVG: SVG.fav,
    ADD_SVG: SVG.add,
    lazyImg: lazyImg,
    lazyBind: lazyBind,
    UZS_PER_USD: UZS_PER_USD,
    toUzs: toUzs,
    formatMoney: formatMoney,
    parseMoneyText: parseMoneyText,
    managerUrl: managerUrl,
  };

  var OG_LOCALES = { ru: "ru_RU", uz: "uz_UZ", en: "en_US" };
  var SITE_URL = "https://bententrade.uz";

  function seoPageUrl() {
    var path = location.pathname.split("/").pop() || "index.html";
    return SITE_URL + "/" + path + (location.search || "");
  }

  function setMetaProperty(name, content) {
    if (!content) return;
    var el = document.querySelector('meta[property="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function injectHreflang() {
    document.querySelectorAll("link[data-btt-hreflang]").forEach(function (n) { n.remove(); });
    var url = seoPageUrl();
    ["ru", "uz", "en", "x-default"].forEach(function (h) {
      var link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = h;
      link.href = url;
      link.setAttribute("data-btt-hreflang", "");
      document.head.appendChild(link);
    });
  }

  function updateOgLocale(activeLang) {
    var active = OG_LOCALES[activeLang] || OG_LOCALES.ru;
    setMetaProperty("og:locale", active);
    document.querySelectorAll("meta[data-btt-og-alt]").forEach(function (n) { n.remove(); });
    Object.keys(OG_LOCALES).forEach(function (code) {
      if (code === activeLang) return;
      var m = document.createElement("meta");
      m.setAttribute("property", "og:locale:alternate");
      m.setAttribute("content", OG_LOCALES[code]);
      m.setAttribute("data-btt-og-alt", "");
      document.head.appendChild(m);
    });
  }

  function stripHtml(html) {
    var d = document.createElement("div");
    d.innerHTML = html == null ? "" : html;
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  }

  function injectJsonLd(id, data) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  window.BTT_SEO = {
    pageUrl: seoPageUrl,
    stripHtml: stripHtml,
    injectJsonLd: injectJsonLd,
    refresh: function (lng) {
      injectHreflang();
      updateOgLocale(lng || document.documentElement.lang || "ru");
    },
  };
})();
