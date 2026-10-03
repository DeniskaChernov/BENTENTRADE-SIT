import { spawn } from 'node:child_process';
import http from 'node:http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testUrl(targetUrl) {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=C:\\Bententrade-Sit\\.tmp-chrome-profile-pdp'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json/list', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(msg.error);
      else p.resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: targetUrl });

  await new Promise(r => setTimeout(r, 2500));

  const evalResult = await send('Runtime.evaluate', {
    expression: `
      ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        currentColor: document.querySelector('[data-finish-val]')?.textContent,
        stageImg: document.querySelector('[data-stage] img.is-on')?.src,
        thumbsCount: document.querySelectorAll('.pdp-thumb').length,
        swatchesCount: document.querySelectorAll('.pdp-swatches .swatch').length,
        activeSwatch: document.querySelector('.pdp-swatches .swatch.is-active')?.getAttribute('aria-label'),
        mainDisplay: window.getComputedStyle(document.querySelector('main')).display,
        mainOpacity: window.getComputedStyle(document.querySelector('main')).opacity,
        bodyClass: document.body.className
      })
    `,
    returnByValue: true
  });

  console.log('Result for:', targetUrl);
  console.log(evalResult.result.value);
  console.log('Errors:', errors);

  ws.close();
  chrome.kill();
}

async function run() {
  await testUrl('https://bententrade.denisblackman2.workers.dev/catalog/stul-roero?color=black');
  await testUrl('https://bententrade.denisblackman2.workers.dev/catalog/stul-todo?color=yellow');
  await testUrl('https://bententrade.denisblackman2.workers.dev/catalog/stul-todo-soft?color=red');
}

run().catch(console.error);
