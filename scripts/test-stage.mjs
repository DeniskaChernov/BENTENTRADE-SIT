import { spawn } from 'node:child_process';
import http from 'node:http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testStage() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=C:\\BTT-Sit\\.tmp-chrome-profile-stage'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9226/json/list', res => {
      let data = ''; res.on('data', c => data += c); res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) { ws.removeEventListener('message', handler); res(msg.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://btt.denisblackman2.workers.dev/catalog/stul-roero?color=black' });
  await new Promise(r => setTimeout(r, 2500));

  const res = await send('Runtime.evaluate', {
    expression: `
      ({
        url: window.location.href,
        search: window.location.search,
        stage: document.querySelector('[data-stage]')?.innerHTML,
        scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
      })
    `,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result.value, null, 2));

  ws.close();
  chrome.kill();
}

testStage().catch(console.error);
