/* ============================================================
   BENTENTRADE — site assistant "Бен"
   Self-injecting glass chat widget. Scripted, multilingual,
   segments the visitor and routes to catalog / manager.
   No backend — deterministic intent tree.
   ============================================================ */
(function(){
  const T = {
    ru:{
      name:"Бен", role:"Онлайн-помощник", badge:"1",
      ph:"Напишите сообщение…",
      hi:"Здравствуйте! Я Бен, помощник Bententrade 🌿 Помогу подобрать изделия из искусственного ротанга. С чего начнём?",
      quick:["Садовая мебель","Кашпо","Корзины и сундуки","Доставка","Связаться с менеджером"],
      ans:{
        "Садовая мебель":"Диваны, кресла и обеденные группы из искусственного ротанга — всесезонные, на алюминиевом каркасе. Смотрите в <a href='catalog.html?cat=furniture'>каталоге</a>. Подобрать под размер террасы?",
        "Кашпо":"Плетёные кашпо с дренажом и вкладышем — для дома, балкона и сада. Вся подборка в <a href='catalog.html?cat=planterMix'>каталоге</a>. Подсказать по размеру?",
        "Корзины и сундуки":"Сундуки и корзины для белья из искусственного ротанга — с подкладкой и крышкой. Смотрите в <a href='catalog.html?cat=planterMix'>каталоге</a>. Нужен размер S/M/L?",
        "Доставка":"Доставляем по всему Узбекистану за 7–10 дней, по Ташкенту — быстрее. Изделия привозим в собранном виде. Назовёте город — подскажу сроки.",
        "Связаться с менеджером":"Конечно! Денис на связи в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> и по телефону <a href='tel:+998771044422'>+998 77 104 44 22</a>. Оформить заказ через корзину?"
      },
      fallback:"Спасибо за вопрос! Я передам его менеджеру — он ответит детально. Пока можете посмотреть <a href='catalog.html'>каталог</a> или выбрать тему ниже 👇",
      reply:"Понял! Менеджер свяжется с вами в ближайшее время. Что-нибудь ещё?"
    },
    uz:{
      name:"Ben", role:"Onlayn yordamchi", badge:"1",
      ph:"Xabar yozing…",
      hi:"Salom! Men Ben, Bententrade yordamchisi 🌿 Sun’iy rotangdan yasalgan buyumlarni tanlashda yordam beraman. Nimadan boshlaymiz?",
      quick:["Bog‘ mebeli","Gultuvak","Savat va sandiq","Yetkazib berish","Menejer bilan bog‘lanish"],
      ans:{
        "Bog‘ mebeli":"Sun’iy rotangdan divan, kreslo va ovqat to‘plamlari — har faslga mos, alyumin karkasda. <a href='catalog.html?cat=furniture'>Katalog</a>ni ko‘ring. Terassa o‘lchamiga moslab beraymi?",
        "Gultuvak":"Drenaj va vkladishli to‘qilgan gultuvaklar — uy, balkon va bog‘ uchun. Hammasi <a href='catalog.html?cat=planterMix'>katalogda</a>. O‘lcham bo‘yicha aytaymi?",
        "Savat va sandiq":"Sun’iy rotangdan kir savati va sandiqlar — astar va qopqoq bilan. <a href='catalog.html?cat=planterMix'>Katalog</a>ni ko‘ring. S/M/L o‘lcham kerakmi?",
        "Yetkazib berish":"O‘zbekiston bo‘ylab 7–10 kun, Toshkent bo‘ylab tezroq. Buyumlarni yig‘ilgan holda yetkazamiz. Shaharni ayting — muddatni aytaman.",
        "Menejer bilan bog‘lanish":"Albatta! Denis Telegramda <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> va telefon <a href='tel:+998771044422'>+998 77 104 44 22</a>. Buyurtmani savat orqali rasmiylashtiraymi?"
      },
      fallback:"Savolingiz uchun rahmat! Menejerga yetkazaman. Hozircha <a href='catalog.html'>katalog</a>ni ko‘ring yoki quyidan mavzu tanlang 👇",
      reply:"Tushunarli! Menejer tez orada bog‘lanadi. Yana biror narsa kerakmi?"
    },
    en:{
      name:"Ben", role:"Online assistant", badge:"1",
      ph:"Type a message…",
      hi:"Hi! I'm Ben, the Bententrade assistant 🌿 I can help you pick synthetic-rattan pieces. Where shall we start?",
      quick:["Garden furniture","Planters","Baskets & chests","Delivery","Talk to a manager"],
      ans:{
        "Garden furniture":"Sofas, armchairs and dining sets in synthetic rattan — all-season, on an aluminium frame. Browse the <a href='catalog.html?cat=furniture'>catalog</a>. Want me to match it to your terrace?",
        "Planters":"Woven planters with drainage and a liner — for home, balcony and garden. See them all in the <a href='catalog.html?cat=planterMix'>catalog</a>. Want sizing help?",
        "Baskets & chests":"Synthetic-rattan laundry baskets and chests — with a liner and lid. See the <a href='catalog.html?cat=planterMix'>catalog</a>. Need an S/M/L size?",
        "Delivery":"We ship across Uzbekistan in 7–10 days, faster within Tashkent. Pieces arrive fully assembled. Tell me your city for exact timing.",
        "Talk to a manager":"Of course! Denis is on Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> and phone <a href='tel:+998771044422'>+998 77 104 44 22</a>. Want to place the order via the cart?"
      },
      fallback:"Thanks for your question! I'll pass it to our manager for a detailed reply. Meanwhile, check the <a href='catalog.html'>catalog</a> or pick a topic below 👇",
      reply:"Got it! Our manager will reach out shortly. Anything else?"
    }
  };

  function lang(){ var s=localStorage.getItem("btt_lang"); return T[s]?s:"ru"; }

  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".bot-fab")) return;

    const fab=document.createElement("button");
    fab.className="bot-fab"; fab.setAttribute("aria-label","Чат-помощник");
    fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.4-5.2A8.4 8.4 0 0 1 3.5 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg><span class="bot-fab__badge">1</span>';

    const panel=document.createElement("div");
    panel.className="bot-panel liquid spatial"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Bententrade assistant");
    panel.innerHTML=
      '<div class="bot-head"><div class="bot-head__ava">Б</div>'+
      '<div><div class="bot-head__t" data-bot-name>Бен</div><div class="bot-head__s" data-bot-role>Онлайн-помощник</div></div>'+
      '<button class="bot-head__x" data-bot-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="bot-msgs" data-bot-msgs></div>'+
      '<div class="bot-quick" data-bot-quick></div>'+
      '<form class="bot-input" data-bot-form><input type="text" data-bot-input autocomplete="off"><button class="bot-send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg></button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgs=panel.querySelector("[data-bot-msgs]");
    const quick=panel.querySelector("[data-bot-quick]");
    const input=panel.querySelector("[data-bot-input]");
    let started=false;

    function add(text, who){
      const m=document.createElement("div");
      m.className="bot-msg bot-msg--"+who;
      if(who === "user") m.textContent = text;
      else m.innerHTML = text;
      msgs.appendChild(m); msgs.scrollTop=msgs.scrollHeight;
      return m;
    }
    function typing(){
      const t=document.createElement("div");
      t.className="bot-typing"; t.innerHTML="<span></span><span></span><span></span>";
      msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight; return t;
    }
    function botSay(text, delay){
      const t=typing();
      setTimeout(()=>{ t.remove(); add(text,"bot"); }, delay||650);
    }
    function renderQuick(){
      const d=T[lang()]; quick.innerHTML="";
      d.quick.forEach(label=>{
        const c=document.createElement("button");
        c.className="bot-chip"; c.type="button"; c.textContent=label;
        c.addEventListener("click",()=> handle(label));
        quick.appendChild(c);
      });
    }
    function applyLang(){
      const d=T[lang()];
      panel.querySelector("[data-bot-name]").textContent=d.name;
      panel.querySelector("[data-bot-role]").textContent=d.role;
      input.placeholder=d.ph;
      renderQuick();
    }
    function handle(text){
      add(text,"user");
      const d=T[lang()];
      const ans = d.ans[text];
      botSay(ans || d.fallback, ans?700:600);
    }
    function open(){
      panel.classList.add("open"); fab.classList.add("hidden");
      if(!started){ started=true; setTimeout(()=> botSay(T[lang()].hi, 500), 250); }
      setTimeout(()=> input.focus(), 320);
    }
    function close(){ panel.classList.remove("open"); fab.classList.remove("hidden"); }

    fab.addEventListener("click", open);
    panel.querySelector("[data-bot-close]").addEventListener("click", close);
    panel.querySelector("[data-bot-form]").addEventListener("submit",(e)=>{
      e.preventDefault();
      const v=input.value.trim(); if(!v) return;
      input.value="";
      add(v,"user");
      const d=T[lang()];
      botSay(d.fallback, 700);
      setTimeout(()=> botSay(d.reply, 1500), 900);
    });

    document.addEventListener("btt:lang", applyLang);
    new MutationObserver(()=> applyLang()).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    applyLang();
  });
})();
