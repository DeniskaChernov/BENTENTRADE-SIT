/* ============================================================
   BENTENTRADE — site interactions
   ============================================================ */
(function(){
  const LANGS = ["ru","uz","en"];
  const dict = window.BTT_I18N || {};

  function getLang(){
    const saved = localStorage.getItem("btt_lang");
    return LANGS.includes(saved) ? saved : "ru";
  }

  function applyLang(lang){
    const d = dict[lang] || dict.ru;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if(d[key] == null) return;
      // support \n -> <br> for multiline labels
      if(d[key].includes("\n")){
        el.innerHTML = d[key].split("\n").map(s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))).join("<br>");
      } else {
        el.textContent = d[key];
      }
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const key = el.getAttribute("data-i18n-html");
      if(d[key] != null) el.innerHTML = d[key];
    });
    const docTitle = document.querySelector("title[data-i18n-doc]");
    if(docTitle){
      const k = docTitle.getAttribute("data-i18n-doc");
      if(d[k] != null) document.title = d[k];
    }
    document.querySelectorAll("[data-i18n-meta]").forEach(el=>{
      const key = el.getAttribute("data-i18n-meta");
      if(d[key] != null) el.setAttribute("content", d[key]);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
      const key = el.getAttribute("data-i18n-ph");
      if(d[key] != null) el.setAttribute("placeholder", d[key]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el=>{
      const key = el.getAttribute("data-i18n-aria");
      if(d[key] != null) el.setAttribute("aria-label", d[key]);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(el=>{
      const key = el.getAttribute("data-i18n-alt");
      if(d[key] != null) el.setAttribute("alt", d[key]);
    });
    // Give product images a meaningful alt from the visible product name
    // (covers static cards; JS-built cards set their own alt).
    document.querySelectorAll(".product__media img").forEach(img=>{
      const card = img.closest(".product, [data-product]");
      const nm = card && card.querySelector(".product__name");
      const txt = nm && nm.textContent.trim();
      if(txt) img.setAttribute("alt", txt);
    });
    document.querySelectorAll(".r-profile").forEach(card=>{
      const img = card.querySelector(".r-profile__media img");
      const color = card.querySelector(".r-profile__color");
      const art = card.querySelector(".r-profile__art b");
      if(!img || !color) return;
      const spec = d["pal.spec"] || "Полумесяц · 10 мм";
      img.setAttribute("alt", spec + " — " + color.textContent.trim() + (art ? " (" + art.textContent + ")" : ""));
    });
    document.querySelectorAll(".lang button").forEach(b=>{
      b.classList.toggle("is-active", b.dataset.lang === lang);
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
  }

  function setLang(lang){
    localStorage.setItem("btt_lang", lang);
    applyLang(lang);
    applyProductMeta();
    if(window.BTT_SEO) window.BTT_SEO.refresh(lang);
    document.dispatchEvent(new CustomEvent("btt:lang", { detail: { lang } }));
  }

  /* ---- cart + favorites are owned by cart.js (persistent drawers) ---- */

  /* ---- theme ---- */
  function getTheme(){ return localStorage.getItem("btt_theme") === "dark" ? "dark" : "light"; }
  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
  }
  function toggleTheme(){
    const next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem("btt_theme", next);
    applyTheme(next);
  }

  /* ---- scroll reveal (IntersectionObserver) + sibling stagger ---- */
  function initReveal(){
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll(".reveal"));

    const byParent = new Map();
    reveals.forEach(el=>{
      const p = el.parentElement;
      if(!p) return;
      if(!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(el);
    });
    byParent.forEach(list=>{
      if(list.length > 1) list.forEach((el,i)=>{ el.style.transitionDelay = Math.min(i*100, 560) + "ms"; });
    });

    const staggers = Array.from(document.querySelectorAll("[data-stagger]"));
    staggers.forEach(c=>{
      const step = parseFloat(c.dataset.stagger) || 110;
      Array.from(c.children).forEach((ch,i)=>{ ch.style.transitionDelay = (i*step) + "ms"; });
    });

    const targets = reveals.concat(staggers);
    if(reduced || !("IntersectionObserver" in window)){
      targets.forEach(el=>el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin:"0px 0px -6% 0px", threshold:0.08 });
    targets.forEach(el=>io.observe(el));
  }

  /* ---- page enter / leave fade between static pages ---- */
  function initPageTransitions(){
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("is-entering");
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=> document.body.classList.remove("is-entering"));
    });

    document.querySelectorAll("a[href]").forEach(a=>{
      const href = a.getAttribute("href");
      if(!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
      if(a.target === "_blank" || a.hasAttribute("download")) return;
      if(a.closest(".bot-panel") || a.closest(".search-ov")) return;
      a.addEventListener("click", e=>{
        if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(()=>{ location.href = href; }, 380);
      });
    });
  }

  /* ---- animate product cards when category chips change ---- */
  const CHIP_URL_ALIAS = { planter: "planterMix", basket: "planterMix" };
  const CHIP_CAT_GROUPS = {
    planterMix: ["planter", "basket"],
    rattan: ["furniture", "planter", "basket"],
    twisted: ["twisted"],
    "ind-storage": ["ind-cabinet", "ind-shelf"]
  };
  const HOME_SECTION_IDS = new Set([
    "product-lines", "home-collection",
    "rattan-collection", "indoor-collection"
  ]);

  function headOffset(){
    return (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--head-h"), 10) || 56) + 16;
  }

  function scrollToSection(id, instant){
    const el = document.getElementById(id);
    if(!el) return false;
    const top = el.getBoundingClientRect().top + window.scrollY - headOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: instant ? "auto" : "smooth" });
    return true;
  }

  function closeMobileNav(){
    const drawer = document.querySelector(".mobile-drawer");
    const burger = document.querySelector(".burger");
    if(!drawer || !drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if(burger) burger.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  }

  function cardMatchesCat(card, cat){
    if(cat === "all") return true;
    const groups = CHIP_CAT_GROUPS[cat];
    const c = card.dataset.cat || "";
    if(groups) return groups.includes(c);
    return c === cat;
  }

  function resolveChipCat(cat){
    return CHIP_URL_ALIAS[cat] || cat;
  }

  function updateCatCount(grid){
    const cnt = document.querySelector("[data-cat-count]");
    const empty = document.querySelector("[data-cat-empty]");
    if(!grid) return;
    const cards = Array.from(grid.querySelectorAll("[data-product]"));
    const shown = cards.filter(c=> c.style.display !== "none").length;
    if(cnt) cnt.textContent = String(shown);
    if(empty) empty.hidden = shown > 0;
  }

  function filterProducts(grid, cat){
    const cards = Array.from(grid.querySelectorAll("[data-product]"));
    const toShow = cards.filter(c=> cardMatchesCat(c, cat));
    const toHide = cards.filter(c=> !toShow.includes(c));

    toHide.forEach(card=>{
      card.classList.remove("is-filter-in");
      card.classList.add("is-filter-out");
      setTimeout(()=>{ card.style.display = "none"; card.classList.remove("is-filter-out"); updateCatCount(grid); }, 320);
    });

    toShow.forEach((card,i)=>{
      const wasHidden = card.style.display === "none";
      card.style.display = "";
      if(wasHidden){
        card.classList.remove("is-filter-in");
        void card.offsetWidth;
        card.style.animationDelay = (i*60) + "ms";
        card.classList.add("is-filter-in");
        card.addEventListener("animationend", ()=> card.classList.remove("is-filter-in"), { once:true });
      }
    });
    updateCatCount(grid);
  }

  /* ---- header condenses + frosts once you scroll past the top ---- */
  function initHeaderScroll(){
    const head = document.querySelector(".site-head");
    if(!head) return;
    let ticking = false;
    function apply(){
      head.classList.toggle("is-scrolled", window.scrollY > 10);
      document.documentElement.style.setProperty("--head-h", head.offsetHeight + "px");
      ticking = false;
    }
    window.addEventListener("resize", apply, { passive:true });
    window.addEventListener("scroll", ()=>{ if(!ticking){ ticking = true; requestAnimationFrame(apply); } }, { passive:true });
    apply();
  }

  /* ---- parallax: large banner images drift against the scroll ---- */
  function initParallax(){
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sel = ".promo img, .final img, .material__img img, .ab-story__img img, .page-hero__collage img";
    const items = Array.from(document.querySelectorAll(sel)).map(el=>({
      el,
      speed: parseFloat(el.dataset.parallax) || 0.14,
      scale: 1.16
    }));
    if(!items.length) return;
    items.forEach(it=>{ it.el.style.willChange = "transform"; });

    let ticking = false;
    function update(){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(it=>{
        const r = it.el.getBoundingClientRect();
        if(r.bottom < -240 || r.top > vh + 240) return;
        const center = r.top + r.height/2;
        const off = (center - vh/2) / vh;          // ~ -0.5 .. 0.5
        let y = -off * it.speed * vh;               // move opposite to scroll
        y = Math.max(-30, Math.min(30, y));
        it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + it.scale + ")";
      });
      ticking = false;
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll, { passive:true });
    update();
  }

  /* ---- count-up stat numbers (about page) ---- */
  function animateNum(el){
    const tn = Array.from(el.childNodes).find(n=>n.nodeType===3 && /\d/.test(n.textContent));
    if(!tn) return;
    const m = (tn.textContent||"").trim().match(/^(\d+)(\D*)$/);
    if(!m) return;
    const target = parseInt(m[1],10), unit = m[2]||"";
    const dur = 1100, t0 = performance.now();
    (function tick(now){
      const p = Math.min(1,(now-t0)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      tn.textContent = Math.round(target*eased) + unit;
      if(p < 1) requestAnimationFrame(tick); else tn.textContent = target + unit;
    })(t0);
  }
  function initCounters(){
    const nums = document.querySelectorAll(".ab-stat .n");
    if(!nums.length || !("IntersectionObserver" in window)) return;
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ io.unobserve(e.target); animateNum(e.target); } });
    }, { threshold:0.4 });
    nums.forEach(n=>io.observe(n));
  }

  function initCatToolbar(){
    const sentinel = document.querySelector(".cat-toolbar-sentinel");
    const bar = document.querySelector(".cat-toolbar");
    const head = document.querySelector(".site-head");
    if(!sentinel || !bar || !("IntersectionObserver" in window)) return;
    let io = null;
    function headOffset(){
      if(head) return head.offsetHeight;
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--head-h"));
      return Number.isFinite(v) ? v : 76;
    }
    function observe(){
      if(io) io.disconnect();
      io = new IntersectionObserver(([e])=>{
        bar.classList.toggle("is-stuck", !e.isIntersecting);
      }, { threshold:0, rootMargin: "-" + headOffset() + "px 0px 0px 0px" });
      io.observe(sentinel);
    }
    observe();
    if(head && "ResizeObserver" in window){
      new ResizeObserver(observe).observe(head);
    }
    window.addEventListener("resize", observe, { passive:true });
  }

  function initA11y(){
    const main = document.querySelector("main");
    if(main && !main.id) main.id = "main";

    const dict = window.BTT_I18N || {};
    const lang = document.documentElement.lang || "ru";
    const skipText = ((dict[lang] || dict.ru || {})["a11y.skip"]) || "К основному содержимому";
    let skip = document.querySelector(".skip-link");
    if(!skip){
      skip = document.createElement("a");
      skip.className = "skip-link";
      skip.href = "#main";
      skip.addEventListener("click", e=>{
        e.preventDefault();
        const target = document.getElementById("main");
        if(target){ target.setAttribute("tabindex","-1"); target.focus({ preventScroll:false }); }
      });
      document.body.insertBefore(skip, document.body.firstChild);
    }
    skip.textContent = skipText;

    document.querySelectorAll(".lang button").forEach(b=>{
      if(!b.hasAttribute("aria-pressed")){
        b.setAttribute("aria-pressed", b.classList.contains("is-active") ? "true" : "false");
      }
    });
  }

  function initLazyImages(){
    const bind = window.BTT_UTIL && window.BTT_UTIL.lazyBind;
    if(!bind) return;
    bind(document);
    if(!("MutationObserver" in window) || !document.body) return;
    const mo = new MutationObserver((muts)=>{
      muts.forEach((m)=>{
        m.addedNodes.forEach((n)=>{
          if(n.nodeType !== 1) return;
          bind(n);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function productIdFromCard(card){
    const see = card.querySelector("a[href*='product.html?id=']");
    const m = see && (see.getAttribute("href")||"").match(/id=(p\d+)/);
    return m ? m[1] : null;
  }

  function isMtoProduct(id){
    if(!id) return false;
    if(window.BTT_IS_MTO) return window.BTT_IS_MTO(id);
    const p = (window.BTT_PRODUCTS||{})[id];
    return !!(p && p.stock === 0);
  }

  function mtoMessage(name){
    const d = dict[getLang()] || dict.ru || {};
    const tpl = d["mto.msg"] || "Здравствуйте! Хочу заказать: {name}";
    return tpl.replace("{name}", name || "");
  }

  function openManagerChat(msg){
    const mgr = window.BTT_UTIL && window.BTT_UTIL.managerUrl;
    const url = mgr ? mgr(msg).telegram : "https://t.me/bententradeuz";
    window.open(url, "_blank", "noopener");
  }

  function applyProductMeta(root){
    const P = window.BTT_PRODUCTS || {};
    const fmt = window.BTT_UTIL && window.BTT_UTIL.formatMoney;
    if(!fmt) return;
    const scope = root || document;
    scope.querySelectorAll("[data-product]").forEach(card=>{
      const id = productIdFromCard(card);
      if(!id || !P[id]) return;
      const p = P[id];
      const now = card.querySelector(".price__now");
      const old = card.querySelector(".price__old");
      if(now) now.textContent = fmt(p.now);
      if(old){
        if(p.old){ old.textContent = fmt(p.old); old.style.display = ""; }
        else old.style.display = "none";
      }
      const media = card.querySelector(".product__media");
      if(!media) return;
      const mto = isMtoProduct(id);
      let badge = media.querySelector(".badge-mto");
      if(mto){
        if(!badge){
          badge = document.createElement("span");
          badge.className = "badge-mto";
          badge.setAttribute("data-i18n", "mto.badge");
          media.appendChild(badge);
        }
        const d = dict[getLang()] || dict.ru || {};
        badge.textContent = d["mto.badge"] || "На заказ";
        const add = media.querySelector("[data-add]");
        if(add){
          add.classList.add("add--mto");
          add.setAttribute("aria-label", (dict[getLang()]||dict.ru||{})["mto.card"] || "Сделать на заказ");
          if(!add.dataset.mtoWired){
            add.dataset.mtoWired = "1";
            add.addEventListener("click", e=>{
              e.preventDefault(); e.stopImmediatePropagation();
              const nm = (card.querySelector(".product__name")||{}).textContent || id;
              openManagerChat(mtoMessage(nm.trim()));
            }, true);
          }
        }
      } else if(badge){
        badge.remove();
        const add = media.querySelector("[data-add]");
        if(add) add.classList.remove("add--mto");
      }
    });
  }

  function initCustomOrder(){
    document.querySelectorAll("[data-mto-chat]").forEach(btn=>{
      if(btn.dataset.mtoChatWired) return;
      btn.dataset.mtoChatWired = "1";
      btn.addEventListener("click", e=>{
        e.preventDefault();
        const d = dict[getLang()] || dict.ru || {};
        openManagerChat(d["mto.banner.msg"] || "Здравствуйте! Не нашёл нужный ротанг — хочу сделать на заказ.");
      });
    });
  }

  window.BTT_applyProductMeta = applyProductMeta;

  function initFaq(){
    document.querySelectorAll("[data-faq] .faq-q").forEach(btn=>{
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.addEventListener("click", ()=>{
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        if(panel) panel.hidden = open;
      });
    });
  }

  function initMobileNav(){
    const burger = document.querySelector(".burger");
    const drawer = document.querySelector(".mobile-drawer");
    if(!burger || !drawer) return;
    if(!drawer.id) drawer.id = "mobile-nav";
    drawer.setAttribute("role", "navigation");
    drawer.setAttribute("aria-hidden", "true");
    const dict = window.BTT_I18N || {};
    const lng = document.documentElement.lang || "ru";
    drawer.setAttribute("aria-label", ((dict[lng] || dict.ru || {})["tool.menu"]) || "Меню");
    burger.setAttribute("aria-controls", drawer.id);
    burger.setAttribute("aria-expanded", "false");

    function setOpen(on){
      drawer.classList.toggle("open", on);
      burger.setAttribute("aria-expanded", on ? "true" : "false");
      drawer.setAttribute("aria-hidden", on ? "false" : "true");
      document.documentElement.style.overflow = on ? "hidden" : "";
    }

    burger.addEventListener("click", ()=> setOpen(!drawer.classList.contains("open")));
    drawer.querySelectorAll("a, .mobile-drawer__tool").forEach(a=> a.addEventListener("click", ()=> setOpen(false)));
    document.addEventListener("keydown", e=>{
      if(e.key === "Escape" && drawer.classList.contains("open")) setOpen(false);
    });
  }

  function initInPageNav(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      const href = a.getAttribute("href");
      if(!href || href === "#") return;
      const id = href.slice(1);
      if(!document.getElementById(id)) return;
      a.addEventListener("click", e=>{
        e.preventDefault();
        if(history.pushState) history.pushState(null, "", "#" + id);
        else location.hash = id;
        scrollToSection(id);
        closeMobileNav();
      });
    });

    const hash = (location.hash || "").replace("#", "");
    if(hash && HOME_SECTION_IDS.has(hash)){
      requestAnimationFrame(()=> setTimeout(()=> scrollToSection(hash, true), 100));
    }
  }

  /* ---- wire up on load ---- */
  document.addEventListener("DOMContentLoaded", function(){
    applyTheme(getTheme());
    applyLang(getLang());
    if(window.BTT_SEO) window.BTT_SEO.refresh(getLang());
    initA11y();
    initReveal();
    initParallax();
    initHeaderScroll();
    initCatToolbar();
    initCounters();
    initPageTransitions();
    initMobileNav();
    initInPageNav();
    initLazyImages();
    initFaq();
    applyProductMeta();
    initCustomOrder();

    document.querySelector("[data-cat-reset]")?.addEventListener("click", ()=>{
      document.querySelector('.cat-chips .chip[data-cat="all"]')?.click();
    });

    document.addEventListener("btt:related-rendered", (e)=>{
      const grid = e.detail && e.detail.grid;
      if(!grid) return;
      applyProductMeta(grid);
      const cards = Array.from(grid.querySelectorAll(".reveal"));
      const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduced || !("IntersectionObserver" in window)){
        cards.forEach(el=>el.classList.add("is-in"));
        if(window.BTT_syncFavs) window.BTT_syncFavs();
        return;
      }
      const step = parseFloat(grid.dataset.stagger) || 90;
      cards.forEach((el,i)=>{ el.style.transitionDelay = (i * step) + "ms"; });
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if(en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin:"0px 0px -6% 0px", threshold:0.08 });
      cards.forEach(el=>io.observe(el));
      if(window.BTT_syncFavs) window.BTT_syncFavs();
    });

    // theme toggle
    document.querySelectorAll("[data-theme-toggle]").forEach(b=>{
      b.addEventListener("click", toggleTheme);
    });

    // language buttons
    document.querySelectorAll(".lang button").forEach(b=>{
      b.addEventListener("click", ()=>{ setLang(b.dataset.lang); initA11y(); });
    });

    // add-to-cart & favorites are handled by cart.js

    const urlParams = new URLSearchParams(location.search);

    // legacy: twisted is a material, not a product category
    if(/catalog\.html$/i.test(location.pathname.split("/").pop() || "") && urlParams.get("cat") === "twisted"){
      location.replace("about.html");
      return;
    }

    let activeCat = "all";

    function getSearchQ(){
      return (urlParams.get("q") || "").toLowerCase().trim();
    }

    function applyCatalogFilters(grid, cat, q){
      const cards = Array.from(grid.querySelectorAll("[data-product]"));
      cards.forEach(card=>{
        const txt = (card.textContent || "").toLowerCase();
        const show = cardMatchesCat(card, cat) && (!q || txt.includes(q));
        card.style.display = show ? "" : "none";
      });
      updateCatCount(grid);
      const note = document.querySelector("[data-search-note]");
      if(note){
        if(q){
          const d = dict[getLang()] || dict.ru || {};
          const tpl = d["cat.searchNote"] || "«{q}» — {n}";
          const shown = cards.filter(c=> c.style.display !== "none").length;
          note.textContent = tpl.replace("{q}", urlParams.get("q") || "").replace("{n}", String(shown));
          note.style.display = "";
        } else {
          note.textContent = "";
          note.style.display = "none";
        }
      }
    }

    // category chips (catalog + home)
    document.querySelectorAll("[data-chips]").forEach(group=>{
      const chips = group.querySelectorAll(".chip");
      function activate(chip, opts){
        opts = opts || {};
        chips.forEach(c=>c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const cat = chip.dataset.cat;
        activeCat = cat;
        const grid = document.querySelector(group.dataset.target);
        const q = getSearchQ();
        if(grid){
          if(q && grid.id === "catalog-grid") applyCatalogFilters(grid, cat, q);
          else filterProducts(grid, cat);
        }
        if(chip.scrollIntoView && window.matchMedia && window.matchMedia("(max-width:720px)").matches){
          chip.scrollIntoView({ inline:"nearest", behavior: opts.instant ? "auto" : "smooth", block:"nearest" });
        }
        if(grid && window.matchMedia && window.matchMedia("(max-width:720px)").matches){
          const section = grid.closest("section[id]");
          if(section) setTimeout(()=> scrollToSection(section.id, true), opts.instant ? 0 : 340);
        }
        document.dispatchEvent(new CustomEvent("btt:cat-change", { detail:{ cat, chip } }));
      }
      chips.forEach(chip=> chip.addEventListener("click", ()=> activate(chip)));
      const qcat = urlParams.get("cat");
      if(qcat){
        const resolved = resolveChipCat(qcat);
        const match = Array.from(chips).find(c=>c.dataset.cat===resolved);
        if(match) activate(match, { instant:true });
        else document.dispatchEvent(new CustomEvent("btt:cat-change", { detail:{ cat: resolved } }));
      } else {
        const hash = (location.hash || "").replace("#","");
        if(hash && !HOME_SECTION_IDS.has(hash) && !document.getElementById(hash)){
          const resolved = resolveChipCat(hash);
          const match = Array.from(chips).find(c=>c.dataset.cat===resolved);
          if(match) activate(match, { instant:true });
        } else if(getSearchQ()){
          const grid = document.querySelector(group.dataset.target);
          if(grid && grid.id === "catalog-grid") applyCatalogFilters(grid, activeCat, getSearchQ());
        }
      }
    });

    // contact form
    const form = document.querySelector("[data-contact-form]");
    if(form){
      const ok = form.querySelector("[data-form-ok]");
      const err = form.querySelector("[data-form-err]");
      const submitBtn = form.querySelector("[data-contact-submit]");
      const dict = window.BTT_I18N || {};
      const errMsg = ()=>{
        const l = document.documentElement.lang || "ru";
        const d = dict[l] || dict.ru || {};
        return d["co.f.err"] || "Please check your name and email.";
      };
      form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        form.querySelectorAll(".field").forEach(f=>f.classList.remove("is-invalid"));
        if(err){ err.hidden = true; err.classList.remove("show"); err.textContent = ""; }
        const name = form.querySelector("[name='name']");
        const email = form.querySelector("[name='email']");
        const phone = form.querySelector("[name='phone']");
        const message = form.querySelector("[name='message']");
        let valid = true;
        if(!name || !name.value.trim()){ name && name.closest(".field")?.classList.add("is-invalid"); valid = false; }
        if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
          email && email.closest(".field")?.classList.add("is-invalid"); valid = false;
        }
        if(!valid){
          if(err){ err.textContent = errMsg(); err.hidden = false; err.classList.add("show"); }
          return;
        }

        const payload = {
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone ? phone.value.trim() : "",
          message: message ? message.value.trim() : "",
          lang: document.documentElement.lang || "ru",
        };

        if(submitBtn) submitBtn.disabled = true;

        const done = ()=>{
          if(ok){ ok.classList.add("show"); }
          form.reset();
          setTimeout(()=>{
            if(ok) ok.classList.remove("show");
            if(submitBtn) submitBtn.disabled = false;
          }, 5000);
        };
        const fail = ()=>{
          if(err){ err.textContent = errMsg(); err.hidden = false; err.classList.add("show"); }
          if(submitBtn) submitBtn.disabled = false;
        };

        // Send to the backend when available; otherwise keep the graceful
        // confirmation so the static site still "works".
        if(window.BTT_API){
          try{
            await window.BTT_API.contact(payload);
            done();
          }catch(ex){
            if(ex && ex.status === 422){ fail(); }
            else { done(); } // network/backend down — don't punish the visitor
          }
        } else {
          done();
        }
      });
    }
  });
})();
