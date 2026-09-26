/* ============================================================
   BTT — hero (switchable worlds, reference layout)
   Worlds: all · wicker-chairs · plastic-chairs · upholstered-chairs · tables
   Multilingual (RU/UZ/EN); reacts to the global language switch.
   ============================================================ */
(function(){
  const SLIDES = [
    {
      cat: "all",
      sideImg: "assets/hero-garden-furniture.png",
      t1:      {ru:"BTT — мебель",            uz:"BTT — mebel",            en:"BTT — Furniture"},
      t2:      {ru:"для дома и сада",         uz:"uy va bog‘ uchun",       en:"for Home & Garden"},
      sub:     {ru:"Столы, стулья и готовые решения для дома, сада и HoReCa в Ташкенте.",
                uz:"Toshkentda uy, bog‘ va HoReCa uchun stollar, stullar va tayyor yechimlar.",
                en:"Tables, chairs and furniture solutions for home, garden and HoReCa in Tashkent."},
      store:   {ru:"Смотреть каталог",        uz:"Katalogni ko‘rish",      en:"Browse catalog"},
      href:    "catalog.html"
    },
    {
      cat: "wicker-chairs",
      sideImg: "assets/prod-chair-corda.jpg",
      t1:      {ru:"Плетёные",                uz:"To‘qilgan",              en:"Wicker"},
      t2:      {ru:"стулья",                  uz:"stullar",                en:"chairs"},
      sub:     {ru:"Модели Vertex и Corda с металлическим каркасом, плетением и мягкими подушками.",
                uz:"Metall karkasli, zich to‘quvli va yumshoq yostiqli Vertex hamda Corda modellari.",
                en:"Vertex and Corda models with metal frame, dense weave, and soft cushions."},
      store:   {ru:"Смотреть плетёные стулья", uz:"To‘qilgan stullarni ko‘rish", en:"Shop wicker chairs"},
      href:    "catalog.html?cat=wicker-chairs"
    },
    {
      cat: "plastic-chairs",
      sideImg: "assets/hero-garden-furniture.png",
      t1:      {ru:"Пластиковые",             uz:"Plastik",                en:"Plastic"},
      t2:      {ru:"стулья",                  uz:"stullar",                en:"chairs"},
      sub:     {ru:"Модели ROERO, NOERO, TODO и JARDIN — лёгкие, надёжные, с нагрузкой от 120 до 180 кг.",
                uz:"ROERO, NOERO, TODO va JARDIN modellari — yengil, pishiq, 120 dan 180 kg gacha yuk ko‘taradi.",
                en:"ROERO, NOERO, TODO and JARDIN models — lightweight, sturdy, with 120 kg to 180 kg load ratings."},
      store:   {ru:"Смотреть пластиковые стулья", uz:"Plastik stullarni ko‘rish", en:"Shop plastic chairs"},
      href:    "catalog.html?cat=plastic-chairs"
    },
    {
      cat: "upholstered-chairs",
      sideImg: "assets/hero-home-furniture.png",
      t1:      {ru:"Мягкие",                  uz:"Yumshoq",                en:"Upholstered"},
      t2:      {ru:"стулья и кресла",         uz:"stul va kreslolar",      en:"chairs & armchairs"},
      sub:     {ru:"Стул LIRA и уютное кресло COMO на металлическом каркасе для столовой и гостиной.",
                uz:"Oshxona va mehmonxona uchun metall karkasdagi LIRA stuli va qulay COMO kreslosi.",
                en:"LIRA dining chair and COMO armchair on metal frames for dining and living spaces."},
      store:   {ru:"Смотреть мягкие стулья",  uz:"Yumshoq stullarni ko‘rish", en:"Shop upholstered chairs"},
      href:    "catalog.html?cat=upholstered-chairs"
    },
    {
      cat: "tables",
      sideImg: "assets/prod-table-dining-room.jpg",
      t1:      {ru:"Обеденные",               uz:"Ovqatlanish",            en:"Dining"},
      t2:      {ru:"столы",                   uz:"stollari",               en:"tables"},
      sub:     {ru:"Столы Taper, Vertex и Corda с прочным металлокаркасом и практичной столешницей из ЛДСП.",
                uz:"Taper, Vertex va Corda kvadrat, dumaloq va to‘g‘ri burchakli mustahkam LDSP stollari.",
                en:"Taper, Vertex, and Corda square, round, and rectangular tables with durable chipboard tops."},
      store:   {ru:"Смотреть столы",          uz:"Stollarni ko‘rish",      en:"Explore tables"},
      href:    "catalog.html?cat=tables"
    }
  ];

  const root = document.querySelector("[data-hero]");
  if(!root || SLIDES.length < 2) return;
  const $ = (s) => root.querySelector(s);

  const els = {
    heroImgs:[$('[data-h="heroImg"]'), $('[data-h="heroImgB"]')],
    t1:$('[data-h="t1"]'), t2:$('[data-h="t2"]'),
    sub:$('[data-h="sub"]'),
    store:$('[data-h="store"]'), storeLink:$('[data-h="storeLink"]'),
    lead:$('[data-h-lead]'), pocketInner:$('[data-h-inner]'),
    dots:$('[data-hero-dots]')
  };

  let idx=0, timer=null;
  const DUR=7000;
  let lang=(function(){var s=localStorage.getItem("btt_lang");return ["ru","uz","en"].includes(s)?s:"ru";})();
  const L=(o)=> (o && (o[lang]||o.ru)) || "";
  function T(k, vars){
    const d=(window.BTT_I18N&&window.BTT_I18N[lang])||(window.BTT_I18N&&window.BTT_I18N.ru)||{};
    let s=d[k]!=null?d[k]:k;
    if(vars) Object.keys(vars).forEach(key=>{ s=s.replace("{"+key+"}", vars[key]); });
    return s;
  }

  els.dots.setAttribute("role", "tablist");
  SLIDES.forEach((s,i)=>{
    const b=document.createElement("button");
    b.className="hero__sw-dot";
    b.setAttribute("type","button");
    b.setAttribute("role","tab");
    b.setAttribute("aria-label", T("hero.slide", { n: i+1 }));
    b.addEventListener("click",()=>go(i,true));
    els.dots.appendChild(b);
  });
  const dotEls=Array.from(els.dots.children);
  function syncDotLabels(){
    dotEls.forEach((b,i)=> b.setAttribute("aria-label", T("hero.slide", { n: i+1 })));
  }

  let activeBuf = 0;
  function setSideImg(src, alt){
    if(!els.heroImgs[0] || !els.heroImgs[1]) return;
    const curr = els.heroImgs[activeBuf];
    const nextBuf = 1 - activeBuf;
    const next = els.heroImgs[nextBuf];

    next.src = src;
    next.alt = alt || "";
    next.classList.add("is-on");
    curr.classList.remove("is-on");
    activeBuf = nextBuf;
  }

  function render(instant){
    const s = SLIDES[idx];
    const catAlt = (window.BTT_I18N && window.BTT_I18N[lang] && window.BTT_I18N[lang]["line." + s.cat + ".alt"]) || "";
    setSideImg(s.sideImg, catAlt);

    if(!instant && window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      if(els.pocketInner){
        els.pocketInner.classList.remove("is-anim");
        void els.pocketInner.offsetWidth;
        els.pocketInner.classList.add("is-anim");
      }
    }

    if(els.t1) els.t1.textContent = L(s.t1);
    if(els.t2) els.t2.textContent = L(s.t2);
    if(els.sub) els.sub.textContent = L(s.sub);
    if(els.store) els.store.textContent = L(s.store);
    if(els.storeLink) els.storeLink.href = s.href;

    dotEls.forEach((b,i)=>{
      const on = i === idx;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function go(i, manual){
    idx = (i + SLIDES.length) % SLIDES.length;
    render();
    if(manual){
      clearInterval(timer);
      startAuto();
    }
  }

  function startAuto(){
    clearInterval(timer);
    timer = setInterval(()=>go(idx+1, false), DUR);
  }

  const prevBtn = $('[data-hero-prev]');
  const nextBtn = $('[data-hero-next]');
  if(prevBtn) prevBtn.addEventListener("click", ()=>go(idx-1, true));
  if(nextBtn) nextBtn.addEventListener("click", ()=>go(idx+1, true));

  els.dots.addEventListener("keydown", (e)=>{
    let target = null;
    if(e.key === "ArrowRight") target = (idx + 1) % SLIDES.length;
    else if(e.key === "ArrowLeft") target = (idx - 1 + SLIDES.length) % SLIDES.length;
    else if(e.key === "Home") target = 0;
    else if(e.key === "End") target = SLIDES.length - 1;
    if(target !== null){
      e.preventDefault();
      go(target, true);
      dotEls[target].focus();
    }
  });

  root.addEventListener("mouseenter", ()=>clearInterval(timer));
  root.addEventListener("mouseleave", startAuto);
  root.addEventListener("focusin", ()=>clearInterval(timer));
  root.addEventListener("focusout", startAuto);

  document.addEventListener("btt:lang", function(e){
    lang = e.detail && e.detail.lang || lang;
    syncDotLabels();
    render(true);
  });

  render(true);
  startAuto();
})();
