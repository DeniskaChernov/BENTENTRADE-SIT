/* Bententrade — product catalogue data (artificial-rattan range)
   Three lines: garden furniture (furniture) · planters / kashpo (planter)
   · chests & laundry baskets (basket). Names & on-card category come from the
   i18n dictionary (p{n}.name / p{n}.cat); PDP copy + specs are category-based
   and translated in CAT below. Imagery is deterministic loremflickr (topical). */
(function(){
  "use strict";

  // deterministic topical photo (square) — kw="rattan,sofa", lock=11
  const F = (kw,lock,w) => "https://loremflickr.com/"+w+"/"+w+"/"+kw+"/all?lock="+lock;

  // a "look" = 4 [keyword, lock] pairs (main + 3 alternates)
  const LOOK = {
    sofa:    [["rattan,sofa",11],["patio,furniture",31],["outdoor,sofa",41],["wicker,chair",2]],
    dining:  [["rattan,dining",14],["patio,table",32],["garden,table",42],["outdoor,furniture",52]],
    lounge:  [["wicker,chair",2],["rattan,chair",17],["lounge,chair",37],["egg,chair",47]],
    chair:   [["rattan,chair",17],["wicker,chair",27],["garden,chair",38],["patio,chair",48]],
    corner:  [["rattan,sofa",19],["outdoor,sofa",29],["patio,furniture",39],["garden,sofa",49]],
    planterT:[["wicker,planter",4],["rattan,plant",24],["woven,basket",34],["plant,pot",44]],
    planterS:[["rattan,plant",24],["wicker,planter",15],["plant,pot",45],["woven,basket",4]],
    planterSet:[["plant,pot",44],["wicker,planter",4],["rattan,plant",24],["woven,basket",34]],
    chest:   [["woven,basket",34],["wicker,basket",54],["rattan,storage",64],["wicker,trunk",74]],
    laundry: [["wicker,basket",54],["laundry,basket",84],["woven,basket",34],["rattan,storage",64]],
    rocker:  [["rattan,rocking,chair",90],["wicker,rocking,chair",91],["rattan,chair",17],["lounge,chair",37]],
    coffee:  [["rattan,coffee,table",92],["wicker,table",93],["rattan,table",14],["living,room,table",94]],
    cabinet: [["rattan,cabinet",95],["wicker,dresser",96],["rattan,sideboard",97],["woven,cabinet",98]],
    shelf:   [["rattan,shelf",99],["wicker,shelf",100],["rattan,bookcase",101],["woven,shelf",102]]
  };

  window.BTT_PRODUCTS = {
    p1: {cat:"furniture", look:"sofa",      now:780, old:980},
    p2: {cat:"furniture", look:"lounge",    now:340, old:420},
    p3: {cat:"planter",   look:"planterT",  now:95,  old:130},
    p4: {cat:"furniture", look:"dining",    now:1180,old:0},
    p5: {cat:"furniture", look:"chair",     now:260, old:340},
    p6: {cat:"basket",    look:"chest",     now:180, old:0},
    p7: {cat:"planter",   look:"planterS",  now:48,  old:64},
    p8: {cat:"furniture", look:"chair",     now:155, old:0},
    p9: {cat:"planter",   look:"planterSet",now:210, old:280},
    p10:{cat:"furniture", look:"corner",    now:1640,old:1990},
    p11:{cat:"basket",    look:"laundry",   now:72,  old:0},
    p12:{cat:"indoor",    look:"rocker",    now:290, old:360},
    p13:{cat:"indoor",    look:"coffee",    now:210, old:0},
    p14:{cat:"indoor",    look:"cabinet",   now:540, old:680},
    p15:{cat:"indoor",    look:"shelf",     now:320, old:390}
  };

  window.BTT_PRODUCT_IMG = id => {
    const p = window.BTT_PRODUCTS[id]; if(!p) return null;
    return LOOK[p.look].map(([kw,lock]) => ({ thumb:F(kw,lock,300), full:F(kw,lock,1100) }));
  };

  // category-based PDP copy & specs. 5th spec ("seat") is repurposed as "Use".
  window.BTT_PRODUCT_CAT = {
    furniture:{
      sizes:["2-местный","3-местный","Угловой"], defSize:1,
      ru:{desc:"Садовая мебель из искусственного ротанга на лёгком алюминиевом каркасе. Плотное ручное плетение не выгорает на солнце, не боится дождя и перепадов температур — комплект круглый год может стоять на террасе, во дворе или в саду.",
          mat:"Искусственный ротанг + алюминий",dim:"С подушками, всесезонный",fin:"UV-стойкое плетение",wt:"Каркас алюминий",seat:"Терраса, двор, сад",made:"Ташкент, ручная работа"},
      uz:{desc:"Yengil alyumin karkasdagi sun’iy rotangdan bog‘ mebeli. Zich qo‘l to‘quvi quyoshda rangini yo‘qotmaydi, yomg‘ir va harorat o‘zgarishidan qo‘rqmaydi — to‘plam yil bo‘yi terassa, hovli yoki bog‘da turishi mumkin.",
          mat:"Sun’iy rotang + alyumin",dim:"Yostiqlar bilan, har faslga",fin:"UV-chidamli to‘quv",wt:"Alyumin karkas",seat:"Terassa, hovli, bog‘",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"Garden furniture in synthetic rattan over a light aluminium frame. The dense hand-weave won't fade in the sun and shrugs off rain and temperature swings — the set can stay on the terrace, in the yard or garden all year round.",
          mat:"Synthetic rattan + aluminium",dim:"With cushions, all-season",fin:"UV-stable weave",wt:"Aluminium frame",seat:"Terrace, yard, garden",made:"Tashkent, by hand"}
    },
    planter:{
      sizes:["Ø30 см","Ø40 см","Ø55 см"], defSize:1,
      ru:{desc:"Кашпо, плетённое вручную из искусственного ротанга, со скрытым внутренним вкладышем и дренажом. Лёгкое, не гниёт и не трескается — одинаково хорошо смотрится с живыми растениями дома, на балконе и в саду.",
          mat:"Искусственный ротанг",dim:"Со вкладышем и дренажом",fin:"Влагостойкое плетение",wt:"Лёгкое",seat:"Дом, балкон, сад",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan qo‘lda to‘qilgan gultuvak, yashirin ichki vkladish va drenaj bilan. Yengil, chirimaydi va yorilmaydi — uy, balkon va bog‘da jonli o‘simliklar bilan birdek chiroyli ko‘rinadi.",
          mat:"Sun’iy rotang",dim:"Vkladish va drenaj bilan",fin:"Namlikka chidamli to‘quv",wt:"Yengil",seat:"Uy, balkon, bog‘",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"A planter hand-woven from synthetic rattan, with a hidden inner liner and drainage. Light, rot- and crack-proof — it looks equally good with live plants indoors, on the balcony and in the garden.",
          mat:"Synthetic rattan",dim:"With liner & drainage",fin:"Moisture-resistant weave",wt:"Lightweight",seat:"Home, balcony, garden",made:"Tashkent, by hand"}
    },
    basket:{
      sizes:["S","M","L"], defSize:1,
      ru:{desc:"Сундук и корзина для белья из искусственного ротанга с мягкой тканевой подкладкой и крышкой. Держит форму, не цепляет ткань и проветривается — для хранения белья, пледов, игрушек и мелочей в спальне или ванной.",
          mat:"Искусственный ротанг + подкладка",dim:"С крышкой и подкладкой",fin:"Гладкое плетение",wt:"Складная подкладка",seat:"Бельё, пледы, хранение",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan yumshoq mato astarli va qopqoqli sandiq hamda kir savati. Shaklini saqlaydi, matoga ilashmaydi va shamollatiladi — yotoqxona yoki hammomda kir, pled, o‘yinchoq va mayda buyumlar uchun.",
          mat:"Sun’iy rotang + astar",dim:"Qopqoq va astar bilan",fin:"Silliq to‘quv",wt:"Yig‘iladigan astar",seat:"Kir, pled, saqlash",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"A chest and laundry basket in synthetic rattan with a soft fabric liner and lid. Holds its shape, won't snag fabric and stays ventilated — for laundry, throws, toys and bits in the bedroom or bathroom.",
          mat:"Synthetic rattan + liner",dim:"With lid & liner",fin:"Smooth weave",wt:"Foldable liner",seat:"Laundry, throws, storage",made:"Tashkent, by hand"}
    },
    indoor:{
      sizes:["Компакт","Стандарт","Большой"], defSize:1,
      ru:{desc:"Мебель для дома из искусственного ротанга: лёгкая, тёплая на вид и практичная. Плетение не боится влаги и перепадов, легко протирается влажной тканью — под гостиную, спальню, прихожую или балкон.",
          mat:"Искусственный ротанг + каркас",dim:"Для интерьера, всесезонно",fin:"Гладкое плетение",wt:"Лёгкий каркас",seat:"Гостиная, спальня, балкон",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan uy mebeli: yengil, ko‘rinishi issiq va amaliy. To‘quv namlik va o‘zgarishlardan qo‘rqmaydi, nam mato bilan oson artiladi — mehmonxona, yotoqxona, dahliz yoki balkon uchun.",
          mat:"Sun’iy rotang + karkas",dim:"Interyer uchun, har faslga",fin:"Silliq to‘quv",wt:"Yengil karkas",seat:"Mehmonxona, yotoqxona, balkon",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"Home furniture in synthetic rattan: light, warm-looking and practical. The weave shrugs off humidity and temperature swings and wipes clean with a damp cloth — right for the living room, bedroom, hallway or balcony.",
          mat:"Synthetic rattan + frame",dim:"For interiors, all-season",fin:"Smooth weave",wt:"Light frame",seat:"Living room, bedroom, balcony",made:"Tashkent, by hand"}
    }
  };
})();
