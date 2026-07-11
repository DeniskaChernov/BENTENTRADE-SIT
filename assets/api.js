/* ============================================================
   BENTENTRADE — tiny front-end API client (same-origin Worker).
   All endpoints live under /api/* on the same domain, so there is
   no CORS and no base URL to configure. Every call degrades
   gracefully: if the backend is unavailable, callers fall back to
   the existing static behaviour.
   ============================================================ */
(function () {
  "use strict";

  const BASE = ""; // same origin

  async function request(path, opts) {
    if (window.BTT_COOKIES && !window.BTT_COOKIES.hasConsent()) {
      const err = new Error("cookie_consent_required");
      err.code = "cookie_consent_required";
      throw err;
    }
    opts = opts || {};
    const init = {
      method: opts.method || "GET",
      headers: {},
      credentials: "same-origin",
    };
    if (opts.body !== undefined) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    const res = await fetch(BASE + path, init);
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || ("HTTP " + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function lang() {
    const l = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(l) ? l : "ru";
  }

  window.BTT_API = {
    lang,
    request,
    get: (p) => request(p),
    post: (p, body) => request(p, { method: "POST", body }),
    put: (p, body) => request(p, { method: "PUT", body }),
    del: (p) => request(p, { method: "DELETE" }),

    // convenience wrappers
    contact: (payload) => request("/api/contact", { method: "POST", body: payload }),
    createOrder: (payload) => request("/api/orders", { method: "POST", body: payload }),
    products: (category) =>
      request("/api/products?lang=" + lang() + (category && category !== "all" ? "&category=" + encodeURIComponent(category) : "")),
    product: (id) => request("/api/products/" + encodeURIComponent(id) + "?lang=" + lang()),
    articles: () => request("/api/articles?lang=" + lang()),
    article: (slug) => request("/api/articles/" + encodeURIComponent(slug) + "?lang=" + lang()),

    // auth
    me: () => request("/api/auth/me"),
    login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
    register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
    logout: () => request("/api/auth/logout", { method: "POST" }),

    // account (auth required)
    myOrders: () => request("/api/orders"),
    updateProfile: (payload) => request("/api/account/profile", { method: "PUT", body: payload }),
    listAddresses: () => request("/api/account/addresses"),
    createAddress: (payload) => request("/api/account/addresses", { method: "POST", body: payload }),
    updateAddress: (id, payload) => request("/api/account/addresses/" + encodeURIComponent(id), { method: "PUT", body: payload }),
    deleteAddress: (id) => request("/api/account/addresses/" + encodeURIComponent(id), { method: "DELETE" }),
    getFavorites: () => request("/api/account/favorites"),
    putFavorites: (favorites) => request("/api/account/favorites", { method: "PUT", body: { favorites } }),
  };
})();
