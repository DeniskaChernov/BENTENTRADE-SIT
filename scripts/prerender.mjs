import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');

const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://bententrade.uz').replace(/\/$/, '');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const wrap = (inner) => `<div id="root">
      <div data-prerender="1" class="prerender-fallback" style="max-width:42rem;margin:0 auto;padding:1.25rem 1rem 2rem;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;color:#1a1a1a;background:#faf9f7;min-height:100vh">
        ${inner}
      </div>
    </div>`;

const pages = [
  {
    outFile: 'index.html',
    urlPath: '/',
    title: 'Bententrade - плетёные кашпо, ротанг и нить, производство в Ташкенте',
    description:
      'Производство плетёных кашпо, ротанговой нити и сопутствующих изделий. Каталог, доставка по Узбекистану, опт и розница.',
    body: `
        <header style="margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:1px solid #e8e4df">
          <p style="margin:0;font-size:0.875rem;color:#6b5c4c"><strong>Bententrade</strong></p>
          <nav aria-label="Основная навигация" style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.9rem">
            <a href="/catalog" style="color:#8B5A36">Каталог</a>
            <a href="/legal" style="color:#8B5A36">Документы</a>
            <a href="/#contacts" style="color:#8B5A36">Контакты</a>
          </nav>
        </header>
        <main>
          <h1 style="font-size:1.5rem;margin:0 0 0.75rem;line-height:1.25">Плетёные кашпо и ротанг от производителя</h1>
          <p style="margin:0 0 1rem">Мы производим кашпо, ротанговую нить и сопутствующие товары в Ташкенте. Откройте каталог, чтобы выбрать размер, стиль и оформить заказ.</p>
          <p style="margin:0"><a href="/catalog" style="color:#8B5A36;font-weight:600">Перейти в каталог →</a></p>
        </main>
        <noscript>
          <p style="margin-top:1.5rem;font-size:0.875rem;color:#555">Для полного интерфейса включите JavaScript.</p>
        </noscript>`,
  },
  {
    outFile: 'catalog.html',
    urlPath: '/catalog',
    title: 'Каталог - Bententrade',
    description:
      'Каталог плетёных кашпо и ротанговой нити: размеры, стили, фото. Выберите товары и оформите заказ на сайте Bententrade.',
    body: `
        <header style="margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:1px solid #e8e4df">
          <p style="margin:0;font-size:0.875rem;color:#6b5c4c"><a href="/" style="color:#8B5A36;text-decoration:none"><strong>Bententrade</strong></a></p>
          <nav aria-label="Навигация" style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.9rem">
            <a href="/" style="color:#8B5A36">Главная</a>
            <span style="color:#999">Каталог</span>
            <a href="/legal" style="color:#8B5A36">Документы</a>
          </nav>
        </header>
        <main>
          <h1 style="font-size:1.5rem;margin:0 0 0.75rem">Каталог</h1>
          <p style="margin:0 0 1rem">Здесь собраны кашпо, ротанг и связанные позиции. После загрузки страницы вы сможете фильтровать по категориям и добавлять товары в корзину.</p>
          <p style="margin:0"><a href="/" style="color:#8B5A36">← На главную</a></p>
        </main>
        <noscript>
          <p style="margin-top:1.5rem;font-size:0.875rem;color:#555">Включите JavaScript, чтобы пользоваться фильтрами и корзиной.</p>
        </noscript>`,
  },
  {
    outFile: 'legal.html',
    urlPath: '/legal',
    title: 'Документы и юридическая информация - Bententrade',
    description:
      'Публичная оферта, политика конфиденциальности и прочие документы Bententrade.',
    body: `
        <header style="margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:1px solid #e8e4df">
          <p style="margin:0;font-size:0.875rem;color:#6b5c4c"><a href="/" style="color:#8B5A36;text-decoration:none"><strong>Bententrade</strong></a></p>
          <nav aria-label="Навигация" style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.9rem">
            <a href="/" style="color:#8B5A36">Главная</a>
            <a href="/catalog" style="color:#8B5A36">Каталог</a>
            <span style="color:#999">Документы</span>
          </nav>
        </header>
        <main>
          <h1 style="font-size:1.5rem;margin:0 0 0.75rem">Юридическая информация</h1>
          <p style="margin:0 0 1rem">Раздел с офертой, политикой обработки данных и условиями использования сайта.</p>
          <p style="margin:0;font-size:0.9rem;color:#555">С полным текстом документов вы познакомитесь после загрузки приложения.</p>
        </main>
        <noscript>
          <p style="margin-top:1.5rem;font-size:0.875rem;color:#555">Включите JavaScript для навигации по подразделам.</p>
        </noscript>`,
  },
];

function injectMetaAndRoot(html, { title, description, canonical, rootInner }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const c = escapeHtml(canonical);

  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${t}</title>`);

  const metaBlock = `    <meta name="description" content="${d}" />
    <link rel="canonical" href="${c}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${c}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />`;

  out = out.replace(/(<meta\s+name="viewport"[^>]*\/?>)/i, `$1\n${metaBlock}`);

  out = out.replace(/<html\s+lang="[^"]*"/i, '<html lang="ru"');
  out = out.replace(/<div id="root">\s*<\/div>/i, rootInner.trim());
  return out;
}

if (!fs.existsSync(indexPath)) {
  console.error('prerender: build/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexPath, 'utf8');

for (const page of pages) {
  const canonical = `${SITE_ORIGIN}${page.urlPath === '/' ? '/' : page.urlPath}`;
  const rootInner = wrap(page.body.trim());
  const html = injectMetaAndRoot(baseHtml, {
    title: page.title,
    description: page.description,
    canonical,
    rootInner,
  });
  const outPath = path.join(buildDir, page.outFile);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`prerender: wrote ${path.relative(buildDir, outPath)}`);
}
