/* ============================================================
   BENTENTRADE — public articles/blog (list + single), API-driven.
   Loading / empty / error states; SEO meta on article pages.
   ============================================================ */
(function () {
  "use strict";

  const U = window.BTT_UTIL || {};
  const lang = U.lang || function () {
    const s = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(s) ? s : "ru";
  };
  const t = U.t || function (k) {
    const I = window.BTT_I18N || {};
    const d = I[lang()] || {};
    if (d[k] != null) return d[k];
    const ru = I.ru || {};
    return ru[k] != null ? ru[k] : k;
  };
  const esc = U.esc || function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  };

  const SITE = "https://bententrade.uz";
  let staticArticles = null;

  async function loadStaticArticles() {
    if (staticArticles) return staticArticles;
    try {
      const res = await (window.BTT_COOKIES && window.BTT_COOKIES.guardedFetch
        ? window.BTT_COOKIES.guardedFetch("data/articles.json", { cache: "no-cache" })
        : fetch("data/articles.json", { cache: "no-cache" }));
      if (!res.ok) return [];
      const data = await res.json();
      staticArticles = (data && data.articles) || [];
      return staticArticles;
    } catch (e) { return []; }
  }

  function localizeArticle(a) {
    const loc = (a.i18n && (a.i18n[lang()] || a.i18n.ru)) || {};
    return {
      slug: a.slug,
      published_at: a.published_at,
      cover_media: a.cover_media,
      title: loc.title || a.slug,
      excerpt: loc.excerpt || "",
      body: loc.body || "",
    };
  }

  async function fetchArticles() {
    if (window.BTT_API) {
      try {
        const res = await window.BTT_API.articles();
        const list = (res && res.articles) || [];
        if (list.length) return list;
      } catch (e) { /* fallback below */ }
    }
    const raw = await loadStaticArticles();
    return raw.map(localizeArticle);
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

  function setMeta(name, content, attr) {
    attr = attr || "name";
    if (!content) return;
    let el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setCanonical(href) {
    if (!href) return;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function showState(root, kind, retryFn) {
    if (kind === "loading") {
      root.innerHTML = '<p class="blog-state blog-state--loading" aria-live="polite">' + esc(t("blog.loading")) + "</p>";
      return;
    }
    if (kind === "error") {
      root.innerHTML =
        '<div class="blog-state blog-state--error">' +
        '<p>' + esc(t("blog.error")) + "</p>" +
        '<button type="button" class="btn btn--ghost btn--sm" data-blog-retry>' + esc(t("blog.retry")) + "</button></div>";
      root.querySelector("[data-blog-retry]")?.addEventListener("click", retryFn);
      return;
    }
    root.innerHTML = '<p class="blog-state blog-state--empty">' + esc(t("blog.empty")) + "</p>";
  }

  async function renderList(root) {
    showState(root, "loading");
    let list;
    try { list = await fetchArticles(); } catch (e) {
      showState(root, "error", () => renderList(root));
      return;
    }
    if (!list.length) { showState(root, "empty"); return; }
    root.innerHTML =
      '<div class="blog-grid">' +
      list.map((a) => {
        const img = cover(a.cover_media);
        const title = a.title || a.slug || "";
        return (
          '<a class="blog-card reveal" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
          (img ? '<div class="blog-card__img"><img src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy"></div>' : "") +
          '<div class="blog-card__body"><div class="blog-card__date">' + esc(fmtDate(a.published_at)) + "</div>" +
          "<h3>" + esc(title) + "</h3>" +
          (a.excerpt ? "<p>" + esc(a.excerpt) + "</p>" : "") +
          '<span class="blog-card__more">' + esc(t("blog.read")) + " →</span></div></a>"
        );
      }).join("") +
      "</div>";
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  async function renderSingle(root) {
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) { showState(root, "empty"); return; }
    showState(root, "loading");
    let a = null;
    if (window.BTT_API) {
      try {
        const res = await window.BTT_API.article(slug);
        a = res && res.article;
      } catch (e) { /* static fallback */ }
    }
    if (!a) {
      const raw = await loadStaticArticles();
      const found = raw.find((x) => x.slug === slug);
      if (found) a = localizeArticle(found);
    }
    if (!a) {
      root.innerHTML = '<p class="blog-state blog-state--empty">' + esc(t("blog.notFound")) + "</p>";
      return;
    }

    const title = a.title || a.slug || "Bententrade";
    const desc = (a.excerpt || "").slice(0, 160) || t("blog.sub");
    const pageUrl = SITE + "/article.html?slug=" + encodeURIComponent(a.slug);
    document.title = title + " — Bententrade";
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", pageUrl, "property");
    setCanonical(pageUrl);
    const kwTpl = t("meta.article.keywords") || "{title}, rotang, bententrade";
    const kw = kwTpl.replace(/\{title\}/g, title).slice(0, 200);
    setMeta("keywords", kw);

    const SEO = window.BTT_SEO || {};
    if (SEO.injectJsonLd) {
      SEO.injectJsonLd("btt-page-bc", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("pdp.crumb.home") || "Главная", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: t("nav.blog") || "Статьи", item: SITE + "/blog.html" },
          { "@type": "ListItem", position: 3, name: title, item: pageUrl },
        ],
      });
    }

    const img = cover(a.cover_media);
    if (img) {
      const abs = img.indexOf("http") === 0 ? img : SITE + img;
      setMeta("og:image", abs, "property");
    }

    const bodyHtml = esc(a.body || "").split(/\n{2,}/).map((p) => "<p>" + p.replace(/\n/g, "<br>") + "</p>").join("");
    let schemaEl = document.getElementById("article-schema");
    if (!schemaEl) {
      schemaEl = document.createElement("script");
      schemaEl.type = "application/ld+json";
      schemaEl.id = "article-schema";
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": desc,
      "datePublished": a.published_at || "",
      "author": { "@type": "Organization", "name": "Bententrade" },
      "publisher": {
        "@type": "Organization",
        "name": "Bententrade",
        "logo": { "@type": "ImageObject", "url": SITE + "/assets/btt-logo.png" },
      },
      "mainEntityOfPage": pageUrl,
      "image": img ? (img.indexOf("http") === 0 ? img : SITE + "/" + img.replace(/^\//, "")) : SITE + "/assets/btt-logo.png",
    });
    root.innerHTML =
      '<article class="article reveal">' +
      '<a class="article__back" href="blog.html">← ' + esc(t("blog.back")) + "</a>" +
      '<div class="article__date">' + esc(fmtDate(a.published_at)) + "</div>" +
      "<h1>" + esc(title) + "</h1>" +
      (img ? '<div class="article__cover"><img src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy" decoding="async"></div>' : "") +
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
    document.addEventListener("btt:lang", () => {
      if (list) renderList(list);
      if (single) renderSingle(single);
    });
    document.addEventListener("btt:cookies-accepted", () => {
      staticArticles = null;
      if (list) renderList(list);
      if (single) renderSingle(single);
    });
  });
})();
