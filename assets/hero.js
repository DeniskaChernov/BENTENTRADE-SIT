/* ============================================================
   BENTENTRADE — hero (switchable worlds, reference layout)
   Worlds: rattan · garden · home · planters · twisted — overlay, 5 slides.
   Multilingual (RU/UZ/EN); reacts to the global language switch.
   ============================================================ */
(function(){
  const SLIDES = [
    {
      cat: "rattan",
      sideImg: "assets/hero-rattan.png",
      t1:      {ru:"Искусственный",           uz:"Sun’iy",                 en:"Synthetic"},
      t2:      {ru:"ротанг",                  uz:"rotang",                 en:"rattan"},
      sub:     {ru:"Сами плетём мебель, кашпо и корзины — любой цвет под заказ. Материал не выгорает на солнце, не боится влаги и мороза, служит годами.",
                uz:"Mebel, gultuvak va savatlarni o‘zimiz to‘qiyamiz — istalgan rang buyurtmasi. Quyoshda so‘lmaydi, yomg‘ir va sovuqdan qo‘rqmaydi, yillar xizmat qiladi.",
                en:"We weave furniture, planters and baskets in-house — any colour to order. Won’t fade in the sun, handles rain and frost, lasts for years."},
      store:   {ru:"Смотреть каталог",         uz:"Katalogni ko‘rish",      en:"Browse catalog"},
      href:    "catalog.html"
    },
    {
      cat: "furniture",
      sideImg: "assets/hero-garden-furniture.png",
      t1:      {ru:"Мебель",                  uz:"Mebel",                  en:"Furniture"},
      t2:      {ru:"для дачи и сада",          uz:"dala va bog‘ uchun",     en:"for patio & garden"},
      sub:     {ru:"Диваны, кресла и обеденные группы для террасы и двора — всё есть в наличии.",
                uz:"Divan, kreslo va ovqat guruhlari — terrasa va hovli uchun, hammasi omborda.",
                en:"Sofas, chairs and dining sets for the terrace and yard — all in stock."},
      store:   {ru:"Смотреть садовую мебель",  uz:"Bog‘ mebelini ko‘rish", en:"Shop garden furniture"},
      href:    "catalog.html?cat=furniture"
    },
    {
      cat: "indoor",
      sideImg: "assets/hero-home-furniture.png",
      t1:      {ru:"Мебель",                  uz:"Mebel",                  en:"Furniture"},
      t2:      {ru:"для дома",                 uz:"uy uchun",               en:"for the home"},
      sub:     {ru:"Кресла, столики и стеллажи, которые впишутся в гостиную, спальню или балкон.",
                uz:"Kreslo, stol va javonlar — mehmonxona, yotoqxona yoki balkon uchun.",
                en:"Chairs, tables and shelving that fit the living room, bedroom or balcony."},
      store:   {ru:"Смотреть мебель для дома", uz:"Uy mebelini ko‘rish",   en:"Shop home furniture"},
      href:    "catalog.html?cat=indoor"
    },
    {
      cat: "planter",
      sideImg: "assets/hero-planter.png",
      t1:      {ru:"Кашпо, сундуки",           uz:"Gultuvak, sandiq",       en:"Planters, chests"},
      t2:      {ru:"и корзины для белья",       uz:"va kir savatlari",       en:"& laundry baskets"},
      sub:     {ru:"Плетём вручную для растений, белья и мелочей — красиво хранить проще.",
                uz:"O‘simlik, kir va mayda buyumlar uchun qo‘lda to‘qiymiz — chiroyli saqlash oson.",
                en:"Hand-woven for plants, laundry and odds and ends — tidy storage made easy."},
      store:   {ru:"Смотреть кашпо и корзины",  uz:"Gultuvak va savatlar",   en:"Shop planters & baskets"},
      href:    "catalog.html?cat=planterMix"
    },
    {
      sideImg: "assets/hero-twisted-rattan.png",
      t1:      {ru:"Крученый",                uz:"Burma",                  en:"Twisted"},
      t2:      {ru:"ротанг",                  uz:"rotang",                 en:"rattan"},
      sub:     {ru:"Плетём катушки из полиэтиленового волокна — от тонкого декора до толстого каркаса. Разные диаметры и цвета, стабильное качество партии за партией.",
                uz:"Polietilen tolidan g‘iloflar to‘qiyamiz — nozik dekor yoki qalin karkas uchun. Turli diametr va ranglar, har bir partiyada barqaror sifat.",
                en:"We weave coils from polyethylene fibre — from fine decor to heavy frame gauges. Multiple diameters and colours, consistent quality batch after batch."},
      store:   {ru:"Смотреть каталог",         uz:"Katalogni ko‘rish",      en:"Browse catalog"},
      href:    "about.html"
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

  function anim(){
    [els.pocketInner, els.lead].forEach(el=>{
      if(!el) return; el.classList.remove("is-swap"); void el.offsetWidth; el.classList.add("is-swap");
    });
  }
  // crossfade two stacked <img> layers — old stays painted until new loads
  function crossfade(layers, src){
    const on = layers.find(i=>i.classList.contains("is-on")) || layers[0];
    const off = layers.find(i=>i!==on);
    if(on.getAttribute("src")===src){ return; }
    const show=()=>{ off.classList.add("is-on"); on.classList.remove("is-on"); off.onload=null; off.onerror=null; };
    off.onload=show; off.onerror=show;
    off.src=src;
    if(off.complete && off.naturalWidth) show();
  }
  function render(animate){
    const s=SLIDES[idx];
    crossfade(els.heroImgs, s.sideImg);
    els.t1.textContent=L(s.t1); els.t2.textContent=L(s.t2);
    els.sub.textContent=L(s.sub);
    els.store.textContent=L(s.store);
    els.storeLink.href=s.href;
    dotEls.forEach((d,i)=>{ const on=i===idx; d.classList.toggle("is-active",on); d.setAttribute("aria-selected", on?"true":"false"); });
    if(animate) anim();
  }
  function go(n,user){ idx=(n+SLIDES.length)%SLIDES.length; render(true); if(user) start(); }
  function next(user){ go(idx+1,user); }
  function prev(user){ go(idx-1,user); }
  function start(){ stop(); timer=setInterval(()=>next(false),DUR); }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }

  root.querySelector("[data-hero-next]").addEventListener("click",()=>next(true));
  root.querySelector("[data-hero-prev]").addEventListener("click",()=>prev(true));
  root.addEventListener("mouseenter",stop);
  root.addEventListener("mouseleave",start);

  let sx=null;
  root.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;},{passive:true});
  root.addEventListener("touchend",e=>{ if(sx===null)return;
    const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>45){ dx<0?next(true):prev(true); } sx=null;
  },{passive:true});

  new MutationObserver(()=>{
    const nl=document.documentElement.lang;
    if(nl && nl!==lang && ["ru","uz","en"].includes(nl)){ lang=nl; render(false); syncDotLabels(); }
  }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

  render(false);
  const card=root.querySelector("[data-hero-card]");
  function enterHero(){
    if(!card) return;
    card.classList.add("is-entered");
  }
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    enterHero();
  }else{
    setTimeout(enterHero, 200);
  }
  if(!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) start();
})();
