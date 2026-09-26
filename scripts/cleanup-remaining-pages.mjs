import fs from "fs";
import path from "path";

const files = [
  "404.html",
  "account.html",
  "article.html",
  "blog.html",
  "care.html",
  "cookies.html",
  "login.html",
  "privacy.html",
  "rotang-tashkent.html",
  "sadovaya-mebel-rotang.html"
];

for (const file of files) {
  const filePath = path.resolve(".", file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf-8");

  // Common replacements
  content = content.replace(/alt="Bententrade"/g, 'alt="BTT"');
  content = content.replace(
    /<p data-i18n="foot\.tag" style="color:var\(--on-dark-muted\);max-width:30ch">Мебель, кашпо и корзины из искусственного ротанга\.<\/p>/g,
    '<p data-i18n="foot.tag" style="color:var(--on-dark-muted);max-width:30ch">Столы, стулья и мебель для дома, сада и бизнеса.</p>'
  );
  content = content.replace(
    /<p data-i18n="co\.i\.addr\.v">Ташкент, ул\. Амира Темура, 15<\/p>/g,
    '<p data-i18n="co.i.addr.v">Ташкент, Узбекистан (склад / офис)</p>'
  );
  content = content.replace(
    /<span data-i18n="foot\.since">С 2024 ГОДА<\/span><span data-i18n="foot\.copy">© 2026 BENTENTRADE\. ВСЕ ПРАВА ЗАЩИЩЕНЫ\.<\/span>/g,
    '<span>BTT - мебель для дома и сада</span><span data-i18n="foot.copy">© 2026 BTT. Все права защищены.</span>'
  );
  content = content.replace(
    /<meta property="og:site_name" content="Bententrade">/g,
    '<meta property="og:site_name" content="BTT">'
  );
  content = content.replace(
    /(<title[^>]*>)Bententrade - /g,
    '$1BTT - '
  );

  if (file === "rotang-tashkent.html") {
    content = content.replace(
      "Приезжайте в наш шоурум на ул. Амира Темура, 15 или напишите менеджеру в Telegram - пришлём электронную карту цветов и прайс-лист.",
      "Напишите менеджеру в Telegram - пришлём электронный каталог и актуальный прайс-лист."
    );
  }

  if (file === "sadovaya-mebel-rotang.html") {
    content = content.replace(
      "Смотрите готовые модели в каталоге или свяжитесь с дизайнером Bententrade для изготовления под заказ с выездом замерщика в Ташкенте.",
      "Смотрите актуальные модели в каталоге или свяжитесь с нами в Telegram для консультации и подбора мебели в Ташкенте."
    );
    content = content.replace(
      'href="catalog.html?cat=furniture"',
      'href="catalog.html?cat=wicker-chairs"'
    );
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Cleaned up ${file}`);
}
