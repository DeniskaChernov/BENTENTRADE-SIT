import { spawn } from 'node:child_process';
import http from 'node:http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSwatches() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=C:\\BTT-Sit\\.tmp-chrome-profile-swatch'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json/list', res => {
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

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(msg.error);
      else p.resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://btt.denisblackman2.workers.dev/catalog.html' });

  await new Promise(r => setTimeout(r, 2500));

  // Click black swatch and wait 1000ms
  const result = await send('Runtime.evaluate', {
    expression: `
      (async function(){
        const card = document.querySelector('[data-slug="stul-roero"]');
        const img = card.querySelector('.product__media img');
        const sw = card.querySelector('[data-color="black"]');

        const before = img.src;
        sw.click();

        await new Promise(r => setTimeout(r, 1000));

        return {
          before,
          after: img.src,
          attrAfter: img.getAttribute('src'),
          opacityAfter: img.style.opacity
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log(result.result.value);

  ws.close();
  chrome.kill();
}

testSwatches().catch(console.error);
