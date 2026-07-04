/* ============================================================
   BENTENTRADE — login / register page controller.
   ============================================================ */
(function () {
  "use strict";
  if (!window.BTT_API) return;

  function lang() {
    const s = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(s) ? s : "ru";
  }
  function t(k) {
    const I = window.BTT_I18N || {};
    const d = I[lang()] || {};
    if (d[k] != null) return d[k];
    const ru = I.ru || {};
    return ru[k] != null ? ru[k] : k;
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const tabsWrap = document.querySelector("[data-auth-tabs]");
    if (!tabsWrap) return;

    // Already signed in → straight to the account.
    try {
      const me = await window.BTT_API.me();
      if (me && me.user) { window.location.replace("account.html"); return; }
    } catch (e) { /* backend offline — stay on the form */ }

    const tabs = tabsWrap.querySelectorAll("[data-auth-tab]");
    const forms = document.querySelectorAll("[data-auth-form]");
    function showTab(name) {
      tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.authTab === name));
      forms.forEach((f) => f.classList.toggle("is-active", f.dataset.authForm === name));
    }
    tabs.forEach((b) => b.addEventListener("click", () => showTab(b.dataset.authTab)));

    function errText(err) {
      const code = (err && err.data && err.data.error) || "";
      const map = {
        invalid_credentials: "auth.err.creds",
        invalid_email: "auth.err.email",
        weak_password: "auth.err.weak",
        email_taken: "auth.err.taken",
        invalid_phone: "auth.err.phone",
        rate_limited: "auth.err.rate",
      };
      return t(map[code] || "auth.err.generic");
    }

    async function afterAuth() {
      // Push any locally-saved favourites up to the account, then leave.
      try {
        const favs = JSON.parse(localStorage.getItem("btt_favs") || "{}");
        const ids = Object.keys(favs || {});
        if (ids.length) await window.BTT_API.putFavorites(ids);
      } catch (e) { /* non-fatal */ }
      window.location.replace("account.html");
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function fail(err, key) { err.textContent = t(key); err.hidden = false; return false; }

    const loginForm = document.querySelector('[data-auth-form="login"]');
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const err = loginForm.querySelector("[data-auth-err]");
      err.hidden = true;
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      // Client-side validation before hitting the API.
      if (!email || !password) return fail(err, "auth.err.required");
      if (!EMAIL_RE.test(email)) return fail(err, "auth.err.email");
      const submit = loginForm.querySelector('[type="submit"]');
      if (submit) submit.disabled = true;
      try {
        await window.BTT_API.login(email, password);
        await afterAuth();
      } catch (ex) {
        err.textContent = errText(ex);
        err.hidden = false;
        if (submit) submit.disabled = false;
      }
    });

    const regForm = document.querySelector('[data-auth-form="register"]');
    regForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const err = regForm.querySelector("[data-auth-err]");
      err.hidden = true;
      const payload = {
        name: regForm.name.value.trim(),
        email: regForm.email.value.trim(),
        phone: regForm.phone.value.trim(),
        password: regForm.password.value,
      };
      // Client-side validation before hitting the API.
      if (!EMAIL_RE.test(payload.email)) return fail(err, "auth.err.email");
      if ((payload.password || "").length < 8) return fail(err, "auth.err.weak");
      const submit = regForm.querySelector('[type="submit"]');
      if (submit) submit.disabled = true;
      try {
        await window.BTT_API.register(payload);
        await afterAuth();
      } catch (ex) {
        err.textContent = errText(ex);
        err.hidden = false;
        if (submit) submit.disabled = false;
      }
    });
  });
})();
