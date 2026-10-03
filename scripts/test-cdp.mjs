import { spawn } from 'node:child_process';
import http from 'node:http';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPage(targetUrl) {
  console.log(`\n=== Testing ${targetUrl} ===`);
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=C:\\BTT-Sit\\.tmp-chrome-profile'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  const errors = [];
  const logs = [];

  await new Promise((resolve) => {
    let msgId = 1;
    function send(method, params = {}) {
      ws.send(JSON.stringify({ id: msgId++, method, params }));
    }

    ws.onopen = () => {
      send('Runtime.enable');
      send('Log.enable');
      send('Page.enable');
      send('Page.navigate', { url: targetUrl });
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(msg.params.exceptionDetails);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description).join(' ');
        if (msg.params.type === 'error') errors.push(text);
        else logs.push(`[${msg.params.type}] ${text}`);
      }
      if (msg.method === 'Page.loadEventFired') {
        setTimeout(resolve, 1500);
      }
    };
  });

  ws.close();
  chrome.kill();

  console.log('Logs count:', logs.length);
  logs.slice(0, 10).forEach(l => console.log('LOG:', l));
  console.log('Errors count:', errors.length);
  errors.forEach(e => console.error('ERROR:', e));
}

testPage('https://btt.denisblackman2.workers.dev/catalog/stul-todo-soft')
  .then(() => testPage('https://btt.denisblackman2.workers.dev/catalog/stul-todo'))
  .then(() => testPage('https://btt.denisblackman2.workers.dev/catalog/stul-roero'))
  .catch(console.error);
