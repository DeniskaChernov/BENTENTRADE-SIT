# BTT — Product Content & Media Guidelines

> **Публичное название бренда:** BTT - мебель для дома и сада  
> **Версия:** 2.0  
> **Дата:** 2026-09-26  

---

## 1. Структура директорий для фотографий товаров

Все фотографии товаров организованы строго по каноническим слагам товаров:

```
assets/products/
├── kreslo-como/
│   └── .gitkeep
├── stol-corda-135/
│   └── .gitkeep
├── stol-taper-80/
│   └── .gitkeep
├── stol-taper-135/
│   └── .gitkeep
├── stol-taper-rotang-80/
│   └── .gitkeep
├── stol-taper-rotang-135/
│   └── .gitkeep
├── stol-vertex-80/
│   └── .gitkeep
├── stol-vertex-d90/
│   └── .gitkeep
├── stul-corda/
│   └── .gitkeep
├── stul-jardin/
│   └── .gitkeep
├── stul-lira/
│   └── .gitkeep
├── stul-noero/
│   └── .gitkeep
├── stul-roero/
│   └── .gitkeep
├── stul-todo/
│   └── .gitkeep
└── stul-vertex/
    └── .gitkeep
```

---

## 2. Требования к медиафайлам

1. **Форматы**: WebP (предпочтительно), JPG, PNG.
2. **Пропорции и разрешение**:
   - Главное фото карточки: `4:3` или `1:1`.
   - Минимальное разрешение: `1200 × 900 px` (или `1000 × 1000 px`).
   - Вес одного файла: не более `350 КБ` (для быстрой загрузки по мобильной сети).
3. **Фон и стилистика**:
   - Чистый нейтральный фон (светло-серый, молочный, естественный интерьер или терраса).
   - Без водяных знаков, ценников и сторонних логотипов.
   - Естественная цветопередача без чрезмерной насыщенности.

---

## 3. Регламент добавления новых фотографий товара

1. Поместите обработанные фото в папку соответствующего товара:
   ```
   assets/products/<slug>/photo-1.webp
   assets/products/<slug>/photo-2.webp
   ```
2. Откройте `data/products-master.json`, найдите нужный `slug` и добавьте пути в массив `images`:
   ```json
   "images": [
     "assets/products/<slug>/photo-1.webp",
     "assets/products/<slug>/photo-2.webp"
   ]
   ```
3. Запустите автоматическую синхронизацию:
   ```bash
   npm run sync:master
   ```
4. Выполните валидацию целостности:
   ```bash
   npm run validate
   ```
5. Проверьте запуск дымовых тестов:
   ```bash
   npm run test:smoke
   ```
