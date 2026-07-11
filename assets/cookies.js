/* Bententrade — cookie consent: no server requests until accepted. */
(function () {
  "use strict";

  var KEY = "btt_cookie_consent";
  var bannerEl = null;

  var FALLBACK = {
    ru: {
      text: "Мы используем cookie и запросы к серверу для заказов, каталога и форм. Данные отправляются только после вашего согласия.",
      accept: "Принять",
      reject: "Только просмотр",
      more: "Подробнее",
    },
    uz: {
      text: "Buyurtma, katalog va shakllar uchun cookie va server so‘rovlari ishlatiladi. Ma’lumotlar faqat roziligingizdan keyin yuboriladi.",
      accept: "Qabul qilish",
      reject: "Faqat ko‘rish",
      more: "Batafsil",
    },
    en: {
      text: "We use cookies and server requests for orders, catalog and forms. Data is sent only after you accept.",
      accept: "Accept",
      reject: "Browse only",
      more: "Learn more",
    },
  };

  function lang() {
    try {
      var s = localStorage.getItem("btt_lang");
      if (s === "uz" || s === "en") return s;
    } catch (e) { /* ignore */ }
    return "ru";
  }

  function t(key) {
    if (window.BTT_I18N && window.BTT_I18N.t) {
      var v = window.BTT_I18N.t(key);
      if (v && v !== key) return v;
    }
    var L = FALLBACK[lang()] || FALLBACK.ru;
    if (key === "cookie.banner.text") return L.text;
    if (key === "cookie.banner.accept") return L.accept;
    if (key === "cookie.banner.reject") return L.reject;
    if (key === "cookie.banner.more") return L.more;
    return key;
  }

  function status() {
    try {
      return localStorage.getItem(KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function hasConsent() {
    return status() === "accepted";
  }

  function pathOf(url) {
    var u = String(url || "");
    if (u.indexOf("http") === 0) {
      try {
        return new URL(u, location.origin).pathname;
      } catch (e) {
        return u;
      }
    }
    return u.split("?")[0];
  }

  function needsConsent(url) {
    var p = pathOf(url);
    return p.indexOf("/api/") === 0 || p.indexOf("/data/") === 0;
  }

  function consentError() {
    var err = new Error("cookie_consent_required");
    err.code = "cookie_consent_required";
    return err;
  }

  function guardedFetch(url, init) {
    if (!hasConsent() && needsConsent(url)) {
      return Promise.reject(consentError());
    }
    return fetch(url, init);
  }

  var bannerRO = null;

  function syncBannerOffset() {
    if (!bannerEl || !bannerEl.classList.contains("is-on")) {
      document.body.classList.remove("has-cookie-banner");
      document.documentElement.style.removeProperty("--cookie-banner-h");
      return;
    }
    document.body.classList.add("has-cookie-banner");
    var h = Math.ceil(bannerEl.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--cookie-banner-h", h + "px");
  }

  function watchBannerSize() {
    if (!bannerEl || !("ResizeObserver" in window)) return;
    if (bannerRO) bannerRO.disconnect();
    bannerRO = new ResizeObserver(syncBannerOffset);
    bannerRO.observe(bannerEl);
    syncBannerOffset();
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove("is-on");
    bannerEl.setAttribute("aria-hidden", "true");
    syncBannerOffset();
  }

  function showBanner() {
    if (!bannerEl) buildBanner();
    if (hasConsent()) return;
    bannerEl.classList.add("is-on");
    bannerEl.setAttribute("aria-hidden", "false");
    watchBannerSize();
  }

  function applyBannerText() {
    if (!bannerEl) return;
    var text = bannerEl.querySelector("[data-cookie-text]");
    var accept = bannerEl.querySelector("[data-cookie-accept]");
    var reject = bannerEl.querySelector("[data-cookie-reject]");
    var more = bannerEl.querySelector("[data-cookie-more]");
    if (text) text.textContent = t("cookie.banner.text");
    if (accept) accept.textContent = t("cookie.banner.accept");
    if (reject) reject.textContent = t("cookie.banner.reject");
    if (more) more.textContent = t("cookie.banner.more");
    syncBannerOffset();
  }

  function buildBanner() {
    if (bannerEl) return;
    bannerEl = document.createElement("div");
    bannerEl.className = "cookie-banner";
    bannerEl.setAttribute("role", "dialog");
    bannerEl.setAttribute("aria-live", "polite");
    bannerEl.setAttribute("aria-label", "Cookie consent");
    bannerEl.setAttribute("aria-hidden", "true");
    bannerEl.innerHTML =
      '<div class="cookie-banner__in">' +
      '<p class="cookie-banner__text" data-cookie-text></p>' +
      '<div class="cookie-banner__actions">' +
      '<a class="cookie-banner__link" href="cookies.html" data-cookie-more></a>' +
      '<button type="button" class="btn btn--ghost cookie-banner__btn" data-cookie-reject></button>' +
      '<button type="button" class="btn btn--copper cookie-banner__btn" data-cookie-accept></button>' +
      "</div></div>";
    document.body.appendChild(bannerEl);
    bannerEl.querySelector("[data-cookie-accept]").addEventListener("click", accept);
    bannerEl.querySelector("[data-cookie-reject]").addEventListener("click", reject);
    applyBannerText();
    window.addEventListener("resize", syncBannerOffset, { passive: true });
  }

  function accept() {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch (e) { /* ignore */ }
    hideBanner();
    document.dispatchEvent(new CustomEvent("btt:cookies-accepted"));
  }

  function reject() {
    /* «Только просмотр» — скрыть до перезагрузки; согласие не даётся, API заблокирован. */
    hideBanner();
    document.dispatchEvent(new CustomEvent("btt:cookies-rejected"));
  }

  function init() {
    buildBanner();
    /* Миграция: старый «rejected» больше не подавляет баннер. */
    try {
      if (localStorage.getItem(KEY) === "rejected") localStorage.removeItem(KEY);
    } catch (e) { /* ignore */ }
    if (!hasConsent()) showBanner();
    document.addEventListener("btt:lang", applyBannerText);
  }

  window.BTT_COOKIES = {
    hasConsent: hasConsent,
    needsConsent: needsConsent,
    guardedFetch: guardedFetch,
    accept: accept,
    reject: reject,
    showBanner: showBanner,
    isRequiredError: function (err) {
      return !!(err && err.code === "cookie_consent_required");
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
