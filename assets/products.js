/* BTT - мебель для дома и сада
   Product master data (exact 15 SKUs, Single Source of Truth).
   All prices are in UZS. Generated from data/products-master.json. */
(function(){
  "use strict";

  var MASTER = [
  {
    "slug": "stul-vertex",
    "legacyId": "p1",
    "model": "Vertex",
    "category": "wicker-chairs",
    "price": 499000,
    "dimensions": "57 × 63 × 75 см",
    "materials": [
      "металл",
      "кручёный искусственный ротанг",
      "текстиль"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "beige",
        "name": {
          "ru": "Бежевый",
          "uz": "Bej",
          "en": "Beige"
        },
        "hex": "#C2B280"
      }
    ],
    "isTable": false,
    "images": [
      "assets/prod-chair-corda.jpg",
      "assets/scene-dining-warm.png",
      "assets/hero-garden-furniture.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «Vertex»",
        "category_label": "Плетёные стулья",
        "description": "Плетёный стул Vertex с каркасом из металла и плетением из кручёного искусственного ротанга. Комплектуется мягкой текстильной подушкой. Отлично подходит для дома, веранды, террасы и ресторанов.",
        "usage": "Для гостиной, террасы, балкона, кафе и ресторанов"
      },
      "uz": {
        "name": "«Vertex» stuli",
        "category_label": "To‘qilgan stullar",
        "description": "Metall karkasli va burma sun’iy rotangdan to‘qilgan Vertex stuli. Yumshoq to‘qimachilik yostig‘i bilan jihozlangan. Uy, ayvon, terrasa va restoranlar uchun ajoyib tanlov.",
        "usage": "Mehmonxona, terrasa, balkon, kafe va restoranlar uchun"
      },
      "en": {
        "name": "Vertex Chair",
        "category_label": "Wicker chairs",
        "description": "Vertex wicker chair featuring a sturdy metal frame and twisted synthetic rattan weave. Comes with a soft textile cushion. Ideal for homes, covered patios, terraces, and dining venues.",
        "usage": "For living spaces, terraces, balconies, cafes and restaurants"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-corda",
    "legacyId": "p2",
    "model": "Corda",
    "category": "wicker-chairs",
    "price": 499000,
    "dimensions": "57 × 63 × 77 см",
    "materials": [
      "металл",
      "искусственный ротанг",
      "текстиль"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": false,
    "images": [
      "assets/prod-chair-corda.jpg",
      "assets/scene-dining-warm.png",
      "assets/hero-garden-furniture.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «Corda»",
        "category_label": "Плетёные стулья",
        "description": "Стул Corda на прочном металлическом каркасе с плотным плетением из искусственного ротанга и мягкой текстильной подушкой. Сочетает комфортную посадку и долговечность.",
        "usage": "Для террасы, загородного дома, летних площадок и кухни"
      },
      "uz": {
        "name": "«Corda» stuli",
        "category_label": "To‘qilgan stullar",
        "description": "Mustahkam metall karkas va zich sun’iy rotang to‘quviga ega Corda stuli. Yumshoq mato yostiq bilan to‘ldirilgan, qulay o‘tirish va mustahkamlikni ta’minlaydi.",
        "usage": "Terrasa, dala hovli, yozgi maydonlar va oshxona uchun"
      },
      "en": {
        "name": "Corda Chair",
        "category_label": "Wicker chairs",
        "description": "Corda chair on a solid metal frame with dense synthetic rattan weave and textile cushion. Delivers ergonomic comfort and stylish durability.",
        "usage": "For terraces, country homes, outdoor dining and kitchens"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-roero",
    "legacyId": "p3",
    "model": "ROERO",
    "category": "plastic-chairs",
    "price": 168000,
    "dimensions": "74 × 46 × 48 см",
    "materials": [
      "пластик"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "grey",
        "name": {
          "ru": "Серый",
          "uz": "Kulrang",
          "en": "Grey"
        },
        "hex": "#808080"
      }
    ],
    "isTable": false,
    "images": [
      "assets/hero-garden-furniture.png",
      "assets/scene-dining-grey.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «ROERO»",
        "category_label": "Пластиковые стулья",
        "description": "Лёгкий и практичный стул ROERO из прочного износостойкого пластика. Легко очищается влажной салфеткой и удобен в хранении.",
        "usage": "Для кухни, дачи, террасы, фудкортов и уличных кафе"
      },
      "uz": {
        "name": "«ROERO» stuli",
        "category_label": "Plastik stullar",
        "description": "Pishiq va yengil ROERO plastik stuli. Tozalash oson va saqlash uchun juda qulay.",
        "usage": "Oshxona, dala hovli, terrasa, fudkort va ochiq kafelar uchun"
      },
      "en": {
        "name": "ROERO Chair",
        "category_label": "Plastic chairs",
        "description": "Lightweight and practical ROERO plastic chair. Easy to clean and convenient to store.",
        "usage": "For kitchens, patios, outdoor cafes and food courts"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-noero",
    "legacyId": "p4",
    "model": "NOERO",
    "category": "plastic-chairs",
    "price": 192000,
    "dimensions": "82 × 48 × 49 см",
    "materials": [
      "пластик"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "cappuccino",
        "name": {
          "ru": "Капучино",
          "uz": "Kapuchino",
          "en": "Cappuccino"
        },
        "hex": "#A88D73"
      }
    ],
    "isTable": false,
    "images": [
      "assets/hero-garden-furniture.png",
      "assets/scene-dining-warm.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «NOERO»",
        "category_label": "Пластиковые стулья",
        "description": "Эргономичный пластиковый стул NOERO с удобной спинкой высотой 82 см. Стильный тёплый оттенок капучино прекрасно дополняет современные интерьеры.",
        "usage": "Для дома, террасы, летних веранд, кафе"
      },
      "uz": {
        "name": "«NOERO» stuli",
        "category_label": "Plastik stullar",
        "description": "82 sm balandlikdagi qulay suyanchiqqa ega ergonomik NOERO stuli. Chiroyli kapuchino rangi har qanday zamonaviy muhitga mos tushadi.",
        "usage": "Uy, terrasa, yozgi ayvonlar, kafe uchun"
      },
      "en": {
        "name": "NOERO Chair",
        "category_label": "Plastic chairs",
        "description": "Ergonomic NOERO plastic chair with an 82 cm supportive backrest. Modern cappuccino hue fits various interior and terrace settings.",
        "usage": "For dining areas, terraces, verandas, cafes"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-todo",
    "legacyId": "p5",
    "model": "TODO",
    "category": "plastic-chairs",
    "price": 216000,
    "dimensions": "80 × 51 × 51 см",
    "materials": [
      "пластик"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "black",
        "name": {
          "ru": "Чёрный",
          "uz": "Qora",
          "en": "Black"
        },
        "hex": "#222222"
      }
    ],
    "isTable": false,
    "images": [
      "assets/hero-garden-furniture.png",
      "assets/prod-table-vertex-black.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «TODO»",
        "category_label": "Пластиковые стулья",
        "description": "Пластиковый стул TODO с лаконичной геометрией сиденья и устойчивой конструкцией. Подходит для террас, дома и общественных зон.",
        "usage": "Для общественных зон, заведений HoReCa, террас, дома"
      },
      "uz": {
        "name": "«TODO» stuli",
        "category_label": "Plastik stullar",
        "description": "Aniq geometriya va barqaror tuzilishga ega TODO plastik stuli. Terrasa, xonadon va jamoat joylari uchun mos keladi.",
        "usage": "Jamoat joylari, HoReCa muassasalari, terrasa, xonadonlar uchun"
      },
      "en": {
        "name": "TODO Chair",
        "category_label": "Plastic chairs",
        "description": "TODO plastic chair featuring clean geometry and a stable construction. Suitable for terraces, homes and high-traffic venues.",
        "usage": "For commercial venues, HoReCa, terraces, homes"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-jardin",
    "legacyId": "p6",
    "model": "JARDIN",
    "category": "plastic-chairs",
    "price": 324000,
    "dimensions": "73.5 × 53.5 × 55.5 см",
    "materials": [
      "пластик"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "cappuccino",
        "name": {
          "ru": "Капучино",
          "uz": "Kapuchino",
          "en": "Cappuccino"
        },
        "hex": "#A88D73"
      }
    ],
    "isTable": false,
    "images": [
      "assets/hero-garden-furniture.png",
      "assets/scene-dining-warm.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «JARDIN»",
        "category_label": "Пластиковые стулья",
        "description": "Комфортное пластиковое кресло-стул JARDIN с широким сиденьем и подлокотниками. Практичное решение для отдыха в саду и на веранде.",
        "usage": "Для сада, веранды, зоны отдыха, загородного дома"
      },
      "uz": {
        "name": "«JARDIN» stuli",
        "category_label": "Plastik stullar",
        "description": "Keng o‘rindiq va tirsak suyanchig‘iga ega JARDIN plastik kreslo-stuli. Bog‘ va ayvonda hordiq chiqarish uchun qulay yechim.",
        "usage": "Bog‘, ayvon, dam olish hududi, dala hovli uchun"
      },
      "en": {
        "name": "JARDIN Chair",
        "category_label": "Plastic chairs",
        "description": "Comfortable JARDIN plastic armchair featuring wide seating and integrated armrests. Practical choice for garden relaxation and patio dining.",
        "usage": "For gardens, verandas, lounge areas, patio dining"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stul-lira",
    "legacyId": "p7",
    "model": "LIRA",
    "category": "upholstered-chairs",
    "price": 354000,
    "dimensions": "95 × 55 × 48 см",
    "materials": [
      "металл",
      "текстиль"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": false,
    "images": [
      "assets/hero-home-furniture.png",
      "assets/scene-dining-azure.png"
    ],
    "i18n": {
      "ru": {
        "name": "Стул «LIRA»",
        "category_label": "Мягкие стулья",
        "description": "Элегантный стул LIRA с мягким сиденьем и высокой спинкой 95 см на прочном металлическом каркасе. Прекрасный выбор для обеденной зоны в квартире или загородном доме.",
        "usage": "Для столовой, гостиной, кухни, банкетных залов"
      },
      "uz": {
        "name": "«LIRA» stuli",
        "category_label": "Yumshoq stullar",
        "description": "Mustahkam metall karkasdagi yumshoq o‘rindiq va 95 sm baland suyanchiqqa ega nafis LIRA stuli. Oshxona va mehmonxona ovqatlanish hududi uchun ajoyib tanlov.",
        "usage": "Oshxona, mehmonxona, banket zallari uchun"
      },
      "en": {
        "name": "LIRA Chair",
        "category_label": "Upholstered chairs",
        "description": "Elegant LIRA chair featuring soft upholstery and a high 95 cm backrest on a sturdy metal frame. An attractive fit for home dining rooms and banquet spaces.",
        "usage": "For dining rooms, living spaces, banquet halls"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "kreslo-como",
    "legacyId": "p8",
    "model": "COMO",
    "category": "upholstered-chairs",
    "price": 486000,
    "dimensions": "82 × 63 × 60 см",
    "materials": [
      "металл",
      "текстиль"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": false,
    "images": [
      "assets/hero-home-furniture.png",
      "assets/scene-dining-warm.png"
    ],
    "i18n": {
      "ru": {
        "name": "Кресло «COMO»",
        "category_label": "Мягкие стулья",
        "description": "Мягкое кресло COMO с глубокой посадкой, металлическим каркасом и приятной текстильной обивкой. Создаёт уютную атмосферу для отдыха и долгих бесед.",
        "usage": "Для гостиной, лаунж-зон, кабинета, спальни"
      },
      "uz": {
        "name": "«COMO» kreslosi",
        "category_label": "Yumshoq stullar",
        "description": "Chuqur o‘rindiqli, metall karkasli va yoqimli matoli COMO yumshoq kreslosi. Dam olish va suhbatlar uchun shinam muhit yaratadi.",
        "usage": "Mehmonxona, dam olish zonalari, kabinet, yotoqxona uchun"
      },
      "en": {
        "name": "COMO Armchair",
        "category_label": "Upholstered chairs",
        "description": "COMO upholstered lounge armchair with a deep seat profile, metal frame, and comfortable textile padding. Brings relaxed elegance to any lounge or living room.",
        "usage": "For living rooms, lounge areas, offices, bedrooms"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-taper-rotang-80",
    "legacyId": "p9",
    "model": "Taper Rotang 80x80",
    "category": "tables",
    "price": 615000,
    "dimensions": "80 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл",
      "искусственный ротанг"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-dining-room.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Taper Rotang 80x80»",
        "category_label": "Столы",
        "description": "Компактный квадратный стол Taper Rotang 80×80 см. Каркас из металла с декоративной отделкой из искусственного ротанга и столешницей из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для крытых террас, кухни, кофеен и балконов"
      },
      "uz": {
        "name": "«Taper Rotang 80x80» stoli",
        "category_label": "Stollar",
        "description": "Ixcham kvadrat Taper Rotang 80×80 sm stoli. Metall karkas, sun’iy rotang bezagi va LDSP ustki qismi. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Yopiq terrasalar, oshxona, kofeynya va balkonlar uchun"
      },
      "en": {
        "name": "Taper Rotang 80x80 Table",
        "category_label": "Tables",
        "description": "Compact square table Taper Rotang 80×80 cm. Metal frame accented with synthetic rattan and durable chipboard tabletop. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For covered patios, kitchens, cafes and balconies"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-vertex-d90",
    "legacyId": "p10",
    "model": "Vertex D90",
    "category": "tables",
    "price": 680000,
    "dimensions": "Ø90 × 75 см",
    "materials": [
      "ЛДСП",
      "металл"
    ],
    "maxLoad": null,
    "confirmedColors": [
      {
        "id": "white-marble",
        "name": {
          "ru": "Белый мрамор",
          "uz": "Oq marmar",
          "en": "White Marble"
        },
        "hex": "#E8E6E1"
      }
    ],
    "isTable": true,
    "images": [
      "assets/prod-table-vertex-white.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Vertex D90»",
        "category_label": "Столы",
        "description": "Круглый обеденный стол Vertex диаметром 90 см со столешницей цвета белый мрамор и металлическим основанием. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для обеденных зон, кухонь, кафе и крытых террас"
      },
      "uz": {
        "name": "«Vertex D90» stoli",
        "category_label": "Stollar",
        "description": "Oq marmar teksturali LDSP ustki qismi va metall asosga ega 90 sm diametrli dumaloq Vertex stuli. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Ovqatlanish hududi, oshxonalar, kafe va yopiq terrasalar uchun"
      },
      "en": {
        "name": "Vertex D90 Table",
        "category_label": "Tables",
        "description": "Round 90 cm dining table Vertex featuring a white marble finish chipboard tabletop and robust metal base. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For dining nooks, kitchens, cafes, covered verandas"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-taper-rotang-135",
    "legacyId": "p11",
    "model": "Taper Rotang 135x80",
    "category": "tables",
    "price": 715000,
    "dimensions": "135 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл",
      "искусственный ротанг"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-dining-room.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Taper Rotang 135x80»",
        "category_label": "Столы",
        "description": "Обеденный стол Taper Rotang размером 135×80 см. Каркас из металла с отделкой искусственным ротангом и столешница из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для обедов всей семьёй на крытой террасе или в столовой"
      },
      "uz": {
        "name": "«Taper Rotang 135x80» stoli",
        "category_label": "Stollar",
        "description": "135×80 sm o‘lchamdagi Taper Rotang ovqat stoli. Sun’iy rotangli metall karkas va LDSP ustki qism. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Yopiq terrasa yoki oshxonada oilaviy ovqatlanish uchun"
      },
      "en": {
        "name": "Taper Rotang 135x80 Table",
        "category_label": "Tables",
        "description": "Rectangular dining table Taper Rotang 135×80 cm. Metal frame accented with synthetic rattan weave and chipboard tabletop. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For family dining on covered terraces or dining rooms"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-taper-80",
    "legacyId": "p12",
    "model": "Taper 80x80",
    "category": "tables",
    "price": 734000,
    "dimensions": "80 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-dining-room.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Taper 80x80»",
        "category_label": "Столы",
        "description": "Лаконичный стол Taper 80×80 см с металлической опорой и прочной столешницей из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для кухонь, балконов, крытых веранд и кафе"
      },
      "uz": {
        "name": "«Taper 80x80» stoli",
        "category_label": "Stollar",
        "description": "Metall tayanch va pishiq LDSP ustki qismga ega ixcham Taper 80×80 sm stoli. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Oshxona, balkon, yopiq ayvonlar va kafelar uchun"
      },
      "en": {
        "name": "Taper 80x80 Table",
        "category_label": "Tables",
        "description": "Square dining table Taper 80×80 cm with sturdy metal support legs and chipboard top. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For kitchens, balconies, covered verandas and cafes"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-vertex-80",
    "legacyId": "p13",
    "model": "Vertex 80x80",
    "category": "tables",
    "price": 738000,
    "dimensions": "80 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-vertex-black.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Vertex 80x80»",
        "category_label": "Столы",
        "description": "Квадратный стол Vertex 80×80 см со строгим геометрическим металлическим каркасом и столешницей из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для обеденных зон, крытых веранд, баров и ресторанов"
      },
      "uz": {
        "name": "«Vertex 80x80» stoli",
        "category_label": "Stollar",
        "description": "Aniq geometrik metall karkas va LDSP ustki qismli kvadrat Vertex 80×80 sm stoli. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Ovqatlanish xonalari, yopiq ayvonlar, bar va restoranlar uchun"
      },
      "en": {
        "name": "Vertex 80x80 Table",
        "category_label": "Tables",
        "description": "Square table Vertex 80×80 cm with geometric metal frame and chipboard tabletop. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For dining areas, covered verandas, bars and restaurants"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-taper-135",
    "legacyId": "p14",
    "model": "Taper 135x80",
    "category": "tables",
    "price": 885000,
    "dimensions": "135 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-dining-room.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Taper 135x80»",
        "category_label": "Столы",
        "description": "Просторный обеденный стол Taper 135×80 см. Каркас из металла и практичная столешница из ЛДСП для комфортного размещения 4-6 персон. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для просторной кухни, крытой веранды, банкетной зоны"
      },
      "uz": {
        "name": "«Taper 135x80» stoli",
        "category_label": "Stollar",
        "description": "Keng Taper 135×80 sm ovqat stoli. 4-6 kishi uchun qulay o‘tirishni ta’minlovchi metall karkas va amaliy LDSP ustki qism. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Keng oshxona, yopiq ayvon, banket hududi uchun"
      },
      "en": {
        "name": "Taper 135x80 Table",
        "category_label": "Tables",
        "description": "Spacious dining table Taper 135×80 cm. Metal frame and practical chipboard tabletop comfortably seating 4 to 6 people. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For spacious dining rooms, covered verandas, hosting areas"
      }
    },
    "status": "unknown"
  },
  {
    "slug": "stol-corda-135",
    "legacyId": "p15",
    "model": "Corda 135x80",
    "category": "tables",
    "price": 949000,
    "dimensions": "135 × 80 × 75 см",
    "materials": [
      "ЛДСП",
      "металл"
    ],
    "maxLoad": null,
    "confirmedColors": [],
    "isTable": true,
    "images": [
      "assets/prod-table-dining-room.jpg",
      "assets/prod-table-marble-detail.jpg"
    ],
    "i18n": {
      "ru": {
        "name": "Стол «Corda 135x80»",
        "category_label": "Столы",
        "description": "Обеденный стол Corda 135×80 см. Надежная металлическая база и износостойкая столешница из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        "usage": "Для гостиной, столовой, закрытой террасы, HoReCa"
      },
      "uz": {
        "name": "«Corda 135x80» stoli",
        "category_label": "Stollar",
        "description": "Corda 135×80 sm ovqat stoli. Ishonchli metall baza va pishiq LDSP ustki qismi. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        "usage": "Mehmonxona, oshxona, yopiq terrasa, HoReCa uchun"
      },
      "en": {
        "name": "Corda 135x80 Table",
        "category_label": "Tables",
        "description": "Dining table Corda 135×80 cm. Solid metal base paired with a resilient chipboard top. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        "usage": "For living rooms, dining spaces, enclosed terraces, HoReCa"
      }
    },
    "status": "unknown"
  }
];

  window.BTT_PRODUCT_MASTER = MASTER;

  // Build dictionary for fast lookup by canonical slug and legacyId (p1..p15)
  var PRODUCTS = {};
  MASTER.forEach(function(item){
    var obj = {
      id: item.slug,
      slug: item.slug,
      legacyId: item.legacyId,
      model: item.model,
      cat: item.category,
      category: item.category,
      now: item.price,
      price: item.price,
      old: 0,
      status: item.status || "unknown",
      stock: item.status === "in_stock" ? 1 : (item.status === "out_of_stock" ? 0 : null),
      dimensions: item.dimensions,
      materials: item.materials,
      maxLoad: item.maxLoad || null,
      confirmedColors: item.confirmedColors || [],
      isTable: !!item.isTable,
      images: item.images || []
    };
    PRODUCTS[item.slug] = obj;
    if(item.legacyId) PRODUCTS[item.legacyId] = obj;
  });

  window.BTT_PRODUCTS = PRODUCTS;
  window.BTT_CANONICAL_SLUGS = MASTER.map(function(m){ return m.slug; });

  // Canonical product identifier resolver
  window.BTT_RESOLVE_PRODUCT = function(idOrSlug){
    if(!idOrSlug) return null;
    var s = String(idOrSlug).trim().toLowerCase();
    var p = PRODUCTS[s];
    if(p) return p.slug;
    return null;
  };

  window.BTT_CAT_IMG = {
    all:                 "assets/hero-garden-furniture.png",
    "wicker-chairs":     "assets/prod-chair-corda.jpg",
    "plastic-chairs":    "assets/hero-garden-furniture.png",
    "upholstered-chairs":"assets/hero-home-furniture.png",
    tables:              "assets/prod-table-dining-room.jpg",
    // legacy category aliases
    furniture:           "assets/prod-chair-corda.jpg",
    indoor:              "assets/hero-home-furniture.png",
    planter:             "assets/hero-garden-furniture.png",
    basket:              "assets/hero-home-furniture.png"
  };

  window.BTT_IS_MTO = function(id) {
    var p = window.BTT_PRODUCTS[id];
    return !!(p && p.stock === 0);
  };

  window.BTT_PRODUCT_IMG = function(id) {
    var p = window.BTT_PRODUCTS[id];
    if(!p) return null;
    var imgs = p.images && p.images.length ? p.images : ["assets/prod-chair-corda.jpg"];
    return imgs.map(function(s){ return { thumb: s, full: s }; });
  };

  window.BTT_PRODUCT_CAT = {
    "wicker-chairs": {
      ru: {
        name: "Плетёные стулья",
        desc: "Стулья на металлическом каркасе с плетением из искусственного ротанга и мягкими подушками.",
        dim: "Для дома, террас и кафе",
        mat: "Металл, искусственный ротанг, текстиль"
      },
      uz: {
        name: "To‘qilgan stullar",
        desc: "Metall karkasli, sun’iy rotang to‘quvli va yumshoq yostiqli qulay stullar.",
        dim: "Uy, terrasa va kafelar uchun",
        mat: "Metall, sun’iy rotang, to‘qimachilik"
      },
      en: {
        name: "Wicker chairs",
        desc: "Comfortable chairs on a metal frame with synthetic rattan weave and soft cushions.",
        dim: "For homes, terraces and cafes",
        mat: "Metal, synthetic rattan, textile"
      }
    },
    "plastic-chairs": {
      ru: {
        name: "Пластиковые стулья",
        desc: "Практичные, лёгкие и долговечные пластиковые стулья для дома, веранды и кафе.",
        dim: "Для дома, террасы, фудкортов и кафе",
        mat: "Прочный износостойкий пластик"
      },
      uz: {
        name: "Plastik stullar",
        desc: "Uy, ayvon va kafelar uchun qulay, yengil va mustahkam plastik stullar.",
        dim: "Uy, terrasa, fudkort va kafelar uchun",
        mat: "Pishiq, sifatli plastik"
      },
      en: {
        name: "Plastic chairs",
        desc: "Practical, lightweight and durable plastic chairs for home, patios and cafes.",
        dim: "For home, terrace, food courts and cafes",
        mat: "Durable high-grade plastic"
      }
    },
    "upholstered-chairs": {
      ru: {
        name: "Мягкие стулья",
        desc: "Стулья и кресла на металлическом каркасе с текстильной обивкой для комфортной обеденной зоны.",
        dim: "Для гостиной, кухни и банкетных залов",
        mat: "Металл, мягкий текстиль"
      },
      uz: {
        name: "Yumshoq stullar",
        desc: "Qulay ovqatlanish hududi uchun metall karkasdagi yumshoq matoli stul va kreslolar.",
        dim: "Mehmonxona, oshxona va banket zallari uchun",
        mat: "Metall, yumshoq to‘qimachilik"
      },
      en: {
        name: "Upholstered chairs",
        desc: "Chairs and armchairs on a sturdy metal frame with soft textile upholstery for dining comfort.",
        dim: "For living rooms, kitchens and banquet venues",
        mat: "Metal, soft textile"
      }
    },
    tables: {
      ru: {
        name: "Столы",
        desc: "Обеденные столы на прочном металлическом каркасе со столешницей из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        dim: "Для кухни, столовой, закрытых веранд и HoReCa",
        mat: "ЛДСП, металл"
      },
      uz: {
        name: "Stollar",
        desc: "Mustahkam metall karkas va LDSP ustki qismga ega ovqat stollari. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        dim: "Oshxona, yopiq ayvonlar va HoReCa uchun",
        mat: "LDSP, metall"
      },
      en: {
        name: "Tables",
        desc: "Dining tables on a solid metal frame with chipboard tabletop. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        dim: "For kitchens, dining areas, covered terraces and HoReCa",
        mat: "Chipboard, metal"
      }
    }
  };

  // Helper to format prices on static elements
  function formatStaticPrices(){
    var fmt = window.BTT_UTIL && window.BTT_UTIL.formatMoney;
    var P = window.BTT_PRODUCTS;
    if(!fmt || !P) return;

    document.querySelectorAll("[data-product]").forEach(function(card){
      var see = card.querySelector("a[href*='catalog/'], a[href*='product.html?id=']");
      if(!see) return;
      var href = see.getAttribute("href") || "";
      var slugMatch = href.match(/\/catalog\/([a-z0-9-]+)/i) || href.match(/id=([a-z0-9-]+)/i);
      if(!slugMatch) return;
      var prod = P[slugMatch[1]];
      if(!prod) return;
      var now = card.querySelector(".price__now");
      var old = card.querySelector(".price__old");
      if(now) now.textContent = fmt(prod.now);
      if(old) old.style.display = "none";
    });
  }

  if(typeof document !== "undefined"){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", formatStaticPrices);
    else formatStaticPrices();
  }
})();
