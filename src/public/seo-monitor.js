/**
 * SEO Monitor - Real-time SEO Health Check
 * Для bententrade.uz
 * 
 * Использование:
 * 1. Откройте консоль браузера (F12)
 * 2. Вставьте в консоль: checkSEO()
 */

window.checkSEO = function() {
  console.clear();
  console.log('%c🔍 SEO Health Check для bententrade.uz', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
  console.log('%c' + '='.repeat(60), 'color: #ddd;');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  function pass(message) {
    console.log('%c✅ ' + message, 'color: #4CAF50;');
    results.passed++;
  }
  
  function fail(message) {
    console.log('%c❌ ' + message, 'color: #f44336;');
    results.failed++;
  }
  
  function warn(message) {
    console.log('%c⚠️  ' + message, 'color: #ff9800;');
    results.warnings++;
  }
  
  function info(message) {
    console.log('%c   ' + message, 'color: #2196F3;');
  }
  
  // 1. Check Title
  console.log('\n%c1. Title Tag', 'font-weight: bold; font-size: 14px;');
  const title = document.title;
  if (title) {
    pass(`Title найден: "${title}"`);
    info(`   Длина: ${title.length} символов`);
    if (title.length < 30 || title.length > 60) {
      warn('Длина title должна быть 30-60 символов для лучшей видимости');
    }
  } else {
    fail('Title отсутствует!');
  }
  
  // 2. Check Meta Description
  console.log('\n%c2. Meta Description', 'font-weight: bold; font-size: 14px;');
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    const content = description.content;
    pass(`Description найден: "${content.substring(0, 50)}..."`);
    info(`   Длина: ${content.length} символов`);
    if (content.length < 120 || content.length > 160) {
      warn('Длина description должна быть 120-160 символов');
    }
  } else {
    fail('Meta description отсутствует!');
  }
  
  // 3. Check Robots Meta
  console.log('\n%c3. Robots Meta Tags', 'font-weight: bold; font-size: 14px;');
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) {
    const content = robotsMeta.content;
    if (content.includes('index') && content.includes('follow')) {
      pass(`Robots: "${content}"`);
    } else if (content.includes('noindex') || content.includes('nofollow')) {
      fail(`⚠️ КРИТИЧНО! Найден noindex/nofollow: "${content}"`);
    } else {
      warn(`Неполные директивы robots: "${content}"`);
    }
  } else {
    warn('Meta robots отсутствует (будет использован по умолчанию)');
  }
  
  // Check Googlebot
  const googlebot = document.querySelector('meta[name="googlebot"]');
  if (googlebot) {
    pass(`Googlebot: "${googlebot.content}"`);
  } else {
    info('Googlebot meta не найден (необязательно)');
  }
  
  // 4. Check Canonical
  console.log('\n%c4. Canonical URL', 'font-weight: bold; font-size: 14px;');
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    pass(`Canonical: ${canonical.href}`);
    if (canonical.href !== window.location.href) {
      warn(`Canonical отличается от текущего URL`);
      info(`   Текущий: ${window.location.href}`);
      info(`   Canonical: ${canonical.href}`);
    }
  } else {
    fail('Canonical URL отсутствует!');
  }
  
  // 5. Check Hreflang
  console.log('\n%c5. Hreflang Tags', 'font-weight: bold; font-size: 14px;');
  const hreflangs = document.querySelectorAll('link[hreflang]');
  if (hreflangs.length > 0) {
    pass(`Найдено ${hreflangs.length} hreflang тегов`);
    hreflangs.forEach(tag => {
      info(`   ${tag.hreflang}: ${tag.href}`);
    });
  } else {
    warn('Hreflang теги не найдены (для многоязычных сайтов)');
  }
  
  // 6. Check Open Graph
  console.log('\n%c6. Open Graph Tags', 'font-weight: bold; font-size: 14px;');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  
  if (ogTitle && ogDescription && ogImage && ogUrl) {
    pass('Все основные OG теги присутствуют');
    info(`   Title: "${ogTitle.content}"`);
    info(`   Image: ${ogImage.content}`);
  } else {
    fail('Не хватает основных Open Graph тегов');
    if (!ogTitle) info('   ❌ og:title');
    if (!ogDescription) info('   ❌ og:description');
    if (!ogImage) info('   ❌ og:image');
    if (!ogUrl) info('   ❌ og:url');
  }
  
  // 7. Check Structured Data
  console.log('\n%c7. Structured Data (JSON-LD)', 'font-weight: bold; font-size: 14px;');
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (jsonLdScripts.length > 0) {
    pass(`Найдено ${jsonLdScripts.length} JSON-LD блоков`);
    jsonLdScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent);
        info(`   [${index + 1}] @type: ${data['@type']}`);
      } catch (e) {
        warn(`   [${index + 1}] Ошибка парсинга JSON-LD`);
      }
    });
  } else {
    warn('Structured Data не найдена');
  }
  
  // 8. Check H1
  console.log('\n%c8. Heading Structure', 'font-weight: bold; font-size: 14px;');
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 1) {
    pass(`Один H1 найден: "${h1s[0].textContent.trim().substring(0, 50)}..."`);
  } else if (h1s.length === 0) {
    fail('H1 отсутствует!');
  } else {
    warn(`Найдено ${h1s.length} H1 тегов (рекомендуется один)`);
  }
  
  const h2s = document.querySelectorAll('h2');
  info(`   H2: ${h2s.length} тегов`);
  
  // 9. Check Images
  console.log('\n%c9. Images Optimization', 'font-weight: bold; font-size: 14px;');
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt) imagesWithoutAlt++;
  });
  
  if (images.length > 0) {
    info(`   Всего изображений: ${images.length}`);
    if (imagesWithoutAlt === 0) {
      pass('Все изображения имеют alt атрибуты');
    } else {
      warn(`${imagesWithoutAlt} из ${images.length} изображений без alt`);
    }
  } else {
    info('Изображений не найдено');
  }
  
  // 10. Check Links
  console.log('\n%c10. Internal Links', 'font-weight: bold; font-size: 14px;');
  const links = document.querySelectorAll('a[href]');
  const internalLinks = Array.from(links).filter(link => {
    const href = link.href;
    return href.startsWith(window.location.origin) || href.startsWith('/');
  });
  const externalLinks = links.length - internalLinks.length;
  
  pass(`Внутренних ссылок: ${internalLinks.length}`);
  info(`   Внешних ссылок: ${externalLinks}`);
  
  // 11. Check Page Speed Resources
  console.log('\n%c11. Performance Hints', 'font-weight: bold; font-size: 14px;');
  const preconnects = document.querySelectorAll('link[rel="preconnect"]');
  const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
  
  if (preconnects.length > 0 || dnsPrefetch.length > 0) {
    pass(`Оптимизация загрузки: preconnect (${preconnects.length}), dns-prefetch (${dnsPrefetch.length})`);
  } else {
    info('Нет preconnect/dns-prefetch (можно добавить для улучшения)');
  }
  
  // 12. Check Mobile Viewport
  console.log('\n%c12. Mobile Optimization', 'font-weight: bold; font-size: 14px;');
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    pass(`Viewport: ${viewport.content}`);
  } else {
    fail('Meta viewport отсутствует!');
  }
  
  // 13. Check Google Analytics
  console.log('\n%c13. Analytics & Tracking', 'font-weight: bold; font-size: 14px;');
  if (window.gtag) {
    pass('Google Analytics установлен');
  } else {
    warn('Google Analytics не обнаружен');
  }
  
  // Summary
  console.log('\n%c' + '='.repeat(60), 'color: #ddd;');
  console.log('%c📊 Итого:', 'font-size: 16px; font-weight: bold;');
  console.log(`%c   ✅ Пройдено: ${results.passed}`, 'color: #4CAF50; font-weight: bold;');
  console.log(`%c   ⚠️  Предупреждений: ${results.warnings}`, 'color: #ff9800; font-weight: bold;');
  console.log(`%c   ❌ Ошибок: ${results.failed}`, 'color: #f44336; font-weight: bold;');
  
  const score = Math.round((results.passed / (results.passed + results.failed + results.warnings)) * 100);
  console.log(`\n%c🎯 SEO Score: ${score}%`, `font-size: 18px; font-weight: bold; color: ${score > 80 ? '#4CAF50' : score > 60 ? '#ff9800' : '#f44336'};`);
  
  if (score > 80) {
    console.log('%c🎉 Отличная работа! Сайт хорошо оптимизирован для поисковых систем.', 'color: #4CAF50;');
  } else if (score > 60) {
    console.log('%c⚡ Хорошо, но есть что улучшить. Обратите внимание на предупреждения.', 'color: #ff9800;');
  } else {
    console.log('%c🔧 Требуется доработка. Исправьте критичные ошибки.', 'color: #f44336;');
  }
  
  console.log('\n%c💡 Полезные ссылки:', 'font-weight: bold;');
  console.log('   📝 Проверить Rich Results: https://search.google.com/test/rich-results?url=' + encodeURIComponent(window.location.href));
  console.log('   🚀 PageSpeed Insights: https://pagespeed.web.dev/analysis?url=' + encodeURIComponent(window.location.href));
  console.log('   🔍 Google Search Console: https://search.google.com/search-console');
  console.log('%c' + '='.repeat(60), 'color: #ddd;');
  
  return {
    score,
    passed: results.passed,
    warnings: results.warnings,
    failed: results.failed
  };
};

console.log('%c💡 SEO Monitor загружен!', 'color: #4CAF50; font-weight: bold;');
console.log('%c   Введите checkSEO() в консоли для проверки', 'color: #666;');
