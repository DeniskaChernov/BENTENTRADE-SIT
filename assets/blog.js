/* ============================================================
   BENTENTRADE — public articles/blog (list + single), API-driven.
   Falls back to a friendly empty state when the backend is offline.
   ============================================================ */
(function () {
  "use strict";

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
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function fmtDate(s) {
    try {
      const d = new Date(String(s || "").replace(" ", "T") + "Z");
      if (isNaN(d)) return "";
      const loc = lang() === "en" ? "en-GB" : lang() === "uz" ? "uz-UZ" : "ru-RU";
      return d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }
  function cover(media) {
    return media ? (media.indexOf("/") === 0 || media.indexOf("http") === 0 ? media : "/media/" + media) : "";
  }

  async function renderList(root) {
    if (!window.BTT_API) { root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return; }
    let res;
    try { res = await window.BTT_API.articles(); } catch (e) {
      root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return;
    }
    const list = (res && res.articles) || [];
    if (!list.length) { root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return; }
    root.innerHTML =
      '<div class="blog-grid">' +
      list.map((a) => {
        const img = cover(a.cover_media);
        return (
          '<a class="blog-card reveal" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
          (img ? '<div class="blog-card__img"><img src="' + esc(img) + '" alt="" loading="lazy"></div>' : "") +
          '<div class="blog-card__body"><div class="blog-card__date">' + esc(fmtDate(a.published_at)) + "</div>" +
          "<h3>" + esc(a.title || a.slug) + "</h3>" +
          (a.excerpt ? "<p>" + esc(a.excerpt) + "</p>" : "") +
          '<span class="blog-card__more">' + esc(t("blog.read")) + " →</span></div></a>"
        );
      }).join("") +
      "</div>";
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  async function renderSingle(root) {
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug || !window.BTT_API) { root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return; }
    let res;
    try { res = await window.BTT_API.article(slug); } catch (e) {
      root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return;
    }
    const a = res && res.article;
    if (!a) { root.innerHTML = '<p class="blog-empty">' + esc(t("blog.empty")) + "</p>"; return; }
    document.title = (a.title || "Bententrade") + " — Bententrade";
    const img = cover(a.cover_media);
    const bodyHtml = esc(a.body || "").split(/\n{2,}/).map((p) => "<p>" + p.replace(/\n/g, "<br>") + "</p>").join("");
    root.innerHTML =
      '<article class="article reveal">' +
      '<a class="article__back" href="blog.html">← ' + esc(t("blog.back")) + "</a>" +
      '<div class="article__date">' + esc(fmtDate(a.published_at)) + "</div>" +
      "<h1>" + esc(a.title || a.slug) + "</h1>" +
      (img ? '<div class="article__cover"><img src="' + esc(img) + '" alt=""></div>' : "") +
      '<div class="article__body">' + bodyHtml + "</div></article>";
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    const list = document.querySelector("[data-blog-list]");
    const single = document.querySelector("[data-blog-single]");
    if (list) renderList(list);
    if (single) renderSingle(single);
    document.querySelectorAll(".lang button").forEach((b) =>
      b.addEventListener("click", () => setTimeout(() => { if (list) renderList(list); if (single) renderSingle(single); }, 40)),
    );
  });
})();
