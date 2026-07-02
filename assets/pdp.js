/* Bententrade — product detail page interactions + data hydration
   Reads ?id=p1 from the URL and fills the page from BTT_PRODUCTS / BTT_PRODUCT_CAT.
   Name & category come from the shared i18n dictionary; category copy/specs from
   products.js. Re-renders on language change. cart/fav binding is global (site.js). */
(function(){
  "use strict";

  const PRODUCTS = window.BTT_PRODUCTS || {};
  const CATTEXT  = window.BTT_PRODUCT_CAT || {};
  const DICT     = window.BTT_I18N || {};

  const params = new URLSearchParams(location.search);
  let id = params.get("id");
  if(!PRODUCTS[id]) id = "p1";
  const prod = PRODUCTS[id];
  const num  = id.replace("p","");

  const $  = s => document.querySelector(s);
  const lang = () => { const l = document.documentElement.lang; return DICT[l] ? l : "ru"; };
  const t = key => (DICT[lang()]||DICT.ru||{})[key];

  /* ---- one-time: images, then strip data-i18n from managed nodes ---- */
  function setImages(){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    if(!imgs) return;
    const thumbs = document.querySelectorAll("[data-thumb] img");
    const stage  = document.querySelectorAll("[data-stage] img");
    imgs.forEach((im,i)=>{
      if(thumbs[i]) thumbs[i].src = im.thumb;
      if(stage[i])  stage[i].src  = im.full;
    });
  }

  function detach(sel){ const el=$(sel); if(el) el.removeAttribute("data-i18n"); return el; }

  // managed nodes (we own their text so language switches re-render via render())
  const node = {
    crumb: detach(".crumb .cur"),
    cat:   detach(".pdp-info .product__cat"),
    name:  detach(".pdp-info h1"),
    desc:  detach(".pdp-desc"),
  };
  detach(".pdp-price .save");
  const specVals = document.querySelectorAll(".pdp-detail .spec-row .v");
  specVals.forEach(v=>v.removeAttribute("data-i18n"));
  const sizeRow = $(".size-row");

  function render(){
    const c = (CATTEXT[prod.cat]||CATTEXT.desk);
    const ct = c[lang()] || c.ru;
    const nm = t("p"+num+".name");
    const cat = t("p"+num+".cat");

    if(node.name) node.name.textContent = nm || node.name.textContent;
    if(node.crumb) node.crumb.textContent = nm || node.crumb.textContent;
    if(node.cat) node.cat.textContent = cat || "";
    if(node.desc) node.desc.textContent = ct.desc;
    document.title = "Bententrade — " + (nm || "");

    // price
    const now = $(".pdp-price .now"), old = $(".pdp-price .old"), save = $(".pdp-price .save");
    if(now) now.textContent = "$"+prod.now;
    if(old) old.style.display = prod.old ? "" : "none";
    if(old && prod.old) old.textContent = "$"+prod.old;
    if(save){
      if(prod.old){
        save.style.display = "";
        const word = {ru:"Экономия",uz:"Tejash",en:"Save"}[lang()] || "Экономия";
        save.textContent = word + " $" + (prod.old - prod.now);
      } else save.style.display = "none";
    }
    // sale badge on stage
    const badge = $(".pdp-stage .badge-sale");
    if(badge){
      if(prod.old){ badge.style.display=""; badge.textContent = "-"+Math.round((1-prod.now/prod.old)*100)+"%"; }
      else badge.style.display = "none";
    }

    // specs (order: material, dimensions, finish, weight, seats, made)
    const vals = [ct.mat, ct.dim, ct.fin, ct.wt, ct.seat, ct.made];
    specVals.forEach((el,i)=>{ if(vals[i]!=null) el.textContent = vals[i]; });

    // size options
    if(sizeRow){
      const sizes = c.sizes || [];
      const btns = sizeRow.querySelectorAll("button");
      btns.forEach((b,i)=>{
        if(sizes[i]!=null){ b.textContent = sizes[i]; b.style.display=""; }
        else b.style.display = "none";
        b.classList.toggle("is-active", i === (c.defSize||0));
      });
    }
  }

  setImages();
  render();

  // re-render when site.js changes <html lang="…">
  new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

  /* ---- gallery ---- */
  const stage = document.querySelectorAll("[data-stage] img");
  const thumbs = document.querySelectorAll("[data-thumb]");
  function showImg(i){
    stage.forEach((im,k)=>im.classList.toggle("is-on", k===i));
    thumbs.forEach((t,k)=>t.classList.toggle("is-active", k===i));
  }
  thumbs.forEach((t,i)=>{
    t.addEventListener("mouseenter",()=>showImg(i));
    t.addEventListener("click",()=>showImg(i));
  });

  /* ---- single-select groups (swatches, sizes) ---- */
  document.querySelectorAll("[data-select]").forEach(group=>{
    group.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        group.querySelectorAll("button").forEach(b=>b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  });

  /* ---- quantity stepper ---- */
  document.querySelectorAll("[data-qty]").forEach(q=>{
    const input = q.querySelector("input");
    const clamp = v => Math.max(1, Math.min(99, v||1));
    q.querySelector("[data-qd]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)-1); });
    q.querySelector("[data-qu]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)+1); });
    input.addEventListener("change",()=>{ input.value = clamp(parseInt(input.value,10)); });
  });
})();
