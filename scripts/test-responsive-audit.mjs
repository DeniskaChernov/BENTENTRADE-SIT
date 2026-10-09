import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runAudit() {
  console.log('=== STARTING RESPONSIVE & BROWSER RUNTIME AUDIT ===');
  const tmpDir = path.join(os.tmpdir(), 'btt-responsive-profile-' + Date.now());
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + tmpDir
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9224/json/list', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });

  const viewports = [
    { name: 'Ultra-Compact (320px)', width: 320, height: 568 },
    { name: 'Standard Mobile (375px)', width: 375, height: 667 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1280px)', width: 1280, height: 800 }
  ];

  const urls = [
    'https://bententrade.denisblackman2.workers.dev/',
    'https://bententrade.denisblackman2.workers.dev/catalog.html',
    'https://bententrade.denisblackman2.workers.dev/horeca.html',
    'https://bententrade.denisblackman2.workers.dev/catalog/stul-vertex',
    'https://bententrade.denisblackman2.workers.dev/catalog/lampa-liva'
  ];

  let testIssues = [];

  for (const url of urls) {
    console.log(`\nTesting Page: ${url}`);
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width < 1000
      });

      consoleErrors.length = 0;
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 2200));

      // Evaluate page metrics
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const hasOverflow = docW > winW + 1; // 1px rounding tolerance
          
          // Check for overflowing elements
          const overflowing = [];
          if (hasOverflow) {
            document.querySelectorAll('*').forEach(el => {
              const r = el.getBoundingClientRect();
              if (r.right > winW + 2) {
                overflowing.push({
                  tag: el.tagName,
                  class: el.className,
                  id: el.id,
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                });
              }
            });
          }

          // Check for broken images (completed download but failed with naturalWidth === 0)
          const brokenImages = [];
          document.querySelectorAll('img').forEach(img => {
            if (img.src && img.complete && img.naturalWidth === 0) {
              brokenImages.push(img.src);
            }
          });

          return {
            docW,
            winW,
            hasOverflow,
            overflowCount: overflowing.length,
            overflowSample: overflowing.slice(0, 3),
            brokenImageCount: brokenImages.length,
            brokenImages: brokenImages.slice(0, 3)
          };
        })()`,
        returnByValue: true
      });

      const res = evalRes.result?.value;
      if (!res) {
        console.error(`  FAIL: Evaluation failed on ${vp.name}`);
        continue;
      }

      if (res.hasOverflow) {
        testIssues.push({
          page: url,
          viewport: vp.name,
          type: 'HORIZONTAL_OVERFLOW',
          detail: `docWidth: ${res.docW}px > windowWidth: ${res.winW}px. Overflow elements: ${JSON.stringify(res.overflowSample)}`
        });
        console.log(`  ❌ OVERFLOW on ${vp.name}: doc=${res.docW}px, win=${res.winW}px`);
      } else {
        console.log(`  ✅ ${vp.name}: No horizontal overflow (${res.docW}px / ${res.winW}px)`);
      }

      if (res.brokenImageCount > 0) {
        testIssues.push({
          page: url,
          viewport: vp.name,
          type: 'BROKEN_IMAGES',
          detail: `Broken images: ${JSON.stringify(res.brokenImages)}`
        });
        console.log(`  ❌ Broken images on ${vp.name}: ${res.brokenImages.join(', ')}`);
      }

      if (consoleErrors.length > 0) {
        testIssues.push({
          page: url,
          viewport: vp.name,
          type: 'CONSOLE_ERRORS',
          detail: consoleErrors.join(' | ')
        });
        console.log(`  ❌ Console errors on ${vp.name}: ${consoleErrors[0]}`);
      }
    }
  }

  try { ws.close(); } catch {}
  try { chrome.kill(); } catch {}

  console.log('\n=== RESPONSIVE AUDIT SUMMARY ===');
  console.log(`Total runtime issues found: ${testIssues.length}`);
  if (testIssues.length > 0) {
    for (const ti of testIssues) {
      console.log(`[${ti.type}] ${ti.page} (${ti.viewport}): ${ti.detail}`);
    }
  } else {
    console.log('100% of pages tested cleanly with 0 horizontal overflow and 0 console errors!');
  }
}

runAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
