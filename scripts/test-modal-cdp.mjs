import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('Starting headless Chrome for UI validation...');
  const tmpDir = path.join(os.tmpdir(), 'btt-chrome-profile-' + Date.now());
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + tmpDir
  ]);

  await new Promise(r => setTimeout(r, 1500));

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

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
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

  // TEST 1: CATALOG PAGE
  console.log('\n--- 1. Testing Catalog Page 1-click buy button & modal ---');
  await send('Page.navigate', { url: 'https://bententrade.denisblackman2.workers.dev/catalog.html' });
  await new Promise(r => setTimeout(r, 2500));

  const catalogCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = document.querySelectorAll('.product[data-product]');
      const buyBtns = document.querySelectorAll('.product__buy');
      const addBtns = document.querySelectorAll('.product__media .add');
      
      // Click first buy button
      const firstBtn = buyBtns[0];
      if(firstBtn) firstBtn.click();
      
      const modal = document.querySelector('.qk-modal');
      const thumb = modal ? modal.querySelector('.qk-thumb') : null;
      const modalText = modal ? modal.innerText : '';
      
      return {
        cardCount: cards.length,
        buyBtnCount: buyBtns.length,
        oldAddBtnCount: addBtns.length,
        modalOpen: modal ? modal.classList.contains('is-open') : false,
        thumbSrc: thumb ? thumb.src : null,
        thumbComplete: thumb ? thumb.complete : false,
        thumbNaturalWidth: thumb ? thumb.naturalWidth : 0,
        hasRawKeyAddress: modalText.includes('QUICK.ADDRESS'),
        hasRawKeyTrust: modalText.includes('quick.trust'),
        hasRawKeyTelegram: modalText.includes('pdp.cta.telegram')
      };
    })()`,
    returnByValue: true
  });

  console.log('Catalog check result:', JSON.stringify(catalogCheck.result.value, null, 2));

  // TEST 2: PDP LIFESTYLE COMBO 1-CLICK ORDER
  console.log('\n--- 2. Testing PDP Combo 1-click buy & modal ---');
  await send('Page.navigate', { url: 'https://bententrade.denisblackman2.workers.dev/catalog/stol-taper-rotang-80' });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const comboBtn = document.querySelector('[data-combo-quick-buy]');
      if(comboBtn) comboBtn.click();
    })()`
  });

  // Wait 1.5 seconds for image to load in modal
  await new Promise(r => setTimeout(r, 1500));

  const pdpCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.qk-modal');
      const thumb = modal ? modal.querySelector('.qk-thumb') : null;
      const modalText = modal ? modal.innerText : '';
      const nameEl = modal ? modal.querySelector('.qk-name') : null;
      
      return {
        modalOpen: modal ? modal.classList.contains('is-open') : false,
        name: nameEl ? nameEl.textContent : null,
        thumbSrc: thumb ? thumb.src : null,
        thumbComplete: thumb ? thumb.complete : false,
        thumbNaturalWidth: thumb ? thumb.naturalWidth : 0,
        hasRawKeyAddress: modalText.includes('QUICK.ADDRESS'),
        hasRawKeyTrust: modalText.includes('quick.trust'),
        hasRawKeyTelegram: modalText.includes('pdp.cta.telegram')
      };
    })()`,
    returnByValue: true
  });

  console.log('PDP check result:', JSON.stringify(pdpCheck.result.value, null, 2));

  ws.close();
  chrome.kill();

  const c = catalogCheck.result.value;
  if(c.cardCount !== 28 || c.buyBtnCount !== 28 || c.oldAddBtnCount !== 0 || (!c.thumbComplete && c.thumbNaturalWidth <= 0) || c.thumbNaturalWidth <= 0 || c.hasRawKeyAddress || c.hasRawKeyTrust || c.hasRawKeyTelegram){
    console.error('FAIL: Catalog 1-click modal assertions failed!');
    process.exit(1);
  }

  const p = pdpCheck.result.value;
  if((!p.thumbComplete && p.thumbNaturalWidth <= 0) || p.thumbNaturalWidth <= 0 || p.hasRawKeyAddress || p.hasRawKeyTrust || p.hasRawKeyTelegram){
    console.error('FAIL: PDP Combo 1-click modal assertions failed!');
    process.exit(1);
  }

  console.log('\nPASS: All modal thumbnail and translation checks passed!');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
