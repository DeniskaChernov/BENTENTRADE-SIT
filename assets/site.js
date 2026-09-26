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
      if(d[key] == null) return;
      const raw = String(d[key]);
      el.innerHTML = raw
        .replace(/<script\b[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
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
    document.querySelectorAll(".quickview-btn").forEach(btn=>{
      const qvLabel = d["quickview.btn"] || "Быстрый просмотр";
      btn.setAttribute("aria-label", qvLabel);
      const span = btn.querySelector("span");
      if(span) span.textContent = qvLabel;
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

  /* ---- page transitions (native 2026 View Transitions with fallback) ---- */
  function initPageTransitions(){
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Modern browsers support @view-transition { navigation: auto; } natively on compositor thread
    if("onpagereveal" in window || (window.CSS && CSS.supports("view-transition-name", "root"))){
      return;
    }

    document.body.classList.add("is-entering");
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=> document.body.classList.remove("is-entering"));
    });

    document.querySelectorAll("a[href]").forEach(a=>{
      const href = a.getAttribute("href");
      if(!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
      if(a.target === "_blank" || a.hasAttribute("download")) return;
      if(a.closest(".bot-panel") || a.closest(".search-ov") || a.closest(".cookie-banner") || a.closest(".drawer") || a.closest(".mobile-drawer")) return;
      a.addEventListener("click", e=>{
        if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(()=>{ location.href = href; }, 160);
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
    const mobCnt = document.querySelector("[data-mob-count]");
    const empty = document.querySelector("[data-cat-empty]");
    if(!grid) return;
    const cards = Array.from(grid.querySelectorAll("[data-product]"));
    const shown = cards.filter(c=> c.style.display !== "none").length;
    if(cnt) cnt.textContent = String(shown);
    if(mobCnt) mobCnt.textContent = String(shown);
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
    if(card.dataset && card.dataset.slug) return card.dataset.slug;
    if(card.dataset && card.dataset.id) return card.dataset.id;
    const see = card.querySelector("a[href*='product.html?id='], a[href*='/catalog/']");
    if(!see) return null;
    const href = see.getAttribute("href") || "";
    const m = href.match(/[?&]id=([^&#]+)/);
    if(m) return decodeURIComponent(m[1]);
    const m2 = href.match(/\/catalog\/([^/?#]+)/);
    if(m2) return decodeURIComponent(m2[1]);
    return null;
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
      const item = btn.closest(".faq-item");
      btn.addEventListener("click", ()=>{
        const open = btn.getAttribute("aria-expanded") === "true";
        const next = !open;
        btn.setAttribute("aria-expanded", next ? "true" : "false");
        if(item) item.classList.toggle("is-open", next);
        if(window.navigator && window.navigator.vibrate) try{ window.navigator.vibrate(8); }catch(_){}
        if(panel){
          if(next){
            panel.removeAttribute("hidden");
          } else {
            const onEnd = (e)=>{
              if(e.target === panel && btn.getAttribute("aria-expanded") === "false"){
                panel.setAttribute("hidden", "");
                panel.removeEventListener("transitionend", onEnd);
              }
            };
            panel.addEventListener("transitionend", onEnd);
            setTimeout(()=>{
              if(btn.getAttribute("aria-expanded") === "false") panel.setAttribute("hidden", "");
            }, 360);
          }
        }
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

    let scrim = document.querySelector(".nav-scrim");
    if(!scrim){
      scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      scrim.setAttribute("aria-hidden", "true");
      document.body.appendChild(scrim);
      scrim.addEventListener("click", ()=> setOpen(false));
    }

    let closeBtn = drawer.querySelector(".mobile-drawer__close");
    if(!closeBtn){
      closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "mobile-drawer__close";
      closeBtn.setAttribute("aria-label", ((dict[lng] || dict.ru || {})["bot.aria.close"]) || "Закрыть");
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      drawer.prepend(closeBtn);
    }
    closeBtn.addEventListener("click", () => setOpen(false));

    const links = Array.from(drawer.querySelectorAll(":scope > a"));
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setOpen(on){
      drawer.classList.toggle("open", on);
      burger.setAttribute("aria-expanded", on ? "true" : "false");
      drawer.setAttribute("aria-hidden", on ? "false" : "true");
      scrim.classList.toggle("on", on);
      scrim.setAttribute("aria-hidden", on ? "false" : "true");
      document.documentElement.style.overflow = on ? "hidden" : "";
      if(!reduced){
        links.forEach((a,i)=>{
          a.style.transitionDelay = on ? (60 + i * 45) + "ms" : "0ms";
        });
      }
    }

    burger.addEventListener("click", ()=> setOpen(!drawer.classList.contains("open")));
    drawer.querySelectorAll("a, .mobile-drawer__tool").forEach(a=> a.addEventListener("click", ()=> setOpen(false)));
    document.addEventListener("keydown", e=>{
      if(e.key === "Escape" && drawer.classList.contains("open")) setOpen(false);
    });

    let sx = 0, sy = 0, dx = 0, startTime = 0, isDragging = false, isHoriz = null;
    drawer.addEventListener("touchstart", e => {
      if(e.touches.length !== 1 || !drawer.classList.contains("open")) return;
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY; dx = 0;
      startTime = performance.now();
      isDragging = false; isHoriz = null;
    }, { passive: true });

    drawer.addEventListener("touchmove", e => {
      if(e.touches.length !== 1 || !drawer.classList.contains("open")) return;
      const t = e.touches[0];
      const diffX = t.clientX - sx;
      const diffY = t.clientY - sy;
      if(isHoriz === null){
        if(Math.abs(diffX) > 8 || Math.abs(diffY) > 8){
          isHoriz = Math.abs(diffX) > Math.abs(diffY);
        }
      }
      if(!isHoriz) return;
      if(diffX > 0){
        dx = diffX;
        drawer.style.transform = "translateX(" + dx + "px)";
        drawer.style.transition = "none";
        if(scrim) scrim.style.opacity = String(Math.max(0, 1 - dx / drawer.offsetWidth));
        isDragging = true;
      } else {
        dx = diffX * 0.2;
        drawer.style.transform = "translateX(" + dx + "px)";
        drawer.style.transition = "none";
      }
    }, { passive: true });

    drawer.addEventListener("touchend", () => {
      if(!isDragging){
        drawer.style.transform = "";
        drawer.style.transition = "";
        if(scrim) scrim.style.opacity = "";
        return;
      }
      const dt = Math.max(1, performance.now() - startTime);
      const vx = dx / dt;
      drawer.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)";
      if(scrim) scrim.style.transition = "opacity 0.32s ease";

      if(dx > drawer.offsetWidth * 0.28 || (vx > 0.3 && dx > 35)){
        drawer.style.transform = "translateX(100%)";
        if(scrim) scrim.style.opacity = "0";
        setTimeout(() => {
          drawer.style.transform = "";
          drawer.style.transition = "";
          if(scrim){ scrim.style.opacity = ""; scrim.style.transition = ""; }
          setOpen(false);
        }, 320);
      } else {
        drawer.style.transform = "translateX(0)";
        if(scrim) scrim.style.opacity = "1";
        setTimeout(() => {
          drawer.style.transform = "";
          drawer.style.transition = "";
          if(scrim){ scrim.style.opacity = ""; scrim.style.transition = ""; }
        }, 320);
      }
      isDragging = false;
      isHoriz = null;
    }, { passive: true });
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

  /* ================= QUICK VIEW MODAL ================= */
  let qvScrim = null, qvModal = null, lastQvFocus = null;
  function buildQuickViewShell(){
    if(qvModal) return;
    qvScrim = document.createElement("div");
    qvScrim.className = "qv-scrim";
    qvScrim.setAttribute("aria-hidden", "true");
    qvScrim.addEventListener("click", closeQuickView);

    qvModal = document.createElement("aside");
    qvModal.className = "qv-modal";
    qvModal.setAttribute("aria-hidden", "true");
    qvModal.setAttribute("role", "dialog");
    qvModal.setAttribute("aria-modal", "true");

    document.body.appendChild(qvScrim);
    document.body.appendChild(qvModal);

    document.addEventListener("keydown", e=>{
      if(e.key === "Escape" && qvModal.classList.contains("on")) closeQuickView();
    });
  }

  function closeQuickView(){
    if(!qvModal) return;
    qvScrim.classList.remove("on");
    qvModal.classList.remove("on");
    qvScrim.setAttribute("aria-hidden", "true");
    qvModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if(lastQvFocus && typeof lastQvFocus.focus === "function"){
      try{ lastQvFocus.focus(); }catch(_){}
      lastQvFocus = null;
    }
  }

  function openQuickView(pid){
    lastQvFocus = document.activeElement;
    buildQuickViewShell();
    const P = window.BTT_PRODUCTS || {};
    const prod = P[pid];
    if(!prod) return;

    const l = getLang();
    const d = dict[l] || dict.ru || {};
    const t = k => d[k] || (dict.ru||{})[k] || k;
    const esc = s => (window.BTT_UTIL && window.BTT_UTIL.esc) ? window.BTT_UTIL.esc(s) : String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const fmt = (n) => (window.BTT_UTIL && window.BTT_UTIL.formatMoney) ? window.BTT_UTIL.formatMoney(n) : String(n);

    const name = t(pid + ".name") || pid;
    const cat = t(pid + ".cat") || prod.cat;
    const CATTEXT = window.BTT_PRODUCT_CAT || {};
    const cInfo = CATTEXT[prod.cat] || CATTEXT.furniture || {};
    const cDesc = (cInfo[l] || cInfo.ru || {}).desc || "";
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(pid) : null;
    const photos = imgs && imgs.length ? imgs : [{ thumb: "assets/hero-garden-furniture.png", full: "assets/hero-garden-furniture.png" }];

    const oldPriceHtml = prod.old ? '<span class="old">' + esc(fmt(prod.old)) + '</span>' : '';
    const isMto = window.BTT_IS_MTO ? window.BTT_IS_MTO(pid) : prod.stock === 0;

    let thumbsHtml = photos.map((im, i)=>
      '<button type="button" class="qv-thumb' + (i === 0 ? ' is-active' : '') + '" data-qv-thumb="' + i + '" aria-label="Фото ' + (i + 1) + '">' +
        '<img src="' + esc(im.thumb) + '" alt="">' +
      '</button>'
    ).join("");

    let stagesHtml = photos.map((im, i)=>
      '<img src="' + esc(im.full) + '" alt="" class="' + (i === 0 ? 'is-on' : '') + '" style="' + (i === 0 ? '' : 'display:none;opacity:0;') + '">'
    ).join("");

    qvModal.innerHTML =
      '<button type="button" class="qv-close" data-qv-close aria-label="' + esc(t("quickview.close") || "Закрыть") + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<div class="qv-grid">' +
        '<div class="qv-gallery">' +
          '<div class="qv-stage" data-qv-stage>' + stagesHtml + '</div>' +
          '<div class="qv-thumbs">' + thumbsHtml + '</div>' +
        '</div>' +
        '<div class="qv-info">' +
          '<div class="qv-cat">' + esc(cat) + '</div>' +
          '<h3 class="qv-name">' + esc(name) + '</h3>' +
          '<div class="qv-price">' +
            '<span class="now">' + esc(fmt(prod.now)) + '</span>' +
            oldPriceHtml +
          '</div>' +
          '<p class="qv-desc">' + esc(cDesc) + '</p>' +
          '<div class="qv-actions">' +
            (isMto
              ? '<a class="btn btn--copper" href="product.html?id=' + esc(pid) + '">' + esc(t("pdp.sticky.order") || "Сделать на заказ") + '</a>'
              : '<button type="button" class="btn btn--dark" data-qv-add>' + esc(t("pdp.add") || "Добавить в корзину") + '</button>' +
                '<button type="button" class="btn btn--copper" data-qv-quick-buy>' + esc(t("pdp.quickBuy") || "Купить в 1 клик") + '</button>'
            ) +
          '</div>' +
          '<a class="qv-full-link" href="product.html?id=' + esc(pid) + '">' +
            '<span>' + esc(t("quickview.full") || "Перейти к товару") + '</span> &rarr;' +
          '</a>' +
        '</div>' +
      '</div>';

    // wire thumbnail clicks
    const qvStageImgs = Array.from(qvModal.querySelectorAll("[data-qv-stage] img"));
    const qvThumbBtns = Array.from(qvModal.querySelectorAll("[data-qv-thumb]"));
    qvThumbBtns.forEach((btn, i)=>{
      btn.addEventListener("click", ()=>{
        qvThumbBtns.forEach(b=>b.classList.remove("is-active"));
        btn.classList.add("is-active");
        qvStageImgs.forEach((img, k)=>{
          if(k === i){
            img.style.display = "";
            img.classList.add("is-on");
            img.style.opacity = "1";
          } else {
            img.style.display = "none";
            img.classList.remove("is-on");
            img.style.opacity = "0";
          }
        });
      });
    });

    // wire close button
    const closeBtn = qvModal.querySelector("[data-qv-close]");
    if(closeBtn) closeBtn.addEventListener("click", closeQuickView);

    // wire add to cart
    const addBtn = qvModal.querySelector("[data-qv-add]");
    if(addBtn){
      addBtn.addEventListener("click", (e)=>{
        if(window.BTT_CART && window.BTT_CART.addToCart){
          const snap = {
            id: pid,
            name: name,
            price: (window.BTT_UTIL && window.BTT_UTIL.toUzs) ? window.BTT_UTIL.toUzs(prod.now) : Math.round(prod.now * 12500),
            img: photos[0].thumb
          };
          window.BTT_CART.addToCart(snap, 1);
          addBtn.textContent = t("pdp.added") || "Добавлено ✓";
          addBtn.classList.add("added");
          if(navigator.vibrate) try{ navigator.vibrate(20); }catch(_){}
          if(window.BTT_FX && window.BTT_FX.burstParticles && e.clientX && e.clientY){
            window.BTT_FX.burstParticles(e.clientX, e.clientY, 8);
          }
          setTimeout(()=>{
            closeQuickView();
          }, 600);
        }
      });
    }

    // wire 1-click buy
    const qkBtn = qvModal.querySelector("[data-qv-quick-buy]");
    if(qkBtn){
      qkBtn.addEventListener("click", ()=>{
        const snap = {
          id: pid,
          name: name,
          price: (window.BTT_UTIL && window.BTT_UTIL.toUzs) ? window.BTT_UTIL.toUzs(prod.now) : Math.round(prod.now * 12500),
          img: photos[0].thumb,
          qty: 1
        };
        closeQuickView();
        if(window.BTT_CART && window.BTT_CART.openQuickOrder){
          window.BTT_CART.openQuickOrder(snap);
        }
      });
    }

    qvScrim.classList.add("on");
    qvModal.classList.add("on");
    qvScrim.setAttribute("aria-hidden", "false");
    qvModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(()=>{
      const focusTarget = qvModal.querySelector("[data-qv-close], [data-qv-add], button");
      if(focusTarget) focusTarget.focus();
    }, 50);
  }

  function wireQuickViewTriggers(root){
    const scope = root || document;
    scope.querySelectorAll(".product[data-product]").forEach(card=>{
      const see = card.querySelector("a.see, a[href*='product.html?id=']");
      if(!see) return;
      const m = (see.getAttribute("href")||"").match(/[?&]id=([^&#]+)/);
      if(!m) return;
      const pid = decodeURIComponent(m[1]);

      const media = card.querySelector(".product__media");
      if(media && !media.querySelector(".quickview-btn")){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quickview-btn";
        btn.setAttribute("data-quickview", pid);
        const d = dict[getLang()] || dict.ru || {};
        const qvLabel = d["quickview.btn"] || "Быстрый просмотр";
        btn.setAttribute("aria-label", qvLabel);
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>' + qvLabel + '</span>';
        media.appendChild(btn);
      }
    });

    scope.querySelectorAll("[data-quickview]").forEach(btn=>{
      if(btn.dataset.qvWired) return;
      btn.dataset.qvWired = "1";
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        e.stopPropagation();
        openQuickView(btn.dataset.quickview);
      });
    });
  }

  /* ---- catalog mobile sidebar drawer ---- */
  function initCatalogSidebarDrawer(){
    const trigger = document.querySelector("[data-cat-sidebar-trigger]");
    const sidebar = document.querySelector("#catalog-sidebar");
    const scrim = document.querySelector("[data-cat-sidebar-scrim]");
    const closeBtn = document.querySelector("[data-cat-sidebar-close]");
    if(!sidebar) return;

    function open(){
      sidebar.classList.add("is-open");
      if(scrim) scrim.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if(trigger) trigger.setAttribute("aria-expanded", "true");
      if(closeBtn) setTimeout(()=> closeBtn.focus(), 150);
    }
    function close(){
      sidebar.classList.remove("is-open");
      if(scrim) scrim.classList.remove("is-open");
      document.body.style.overflow = "";
      if(trigger){
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    }

    if(trigger) trigger.addEventListener("click", open);
    if(closeBtn) closeBtn.addEventListener("click", close);
    if(scrim) scrim.addEventListener("click", close);

    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape" && sidebar.classList.contains("is-open")){
        close();
      }
    });

    // Mobile swipe left to dismiss drawer
    let startX = 0, startY = 0;
    sidebar.addEventListener("touchstart", (e)=>{
      if(!e.touches || !e.touches[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    sidebar.addEventListener("touchend", (e)=>{
      if(!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if(dx < -45 && Math.abs(dx) > Math.abs(dy) * 1.2){
        close();
      }
    }, { passive: true });

    const chips = sidebar.querySelectorAll(".chip");
    chips.forEach(c=>{
      c.addEventListener("click", ()=>{
        if(window.matchMedia && window.matchMedia("(max-width: 959px)").matches){
          setTimeout(close, 240);
        }
      });
    });
  }

  /* ---- dynamic CMS settings hydration (phone, email, socials) ---- */
  function applySiteSettings(s){
    if(!s || typeof s !== "object") return;
    if(s.phone){
      const rawPhone = String(s.phone).trim();
      const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
      document.querySelectorAll('a[href^="tel:"]').forEach(el=>{
        el.href = "tel:" + cleanPhone;
        if(el.children.length === 0){
          el.textContent = rawPhone;
        } else {
          for(const node of el.childNodes){
            if(node.nodeType === Node.TEXT_NODE && node.nodeValue && /\+?\d[\d\s-]{5,}/.test(node.nodeValue)){
              node.nodeValue = " " + rawPhone;
            }
          }
        }
      });
      document.querySelectorAll("[data-btt-phone]").forEach(el=> el.textContent = rawPhone);
    }
    if(s.email){
      const email = String(s.email).trim();
      document.querySelectorAll('a[href^="mailto:"]').forEach(el=>{
        el.href = "mailto:" + email;
        if(el.children.length === 0){
          el.textContent = email;
        }
      });
      document.querySelectorAll("[data-btt-email]").forEach(el=> el.textContent = email);
    }
    if(s.telegram){
      const tg = String(s.telegram).trim().replace(/^@/, "");
      document.querySelectorAll('a[href*="t.me/"]').forEach(el=>{
        el.href = "https://t.me/" + tg;
      });
    }
    if(s.whatsapp){
      const wa = String(s.whatsapp).trim().replace(/[^\d]/g, "");
      document.querySelectorAll('a[href*="wa.me/"]').forEach(el=>{
        el.href = "https://wa.me/" + wa;
      });
    }
  }

  function hydrateSiteSettings(){
    try {
      const cached = sessionStorage.getItem("btt_settings");
      if(cached) applySiteSettings(JSON.parse(cached));
    } catch(e){}

    if(window.BTT_API && typeof window.BTT_API.settings === "function"){
      window.BTT_API.settings().then(res=>{
        if(res && res.ok && res.settings){
          applySiteSettings(res.settings);
          try { sessionStorage.setItem("btt_settings", JSON.stringify(res.settings)); } catch(e){}
          document.dispatchEvent(new CustomEvent("btt:settings", { detail: res.settings }));
        }
      }).catch(()=>{});
    }
  }
  window.BTT_HYDRATE_SETTINGS = hydrateSiteSettings;

  /* ---- PWA service worker registration ---- */
  function initServiceWorker(){
    if("serviceWorker" in navigator && location.protocol.startsWith("http")){
      window.addEventListener("load", ()=>{
        navigator.serviceWorker.register("/sw.js").catch(()=>{});
      });
    }
  }

  /* ---- automatic Uzbekistan phone input mask (+998 XX XXX XX XX) ---- */
  function initPhoneMasking(){
    document.addEventListener("input", (e)=>{
      const el = e.target;
      if(el && (el.matches('input[type="tel"]') || el.matches('input[name="phone"]'))){
        const raw = el.value;
        const digits = raw.replace(/\D/g, "");
        if(!digits || digits === "9" || digits === "99" || digits === "998"){
          if(e.inputType && e.inputType.startsWith("delete")){
            el.value = "";
            return;
          }
        }
        if(window.BTT_UTIL && window.BTT_UTIL.formatPhone){
          const formatted = window.BTT_UTIL.formatPhone(raw);
          if(formatted !== el.value){
            el.value = formatted;
          }
        }
      }
    });
  }

  /* ---- wire up on load ---- */
  document.addEventListener("DOMContentLoaded", function(){
    applyTheme(getTheme());
    applyLang(getLang());
    hydrateSiteSettings();
    initServiceWorker();
    initPhoneMasking();
    if(window.BTT_SEO) window.BTT_SEO.refresh(getLang());
    initA11y();
    initReveal();
    initParallax();
    initHeaderScroll();
    initCatToolbar();
    initCatalogSidebarDrawer();
    initCounters();
    initPageTransitions();
    initMobileNav();
    initInPageNav();
    initLazyImages();
    initFaq();
    applyProductMeta();
    initCustomOrder();
    wireQuickViewTriggers();



    document.addEventListener("btt:related-rendered", (e)=>{
      const grid = e.detail && e.detail.grid;
      if(!grid) return;
      applyProductMeta(grid);
      wireQuickViewTriggers(grid);
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
      if(window.BTT_FX) window.BTT_FX.refresh(grid);
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
    let activeToggle = null;
    let activeSort = "featured";
    let liveSearchQ = "";
    let activePriceMin = null;
    let activePriceMax = null;
    const activeColors = new Set();
    const activeMaterials = new Set();

    function getSearchQ(){
      return (urlParams.get("q") || "").toLowerCase().trim();
    }

    function getCombinedSearchQ(){
      return (liveSearchQ || getSearchQ() || "").toLowerCase().trim();
    }

    function applyCatalogFilters(grid, cat, q){
      if(!grid) return;
      if(grid.id === "catalog-grid"){
        applyCatalogState(grid);
        return;
      }
      const cards = Array.from(grid.querySelectorAll("[data-product]"));
      cards.forEach(card=>{
        const txt = (card.textContent || "").toLowerCase();
        const show = cardMatchesCat(card, cat) && (!q || txt.includes(q));
        card.style.display = show ? "" : "none";
      });
      updateCatCount(grid);
    }

    function renderActiveChips(grid){
      const container = document.getElementById("cat-active-chips");
      if(!container) return;
      const chips = [];
      const d = dict[getLang()] || dict.ru || {};

      if(activeCat !== "all"){
        const catLabel = d["cat." + activeCat] || (document.querySelector(`.cat-sidebar-chips .chip[data-cat="${activeCat}"] .chip-label`) || {}).textContent || activeCat;
        chips.push({
          label: catLabel,
          onRemove: () => {
            const allChip = document.querySelector(".cat-sidebar-chips .chip[data-cat='all']");
            if(allChip) allChip.click();
          }
        });
      }

      if(activePriceMin !== null || activePriceMax !== null){
        let pText = "";
        if(activePriceMin !== null && activePriceMax !== null){
          pText = `${activePriceMin.toLocaleString("ru-RU")} – ${activePriceMax.toLocaleString("ru-RU")} сум`;
        } else if(activePriceMin !== null){
          pText = `от ${activePriceMin.toLocaleString("ru-RU")} сум`;
        } else {
          pText = `до ${activePriceMax.toLocaleString("ru-RU")} сум`;
        }
        chips.push({
          label: pText,
          onRemove: () => {
            activePriceMin = null;
            activePriceMax = null;
            const minIn = document.getElementById("cat-price-min");
            const maxIn = document.getElementById("cat-price-max");
            if(minIn) minIn.value = "";
            if(maxIn) maxIn.value = "";
            applyCatalogState(grid);
          }
        });
      }

      activeColors.forEach(colorId => {
        const opt = document.querySelector(`.cat-color-option[data-color="${colorId}"]`);
        const label = opt ? (opt.querySelector(".cat-color-label") || {}).textContent : colorId;
        chips.push({
          label: `Цвет: ${label}`,
          onRemove: () => {
            activeColors.delete(colorId);
            if(opt){
              const cb = opt.querySelector("input");
              if(cb) cb.checked = false;
              opt.classList.remove("is-selected");
            }
            applyCatalogState(grid);
          }
        });
      });

      activeMaterials.forEach(matVal => {
        const chipEl = Array.from(document.querySelectorAll(".cat-mat-chip")).find(el => {
          const cb = el.querySelector("input");
          return cb && cb.value === matVal;
        });
        const label = chipEl ? (chipEl.querySelector("span") || {}).textContent : matVal;
        chips.push({
          label: `Материал: ${label}`,
          onRemove: () => {
            activeMaterials.delete(matVal);
            if(chipEl){
              const cb = chipEl.querySelector("input");
              if(cb) cb.checked = false;
              chipEl.classList.remove("is-selected");
            }
            applyCatalogState(grid);
          }
        });
      });

      if(activeToggle === "instock"){
        chips.push({
          label: d["filter.instock"] || "В наличии",
          onRemove: () => {
            activeToggle = null;
            document.querySelectorAll(".smart-toggle").forEach(b => b.classList.remove("is-active"));
            applyCatalogState(grid);
          }
        });
      }

      if(chips.length === 0){
        container.innerHTML = "";
        container.hidden = true;
        return;
      }

      container.hidden = false;
      container.innerHTML = "";
      chips.forEach(c => {
        const tag = document.createElement("span");
        tag.className = "cat-active-chip";
        tag.innerHTML = `<span>${c.label}</span><button type="button" class="cat-active-chip-remove" aria-label="Удалить фильтр">&times;</button>`;
        tag.querySelector("button").addEventListener("click", c.onRemove);
        container.appendChild(tag);
      });

      const clearAll = document.createElement("button");
      clearAll.type = "button";
      clearAll.className = "cat-active-clear-all";
      clearAll.textContent = d["filter.reset"] || "Сбросить всё";
      clearAll.addEventListener("click", resetAllCatalogFilters);
      container.appendChild(clearAll);
    }

    function applyCatalogState(grid){
      if(!grid || grid.id !== "catalog-grid") return;
      const q = getCombinedSearchQ();
      const cards = Array.from(grid.querySelectorAll("[data-product]"));
      const editorials = Array.from(grid.querySelectorAll("[data-editorial]"));

      // 1. Filtering products
      let shownCount = 0;
      const toShow = [];
      const toHide = [];
      cards.forEach(card=>{
        const txt = (card.textContent || "").toLowerCase().replace(/[‘’`]/g, "'");
        const normQ = q.toLowerCase().replace(/[‘’`]/g, "'");
        const catMatch = cardMatchesCat(card, activeCat);
        const searchMatch = !q || txt.includes(normQ);

        // Price match
        let priceMatch = true;
        const pVal = parseInt(card.dataset.price || (card.querySelector(".price__now") ? card.querySelector(".price__now").textContent.replace(/\D/g, "") : "0"), 10) || 0;
        if(activePriceMin !== null && pVal < activePriceMin) priceMatch = false;
        if(activePriceMax !== null && pVal > activePriceMax) priceMatch = false;

        // Color match (if any activeColors selected)
        let colorMatch = true;
        if(activeColors.size > 0){
          const cardColors = (card.dataset.colors || "").split(/\s+/).filter(Boolean);
          colorMatch = cardColors.some(c => activeColors.has(c));
        }

        // Material match (if any activeMaterials selected)
        let matMatch = true;
        if(activeMaterials.size > 0){
          const cardMats = (card.dataset.materials || "").toLowerCase();
          matMatch = Array.from(activeMaterials).some(m => cardMats.includes(m.toLowerCase()));
        }

        // Toggle match (instock)
        let toggleMatch = true;
        if(activeToggle === "instock"){
          toggleMatch = card.dataset.stock !== "0" && !card.querySelector(".badge-mto");
        }

        const show = catMatch && searchMatch && priceMatch && colorMatch && matMatch && toggleMatch;
        if(show){
          toShow.push(card);
          shownCount++;
        } else {
          toHide.push(card);
        }
      });

      const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduced){
        toHide.forEach(card=>{ card.style.display = "none"; });
        toShow.forEach(card=>{ card.style.display = ""; });
      } else {
        toHide.forEach(card=>{
          if(card.style.display !== "none"){
            card.classList.remove("is-filter-in");
            card.classList.add("is-filter-out");
            setTimeout(()=>{ card.style.display = "none"; card.classList.remove("is-filter-out"); updateCatCount(grid); }, 280);
          }
        });
        toShow.forEach((card, i)=>{
          const wasHidden = card.style.display === "none";
          card.style.display = "";
          if(wasHidden){
            card.classList.remove("is-filter-in");
            void card.offsetWidth;
            card.style.animationDelay = (i * 35) + "ms";
            card.classList.add("is-filter-in");
            card.addEventListener("animationend", ()=> card.classList.remove("is-filter-in"), { once:true });
          }
        });
      }

      // 2. Sorting products
      if(activeSort !== "featured"){
        const visibleCards = cards.filter(c=> c.style.display !== "none");
        visibleCards.sort((a, b)=>{
          if(activeSort === "price-asc" || activeSort === "price-desc"){
            const getPrice = (el)=>{
              const pEl = el.querySelector(".price__now");
              if(!pEl) return 0;
              return parseInt(pEl.textContent.replace(/[^\d]/g, ""), 10) || 0;
            };
            const pA = getPrice(a);
            const pB = getPrice(b);
            return activeSort === "price-asc" ? pA - pB : pB - pA;
          }
          if(activeSort === "new"){
            const getId = (el)=>{
              const see = el.querySelector("a.see, a[href*='product.html?id=']");
              if(!see) return "";
              const m = (see.getAttribute("href") || "").match(/[?&]id=([^&#]+)/);
              return m ? decodeURIComponent(m[1]) : "";
            };
            return getId(b).localeCompare(getId(a), undefined, { numeric: true });
          }
          return 0;
        });
        visibleCards.forEach(c=> grid.appendChild(c));
      }

      // 3. Editorial cards handling
      editorials.forEach(ed=>{
        if(q || activeToggle || activeColors.size > 0 || activeMaterials.size > 0 || activePriceMin !== null || activePriceMax !== null){
          ed.style.display = "none";
        } else {
          const edCats = (ed.getAttribute("data-editorial-cat") || "all").split(" ");
          const match = activeCat === "all" || edCats.includes(activeCat);
          ed.style.display = match ? "" : "none";
        }
      });

      // 4. Update count badge & empty state
      updateCatCount(grid);
      const emptyEl = document.querySelector("[data-cat-empty]");
      if(emptyEl) emptyEl.hidden = shownCount > 0;

      // 5. Active chips
      renderActiveChips(grid);

      // 6. Update search note & reset button
      const searchNote = document.querySelector("[data-search-note]");
      if(searchNote){
        if(q){
          const d = dict[getLang()] || dict.ru || {};
          const tpl = d["cat.searchNote"] || "«{q}» — {n}";
          searchNote.textContent = tpl.replace("{q}", q).replace("{n}", String(shownCount));
          searchNote.style.display = "";
        } else {
          searchNote.textContent = "";
          searchNote.style.display = "none";
        }
      }

      const resetBtn = document.querySelector("[data-smart-reset]");
      if(resetBtn){
        const isFiltered = activeCat !== "all" || activeToggle !== null || q !== "" || activeColors.size > 0 || activeMaterials.size > 0 || activePriceMin !== null || activePriceMax !== null;
        resetBtn.hidden = !isFiltered;
      }

      const clearBtn = document.querySelector("[data-cat-search-clear]");
      if(clearBtn){
        clearBtn.hidden = !q;
      }
    }

    // Sync visual story category cards
    function syncVisualCards(cat){
      document.querySelectorAll(".cat-visual-card").forEach(vCard=>{
        const isMatch = vCard.dataset.cat === cat;
        vCard.classList.toggle("is-active", isMatch);
        if(isMatch && vCard.scrollIntoView && window.matchMedia && window.matchMedia("(max-width:760px)").matches){
          vCard.scrollIntoView({ inline:"nearest", behavior:"smooth", block:"nearest" });
        }
      });
    }

    document.querySelectorAll(".cat-visual-card").forEach(vCard=>{
      vCard.addEventListener("click", ()=>{
        const cat = vCard.dataset.cat;
        const matchingChip = document.querySelector(`[data-chips] .chip[data-cat="${cat}"]`) || document.querySelector(`.cat-chips .chip[data-cat="${cat}"]`);
        if(matchingChip) matchingChip.click();
      });
    });

    function morphState(fn){
      if(window.BTT_MOTION && window.BTT_MOTION.viewTransition){
        window.BTT_MOTION.viewTransition(fn);
      } else if(document.startViewTransition && (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)){
        document.startViewTransition(fn);
      } else if(typeof fn === "function"){
        fn();
      }
    }

    // Smart toggles (in-stock)
    document.querySelectorAll(".smart-toggle").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const toggleType = btn.dataset.toggle;
        morphState(()=>{
          if(activeToggle === toggleType){
            activeToggle = null;
            btn.classList.remove("is-active");
          } else {
            document.querySelectorAll(".smart-toggle").forEach(b=> b.classList.remove("is-active"));
            activeToggle = toggleType;
            btn.classList.add("is-active");
          }
          const grid = document.querySelector("#catalog-grid");
          if(grid) applyCatalogState(grid);
        });
      });
    });

    // Price inputs
    const minPriceInput = document.getElementById("cat-price-min");
    const maxPriceInput = document.getElementById("cat-price-max");
    if(minPriceInput || maxPriceInput){
      const handlePriceChange = ()=>{
        activePriceMin = minPriceInput && minPriceInput.value ? parseInt(minPriceInput.value, 10) : null;
        activePriceMax = maxPriceInput && maxPriceInput.value ? parseInt(maxPriceInput.value, 10) : null;
        const grid = document.querySelector("#catalog-grid");
        if(grid) applyCatalogState(grid);
      };
      if(minPriceInput) minPriceInput.addEventListener("input", handlePriceChange);
      if(maxPriceInput) maxPriceInput.addEventListener("input", handlePriceChange);
    }

    // Color options
    document.querySelectorAll(".cat-color-option").forEach(opt=>{
      const cb = opt.querySelector("input");
      if(cb){
        cb.addEventListener("change", ()=>{
          if(cb.checked) activeColors.add(cb.value);
          else activeColors.delete(cb.value);
          opt.classList.toggle("is-selected", cb.checked);
          const grid = document.querySelector("#catalog-grid");
          if(grid) applyCatalogState(grid);
        });
      }
    });

    // Material options
    document.querySelectorAll(".cat-mat-chip").forEach(chip=>{
      const cb = chip.querySelector("input");
      if(cb){
        cb.addEventListener("change", ()=>{
          if(cb.checked) activeMaterials.add(cb.value);
          else activeMaterials.delete(cb.value);
          chip.classList.toggle("is-selected", cb.checked);
          const grid = document.querySelector("#catalog-grid");
          if(grid) applyCatalogState(grid);
        });
      }
    });

    // Live search in catalog
    const searchInput = document.querySelector("[data-cat-search-input]");
    const searchClear = document.querySelector("[data-cat-search-clear]");
    if(searchInput){
      if(urlParams.get("q")){
        searchInput.value = urlParams.get("q");
        liveSearchQ = urlParams.get("q");
      }
      searchInput.addEventListener("input", ()=>{
        liveSearchQ = searchInput.value;
        const grid = document.querySelector("#catalog-grid");
        if(grid) applyCatalogState(grid);
      });
      if(searchClear){
        searchClear.addEventListener("click", ()=>{
          searchInput.value = "";
          liveSearchQ = "";
          const grid = document.querySelector("#catalog-grid");
          if(grid) morphState(()=> applyCatalogState(grid));
          searchInput.focus();
        });
      }
    }

    // Pre-apply filter toggle from URL (?filter=instock)
    const qFilter = urlParams.get("filter");
    if(qFilter && qFilter === "instock"){
      activeToggle = qFilter;
      const tBtn = document.querySelector(`.smart-toggle[data-toggle="${qFilter}"]`);
      if(tBtn) tBtn.classList.add("is-active");
    }

    // Sort control in catalog
    const sortSelect = document.querySelector("[data-cat-sort]");
    if(sortSelect){
      const qSort = urlParams.get("sort");
      if(qSort && Array.from(sortSelect.options).some(o => o.value === qSort)){
        sortSelect.value = qSort;
        activeSort = qSort;
      }
      sortSelect.addEventListener("change", ()=>{
        activeSort = sortSelect.value;
        const grid = document.querySelector("#catalog-grid");
        if(grid) morphState(()=> applyCatalogState(grid));
      });
    }

    // Reset button (sidebar and grid empty-state)
    function resetAllCatalogFilters(){
      morphState(()=>{
        activeToggle = null;
        liveSearchQ = "";
        activePriceMin = null;
        activePriceMax = null;
        activeColors.clear();
        activeMaterials.clear();

        const minIn = document.getElementById("cat-price-min");
        const maxIn = document.getElementById("cat-price-max");
        if(minIn) minIn.value = "";
        if(maxIn) maxIn.value = "";

        document.querySelectorAll(".cat-color-option").forEach(opt => {
          const cb = opt.querySelector("input");
          if(cb) cb.checked = false;
          opt.classList.remove("is-selected");
        });

        document.querySelectorAll(".cat-mat-chip").forEach(chip => {
          const cb = chip.querySelector("input");
          if(cb) cb.checked = false;
          chip.classList.remove("is-selected");
        });

        if(searchInput) searchInput.value = "";
        const searchClear = document.querySelector("[data-cat-search-clear]");
        if(searchClear) searchClear.hidden = true;
        document.querySelectorAll(".smart-toggle").forEach(b=> b.classList.remove("is-active"));
        const allChip = document.querySelector("[data-chips] .chip[data-cat='all']") || document.querySelector(".cat-chips .chip[data-cat='all']");
        if(allChip) allChip.click();
        else {
          activeCat = "all";
          const grid = document.querySelector("#catalog-grid");
          if(grid) applyCatalogState(grid);
        }
      });
    }
    document.querySelectorAll("[data-smart-reset], [data-cat-reset]").forEach(btn=>{
      btn.addEventListener("click", resetAllCatalogFilters);
    });

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
        if(grid){
          morphState(()=>{
            if(grid.id === "catalog-grid") applyCatalogState(grid);
            else filterProducts(grid, cat);
          });
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
        } else if(getCombinedSearchQ()){
          const grid = document.querySelector(group.dataset.target);
          if(grid && grid.id === "catalog-grid") applyCatalogState(grid);
        }
      }
    });

    document.addEventListener("btt:cat-change", e=>{
      const cat = e.detail && e.detail.cat;
      if(cat){
        syncVisualCards(cat);
      }
    });

    window.addEventListener("popstate", ()=>{
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat") || "all";
      const resolved = resolveChipCat(cat);
      const chip = document.querySelector(`[data-chips] .chip[data-cat="${resolved}"]`) || document.querySelector(`.cat-chips .chip[data-cat="${resolved}"]`);
      if(chip && !chip.classList.contains("is-active")){
        chip.click();
      }
    });

    /* Catalog Grid View Switcher (standard 4-col vs editorial 2-col wide) */
    function initCatalogView(){
      const toggler = document.querySelector("[data-view-toggler]");
      const grid = document.querySelector("#catalog-grid");
      if(!toggler || !grid) return;
      const btns = toggler.querySelectorAll(".cat-view-btn");
      const savedView = localStorage.getItem("btt_cat_view") || "grid";

      function setView(view, save){
        const updateDOM = ()=>{
          btns.forEach(b=>{
            const isMatch = b.dataset.view === view;
            b.classList.toggle("is-active", isMatch);
            b.setAttribute("aria-pressed", isMatch ? "true" : "false");
          });
          grid.classList.toggle("is-grid-wide", view === "wide");
        };

        if(window.BTT_MOTION && window.BTT_MOTION.viewTransition && save){
          window.BTT_MOTION.viewTransition(updateDOM);
        } else {
          updateDOM();
        }
        if(save) try{ localStorage.setItem("btt_cat_view", view); }catch(e){}
      }

      setView(savedView, false);
      btns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const v = btn.dataset.view || "grid";
          setView(v, true);
        });
      });
    }

    /* Product Weave Color Swatches */
    function initProductSwatches(){
      document.querySelectorAll(".product-swatches").forEach(swGroup=>{
        const swatches = swGroup.querySelectorAll(".product-swatch");
        swatches.forEach(sw=>{
          sw.addEventListener("click", (e)=>{
            e.preventDefault();
            e.stopPropagation();
            swatches.forEach(s=> s.classList.remove("is-active"));
            sw.classList.add("is-active");
          });
        });
      });
    }

    initCatalogView();
    initProductSwatches();
    document.addEventListener("btt:related-rendered", initProductSwatches);

    // contact form
    const form = document.querySelector("[data-contact-form]");
    if(form){
      const ok = form.querySelector("[data-form-ok]");
      const err = form.querySelector("[data-form-err]");
      const submitBtn = form.querySelector("[data-contact-submit]");
      const dict = window.BTT_I18N || {};
      const cookieErrMsg = ()=>{
        const l = document.documentElement.lang || "ru";
        const d = dict[l] || dict.ru || {};
        return d["cookie.required"] || "Accept cookies to send data to the server.";
      };
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

        const emVal = email ? email.value.trim() : "";
        const phVal = phone ? phone.value.trim() : "";
        const isEmValid = emVal && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emVal);
        const isPhValid = phVal && phVal.replace(/\D/g, "").length >= 7;

        if(!isEmValid && !isPhValid){
          if(email) email.closest(".field")?.classList.add("is-invalid");
          if(phone) phone.closest(".field")?.classList.add("is-invalid");
          valid = false;
        }
        if(!valid){
          if(err){ err.textContent = errMsg(); err.hidden = false; err.classList.add("show"); }
          return;
        }

        const payload = {
          name: name ? name.value.trim() : "",
          email: email ? email.value.trim() : "",
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
            if(window.BTT_COOKIES && window.BTT_COOKIES.isRequiredError(ex)){
              if(err){ err.textContent = cookieErrMsg(); err.hidden = false; err.classList.add("show"); }
              if(submitBtn) submitBtn.disabled = false;
              window.BTT_COOKIES.showBanner();
              return;
            }
            if(ex && ex.status === 422){ fail(); }
            else { done(); } // network/backend down — don't punish the visitor
          }
        } else {
          done();
        }
      });
    }

    /* ---- interactive delivery calculator (delivery.html) ---- */
    initDeliveryCalc();
  });

  /* ---- interactive delivery calculator data & engine ---- */
  const DELIVERY_CITIES = {
    tashkent: {
      key: "city.tashkent",
      service: { ru: "Яндекс Доставка / Грузовое такси (Labo / Porter)", uz: "Yandex Yetkazish / Yuk taksisi (Labo / Porter)", en: "Yandex Freight / Cargo taxi (Labo / Porter)" },
      manager: { ru: "Менеджер согласует удобное время отгрузки и передаёт контакты водителя", uz: "Menejer qulay jo‘natish vaqtini kelishib oladi va haydovchi kontaktlarini beradi", en: "Manager coordinates dispatch time and provides driver contacts" },
      time: { ru: "1–2 рабочих дня из наличия", uz: "Mavjudidan 1–2 ish kuni", en: "1–2 business days in stock" },
      price: { ru: "По прямому тарифу сервиса доставки (Яндекс Доставка / Labo) без наценок", uz: "Yetkazish xizmati (Yandex Yetkazish / Labo) to‘g‘ridan-to‘g‘ri tarifi bo‘yicha ustamasiz", en: "At direct carrier rate (Yandex Freight / Labo) with zero markup" },
      pack: { ru: "В собранном виде · Защитная воздушно-пузырьковая плёнка и картон (сборщик не нужен)", uz: "Yig‘ilgan holda · Pufakchali plyonka va qalin karton himoyasi (usta shart emas)", en: "Fully assembled · Bubble wrap & heavy-duty carton (no assembler needed)" },
      assembly: { ru: "В собранном виде · Защитная воздушно-пузырьковая плёнка и картон (сборщик не нужен)", uz: "Yig‘ilgan holda · Pufakchali plyonka va qalin karton himoyasi (usta shart emas)", en: "Fully assembled · Bubble wrap & heavy-duty carton (no assembler needed)" },
      pickup: { ru: "Склад BTT в Ташкенте — бесплатно, по предварительной договорённости. Поможем погрузить", uz: "Toshkentdagi BTT ombori — oldindan kelishilgan holda bepul. Ortishga yordam beramiz", en: "BTT warehouse in Tashkent — free by appointment. Loading assistance provided" },
      badge: { ru: "Сервисы: Яндекс / Labo", uz: "Xizmatlar: Yandex / Labo", en: "Carriers: Yandex / Labo" },
      shortTime: { ru: "1–2 дня", uz: "1–2 kun", en: "1–2 days" }
    },
    tashkent_reg: {
      key: "city.tashkent_reg",
      service: { ru: "Грузовое такси (Labo / Porter) или междугородний курьер", uz: "Yuk taksisi (Labo / Porter) yoki shaharlararo kuryer", en: "Cargo taxi (Labo / Porter) or regional courier" },
      manager: { ru: "Менеджер координирует отгрузку и оформление заказа", uz: "Menejer buyurtmani jo‘natish va rasmiylashtirishni muvofiqlashtiradi", en: "Manager coordinates dispatch and paperwork" },
      time: { ru: "1–3 рабочих дня", uz: "1–3 ish kuni", en: "1–3 business days" },
      price: { ru: "По прямому тарифу перевозчика (Labo / Porter) без наценок", uz: "Tashuvchi (Labo / Porter) to‘g‘ridan-to‘g‘ri tarifi bo‘yicha ustamasiz", en: "At direct carrier rate (Labo / Porter) with zero markup" },
      pack: { ru: "В собранном виде · Усиленная защита углов и торцов, прямо до ворот дома", uz: "Yig‘ilgan holda · Burchak va chetlari kuchaytirilgan, to‘g‘ridan-to‘g‘ri darvozagacha", en: "Fully assembled · Reinforced edge protection, delivered to your gate" },
      assembly: { ru: "В собранном виде · Усиленная защита углов и торцов, прямо до ворот дома", uz: "Yig‘ilgan holda · Burchak va chetlari kuchaytirilgan, to‘g‘ridan-to‘g‘ri darvozagacha", en: "Fully assembled · Reinforced edge protection, delivered to your gate" },
      pickup: { ru: "Склад BTT в Ташкенте — бесплатно по предварительной договорённости", uz: "Toshkentdagi BTT ombori — kelishuv bo‘yicha bepul", en: "BTT warehouse in Tashkent — free by appointment" },
      badge: { ru: "Сервисы: Грузовое такси / Labo", uz: "Xizmatlar: Yuk taksisi / Labo", en: "Carriers: Cargo Taxi / Labo" },
      shortTime: { ru: "1–3 дня", uz: "1–3 kun", en: "1–3 days" }
    },
    samarkand: {
      key: "city.samarkand",
      service: { ru: "Транспортная компания BTS Express / FarGo / EMU", uz: "BTS Express / FarGo / EMU transport kompaniyasi", en: "BTS Express / FarGo / EMU freight logistics" },
      manager: { ru: "Менеджер оформляет накладную транспортной службы и передаёт трек-номер для отслеживания", uz: "Menejer yuk xatini rasmiylashtiradi va kuzatuv trek-raqamini beradi", en: "Manager books freight waybill and provides tracking details" },
      time: { ru: "3–5 рабочих дней с момента передачи перевозчику", uz: "Tashuvchiga topshirilgandan keyin 3–5 ish kuni", en: "3–5 business days from carrier handover" },
      price: { ru: "По тарифу транспортной компании (BTS Express / FarGo) без комиссий и наценок", uz: "Transport kompaniyasi (BTS Express / FarGo) tarifi bo‘yicha komissiya va ustamasiz", en: "At freight carrier tariff (BTS Express / FarGo) with zero markup" },
      pack: { ru: "В собранном виде · Защитная деревянная обрешётка + пузырьковая плёнка (сборка не требуется)", uz: "Yig‘ilgan holda · Yog‘och qoplama + pufakchali plyonka (yig‘ish talab qilinmaydi)", en: "Fully assembled · Wooden crating + bubble wrap (no assembly required)" },
      assembly: { ru: "В собранном виде · Защитная деревянная обрешётка + пузырьковая плёнка (сборка не требуется)", uz: "Yig‘ilgan holda · Yog‘och qoplama + pufakchali plyonka (yig‘ish talab qilinmaydi)", en: "Fully assembled · Wooden crating + bubble wrap (no assembly required)" },
      pickup: { ru: "Терминал BTS / FarGo в Самарканде или автодоставка перевозчиком до адреса", uz: "Samarqanddagi BTS / FarGo terminali yoki manzilgacha avtoyetkazish", en: "BTS / FarGo Samarkand depot or carrier delivery to address" },
      badge: { ru: "Сервисы: BTS Express / FarGo", uz: "Xizmatlar: BTS Express / FarGo", en: "Carriers: BTS Express / FarGo" },
      shortTime: { ru: "3–5 дней", uz: "3–5 kun", en: "3–5 days" }
    },
    bukhara: {
      key: "city.bukhara",
      service: { ru: "Транспортная служба BTS Express / FarGo (регулярный рейс)", uz: "BTS Express / FarGo transport xizmati (muntazam reys)", en: "BTS Express / FarGo freight service (scheduled transit)" },
      manager: { ru: "Менеджер оформляет накладную транспортной службы и передаёт трек-номер для отслеживания", uz: "Menejer yuk xatini rasmiylashtiradi va kuzatuv trek-raqamini beradi", en: "Manager books freight waybill and provides tracking details" },
      time: { ru: "4–6 рабочих дней с момента отправки", uz: "Yuborilgandan keyin 4–6 ish kuni", en: "4–6 business days from dispatch" },
      price: { ru: "По тарифу службы доставки (BTS Express / FarGo) без магазинных наценок", uz: "Yetkazish xizmati (BTS Express / FarGo) tarifi bo‘yicha ustamasiz", en: "At carrier service tariff (BTS Express / FarGo) with zero shop markup" },
      pack: { ru: "В собранном виде · Жёсткая фиксация в защитной таре против сколов (готов к использованию)", uz: "Yig‘ilgan holda · Qattiq fiksatsiyalangan qadoq (foydalanishga tayyor)", en: "Fully assembled · Rigid secure crating preventing any transit scuffs" },
      assembly: { ru: "В собранном виде · Жёсткая фиксация в защитной таре против сколов (готов к использованию)", uz: "Yig‘ilgan holda · Qattiq fiksatsiyalangan qadoq (foydalanishga tayyor)", en: "Fully assembled · Rigid secure crating preventing any transit scuffs" },
      pickup: { ru: "Пункт выдачи BTS / FarGo в Бухаре или доставка курьером службы", uz: "Buxorodagi BTS / FarGo tarqatish punkti yoki xizmat kuryeri", en: "Bukhara BTS / FarGo hub or carrier courier to door" },
      badge: { ru: "Сервисы: BTS / FarGo", uz: "Xizmatlar: BTS / FarGo", en: "Carriers: BTS / FarGo" },
      shortTime: { ru: "4–6 дней", uz: "4–6 kun", en: "4–6 days" }
    },
    fergana: {
      key: "city.fergana",
      service: { ru: "Транспортные службы BTS Express / FarGo / EMU (Ферганская долина)", uz: "BTS Express / FarGo / EMU xizmatlari (Farg‘ona vodiysi)", en: "BTS Express / FarGo / EMU freight carriers (Fergana Valley)" },
      manager: { ru: "Менеджер оформляет накладную транспортной службы и передаёт трек-номер для отслеживания", uz: "Menejer yuk xatini rasmiylashtiradi va kuzatuv trek-raqamini beradi", en: "Manager books freight waybill and provides tracking details" },
      time: { ru: "3–5 рабочих дней с момента отправки", uz: "Yuborilgandan keyin 3–5 ish kuni", en: "3–5 business days from dispatch" },
      price: { ru: "По тарифу транспортных служб (BTS / FarGo / EMU) без наценок", uz: "Transport xizmatlari (BTS / FarGo / EMU) tarifi bo‘yicha ustamasiz", en: "At carrier service tariffs (BTS / FarGo / EMU) with zero markup" },
      pack: { ru: "В собранном виде · Защитная обрешётка для безопасной перевозки через перевал", uz: "Yig‘ilgan holda · Dovondan xavfsiz o‘tish uchun maxsus yog‘och qoplama", en: "Fully assembled · Reinforced wooden crate for mountain pass transit" },
      assembly: { ru: "В собранном виде · Защитная обрешётка для безопасной перевозки через перевал", uz: "Yig‘ilgan holda · Dovondan xavfsiz o‘tish uchun maxsus yog‘och qoplama", en: "Fully assembled · Reinforced wooden crate for mountain pass transit" },
      pickup: { ru: "Пункты выдачи в Фергане, Андижане, Намангане или доставка до адреса", uz: "Farg‘ona, Andijon, Namangandagi punktlar yoki manzilgacha yetkazish", en: "Pick-up hubs across Fergana, Andijan, Namangan or address delivery" },
      badge: { ru: "Сервисы: BTS / FarGo / EMU", uz: "Xizmatlar: BTS / FarGo / EMU", en: "Carriers: BTS / FarGo / EMU" },
      shortTime: { ru: "3–5 дней", uz: "3–5 kun", en: "3–5 days" }
    },
    south: {
      key: "city.south",
      service: { ru: "Транспортные службы BTS Express / FarGo (Карши, Навои, Термез)", uz: "BTS Express / FarGo xizmatlari (Qarshi, Navoiy, Termiz)", en: "BTS Express / FarGo freight (Karshi, Navoi, Termez)" },
      manager: { ru: "Менеджер оформляет накладную транспортной службы и передаёт трек-номер для отслеживания", uz: "Menejer yuk xatini rasmiylashtiradi va kuzatuv trek-raqamini beradi", en: "Manager books freight waybill and provides tracking details" },
      time: { ru: "5–7 рабочих дней с момента отправки", uz: "Yuborilgandan keyin 5–7 ish kuni", en: "5–7 business days from dispatch" },
      price: { ru: "По прямому тарифу перевозчика (BTS Express / FarGo) без комиссий", uz: "Tashuvchi (BTS Express / FarGo) to‘g‘ridan-to‘g‘ri tarifi bo‘yicha komissiyasiz", en: "At direct carrier rate (BTS Express / FarGo) with zero commission" },
      pack: { ru: "В собранном виде · Многослойная упаковка и обрешётка для дальних дистанций", uz: "Yig‘ilgan holda · Uzoq masofalar uchun ko‘p qavatli o‘ram va qoplama", en: "Fully assembled · Heavy-duty long-haul protective crating" },
      assembly: { ru: "В собранном виде · Многослойная упаковка и обрешётка для дальних дистанций", uz: "Yig‘ilgan holda · Uzoq masofalar uchun ko‘p qavatli o‘ram va qoplama", en: "Fully assembled · Heavy-duty long-haul protective crating" },
      pickup: { ru: "Региональные терминалы BTS / FarGo или автокурьер до объекта", uz: "BTS / FarGo mintaqaviy terminallari yoki ob’ektgacha avtokuryer", en: "Regional BTS / FarGo terminals or vehicle courier to site" },
      badge: { ru: "Сервисы: BTS / FarGo", uz: "Xizmatlar: BTS / FarGo", en: "Carriers: BTS / FarGo" },
      shortTime: { ru: "5–7 дней", uz: "5–7 kun", en: "5–7 days" }
    },
    khorezm: {
      key: "city.khorezm",
      service: { ru: "Грузовая транспортная служба BTS Express / EMU (Ургенч, Хива, Нукус)", uz: "BTS Express / EMU yuk transport xizmati (Urganch, Xiva, Nukus)", en: "BTS Express / EMU freight service (Urgench, Khiva, Nukus)" },
      manager: { ru: "Менеджер оформляет накладную транспортной службы и передаёт трек-номер для отслеживания", uz: "Menejer yuk xatini rasmiylashtiradi va kuzatuv trek-raqamini beradi", en: "Manager books freight waybill and provides tracking details" },
      time: { ru: "5–8 рабочих дней с момента отправки", uz: "Yuborilgandan keyin 5–8 ish kuni", en: "5–8 business days from dispatch" },
      price: { ru: "По прямому тарифу транспортной компании без наценок", uz: "Transport kompaniyasi to‘g‘ridan-to‘g‘ri tarifi bo‘yicha ustamasiz", en: "At direct carrier tariff with zero markup" },
      pack: { ru: "В собранном виде · Усиленный деревянный каркас (сборка на месте не требуется)", uz: "Yig‘ilgan holda · Kuchaytirilgan yog‘och karkas (joyida yig‘ish shart emas)", en: "Fully assembled · Reinforced wooden transit frame (no on-site assembly)" },
      assembly: { ru: "В собранном виде · Усиленный деревянный каркас (сборка на месте не требуется)", uz: "Yig‘ilgan holda · Kuchaytirilgan yog‘och karkas (joyida yig‘ish shart emas)", en: "Fully assembled · Reinforced wooden transit frame (no on-site assembly)" },
      pickup: { ru: "Пункты выдачи в Ургенче и Нукусе или доставка до ворот", uz: "Urganch va Nukusdagi tarqatish punktlari yoki darvozagacha yetkazish", en: "Urgench & Nukus hubs or direct delivery to gate" },
      badge: { ru: "Сервисы: BTS Express / EMU", uz: "Xizmatlar: BTS Express / EMU", en: "Carriers: BTS Express / EMU" },
      shortTime: { ru: "5–8 дней", uz: "5–8 kun", en: "5–8 days" }
    }
  };
  window.BTT_DELIVERY_CITIES = DELIVERY_CITIES;

  function initDeliveryCalc(){
    const calc = document.querySelector(".del-calc");
    if(!calc) return;
    const btns = calc.querySelectorAll(".del-calc__city-btn");
    const badgeEl = calc.querySelector("[data-calc-badge]");
    const cityTitleEl = calc.querySelector("[data-calc-city-title]");
    const serviceEl = calc.querySelector("[data-calc-service]");
    const managerEl = calc.querySelector("[data-calc-manager]");
    const timeEl = calc.querySelector("[data-calc-time]");
    const priceEl = calc.querySelector("[data-calc-price]");
    const packEl = calc.querySelector("[data-calc-pack]") || calc.querySelector("[data-calc-assembly]");
    const pickupEl = calc.querySelector("[data-calc-pickup]");
    const cardEl = calc.querySelector("[data-del-calc-card]");

    let activeCityKey = localStorage.getItem("btt_city") || "tashkent";
    if(!DELIVERY_CITIES[activeCityKey]) activeCityKey = "tashkent";

    function renderCity(cityKey, animate){
      const data = DELIVERY_CITIES[cityKey];
      if(!data) return;
      const l = getLang();
      const d = dict[l] || dict.ru || {};

      btns.forEach(b=>{
        const isSel = b.dataset.city === cityKey;
        b.classList.toggle("is-active", isSel);
        b.setAttribute("aria-selected", isSel ? "true" : "false");
      });

      if(animate && cardEl){
        cardEl.style.opacity = "0.4";
        cardEl.style.transform = "translateY(4px)";
      }

      setTimeout(()=>{
        if(badgeEl) badgeEl.textContent = data.badge[l] || data.badge.ru;
        if(cityTitleEl) cityTitleEl.textContent = d[data.key] || cityKey;
        if(serviceEl) serviceEl.textContent = (data.service && (data.service[l] || data.service.ru)) || "";
        if(managerEl) managerEl.textContent = (data.manager && (data.manager[l] || data.manager.ru)) || "";
        if(timeEl) timeEl.textContent = data.time[l] || data.time.ru;
        if(priceEl) priceEl.textContent = data.price[l] || data.price.ru;
        if(packEl) packEl.textContent = (data.pack && (data.pack[l] || data.pack.ru)) || (data.assembly && (data.assembly[l] || data.assembly.ru)) || "";
        if(pickupEl) pickupEl.textContent = data.pickup[l] || data.pickup.ru;

        if(animate && cardEl){
          cardEl.style.transition = "opacity 0.25s ease, transform 0.25s ease";
          cardEl.style.opacity = "1";
          cardEl.style.transform = "translateY(0)";
        }
      }, animate ? 120 : 0);
    }

    btns.forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const c = btn.dataset.city;
        if(c === activeCityKey) return;
        activeCityKey = c;
        try{ localStorage.setItem("btt_city", c); }catch(e){}
        if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
        renderCity(c, true);
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        document.dispatchEvent(new CustomEvent("btt:city-change", { detail: { city: c } }));
      });
    });

    renderCity(activeCityKey, false);

    document.addEventListener("btt:lang", ()=> renderCity(activeCityKey, false));
    document.addEventListener("btt:city-change", e=>{
      if(e.detail && e.detail.city && e.detail.city !== activeCityKey){
        activeCityKey = e.detail.city;
        renderCity(activeCityKey, false);
      }
    });

    if(location.hash === "#calc"){
      setTimeout(()=>{
        calc.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }

  // Quick CRM link in footer for authenticated administrators
  try {
    if (window.BTT_API && typeof window.BTT_API.me === "function") {
      window.BTT_API.me().then(res => {
        if (res && res.user && res.user.role === "admin") {
          const footLegal = document.querySelector(".foot-legal");
          if (footLegal && !footLegal.querySelector(".foot-crm-link")) {
            const a = document.createElement("a");
            a.href = "/admin";
            a.className = "foot-crm-link";
            a.style.cssText = "color:var(--copper);font-weight:700;display:inline-flex;align-items:center;gap:4px;margin-left:12px;";
            a.innerHTML = '<span style="font-size:12px;">⚙</span> <span>CRM</span>';
            a.title = "Панель управления магазином";
            footLegal.appendChild(a);
          }
        }
      }).catch(()=>{});
    }
  } catch(e){}
})();

