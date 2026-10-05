import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('Starting headless Chrome for Assistant UI validation across devices...');
  const tmpDir = path.join(os.tmpdir(), 'btt-assistant-test-' + Date.now());
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false
  });

  // TEST 1: DESKTOP ASSISTANT
  console.log('\n--- 1. Testing Assistant on Desktop (1280x850) ---');
  await send('Page.navigate', { url: 'https://bententrade.denisblackman2.workers.dev/?nocache=' + Date.now() });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const fab = document.querySelector('.bot-fab');
      if (!fab) return { error: 'FAB not found' };
      fab.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 450));

  const desktopTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.bot-panel');
      const isOpen = panel && panel.classList.contains('open');
      const menuGrid = panel ? panel.querySelector('.bot-menu-grid') : null;
      const menuItems = menuGrid ? Array.from(menuGrid.querySelectorAll('.bot-menu-item')).map(b => b.innerText.trim()) : [];
      const quickChips = panel ? Array.from(panel.querySelectorAll('.bot-chip')).map(b => b.innerText.trim()) : [];
      
      const rect = panel ? panel.getBoundingClientRect() : null;
      return {
        isOpen,
        panelDimensions: rect ? { width: rect.width, height: rect.height, bottom: window.innerHeight - rect.bottom, right: window.innerWidth - rect.right } : null,
        menuItemsCount: menuItems.length,
        menuItems,
        quickChipsCount: quickChips.length,
        quickChips
      };
    })()`,
    returnByValue: true
  });

  console.log('Desktop assistant check:', JSON.stringify(desktopTest.result.value, null, 2));

  // Take desktop screenshot
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/assistant-desktop.png', Buffer.from(desktopShot.data, 'base64'));
  console.log('Saved scripts/assistant-desktop.png');

  // Test menu item interaction: Click "Цены на стулья"
  console.log('\n--- 2. Interacting with menu item "Цены на стулья" ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.bot-menu-item[data-bot-menu-action="Цены на стулья"]');
      if(btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1200));

  const interactionCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const msgs = document.querySelectorAll('.bot-msg');
      const lastMsg = msgs[msgs.length - 1];
      const menuTrigger = lastMsg ? lastMsg.querySelector('.bot-menu-trigger') : null;
      return {
        totalMsgs: msgs.length,
        lastMsgTextSnippet: lastMsg ? lastMsg.innerText.slice(0, 120) : '',
        hasMenuTrigger: !!menuTrigger,
        menuTriggerText: menuTrigger ? menuTrigger.innerText.trim() : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Interaction check:', JSON.stringify(interactionCheck.result.value, null, 2));

  // TEST 3: MOBILE VIEWPORT (375x667)
  console.log('\n--- 3. Testing Assistant on Mobile Viewport (375x667) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'https://bententrade.denisblackman2.workers.dev/?nocache=' + Date.now() });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const fab = document.querySelector('.bot-fab');
      if (fab) fab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 450));

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.bot-panel');
      const rect = panel ? panel.getBoundingClientRect() : null;
      const menuGrid = panel ? panel.querySelector('.bot-menu-grid') : null;
      const gridStyle = menuGrid ? window.getComputedStyle(menuGrid) : null;
      const msgs = document.querySelector('.bot-msgs');
      const head = panel ? panel.querySelector('.bot-head') : null;
      const input = panel ? panel.querySelector('.bot-input') : null;
      const headRect = head ? head.getBoundingClientRect() : null;
      const inputRect = input ? input.getBoundingClientRect() : null;
      const cs = panel ? window.getComputedStyle(panel) : null;
      
      return {
        scrollY: window.scrollY,
        windowH: window.innerHeight,
        panelTop: rect ? rect.top : 0,
        panelBottom: rect ? rect.bottom : 0,
        panelWidth: rect ? rect.width : 0,
        panelHeight: rect ? rect.height : 0,
        panelLeft: rect ? rect.left : 0,
        panelRight: rect ? window.innerWidth - rect.right : 0,
        computed: cs ? {
          position: cs.position,
          top: cs.top,
          bottom: cs.bottom,
          height: cs.height,
          transform: cs.transform
        } : null,
        headRect: headRect ? { top: headRect.top, height: headRect.height } : null,
        inputRect: inputRect ? { bottom: inputRect.bottom, height: inputRect.height } : null,
        gridColumns: gridStyle ? gridStyle.gridTemplateColumns : null,
        hasHorizontalOverflow: msgs ? (msgs.scrollWidth > msgs.clientWidth) : false
      };
    })()`,
    returnByValue: true
  });

  console.log('Mobile check (375px):', JSON.stringify(mobileCheck.result.value, null, 2));

  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/assistant-mobile-375.png', Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved scripts/assistant-mobile-375.png');

  // TEST 4: ULTRA COMPACT MOBILE (320x568)
  console.log('\n--- 4. Testing Assistant on Ultra-compact Viewport (320x568) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 568,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'https://bententrade.denisblackman2.workers.dev/?nocache=' + Date.now() });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const fab = document.querySelector('.bot-fab');
      if (fab) fab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 450));

  const smallMobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.bot-panel');
      const rect = panel ? panel.getBoundingClientRect() : null;
      const menuGrid = panel ? panel.querySelector('.bot-menu-grid') : null;
      const gridStyle = menuGrid ? window.getComputedStyle(menuGrid) : null;
      const msgs = document.querySelector('.bot-msgs');
      
      return {
        panelTop: rect ? rect.top : 0,
        panelBottom: rect ? rect.bottom : 0,
        panelWidth: rect ? rect.width : 0,
        panelHeight: rect ? rect.height : 0,
        panelLeft: rect ? rect.left : 0,
        panelRight: rect ? window.innerWidth - rect.right : 0,
        gridColumns: gridStyle ? gridStyle.gridTemplateColumns : null,
        hasHorizontalOverflow: msgs ? (msgs.scrollWidth > msgs.clientWidth) : false
      };
    })()`,
    returnByValue: true
  });

  console.log('Small mobile check (320px):', JSON.stringify(smallMobileCheck.result.value, null, 2));

  const smallMobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/assistant-mobile-320.png', Buffer.from(smallMobileShot.data, 'base64'));
  console.log('Saved scripts/assistant-mobile-320.png');

  chrome.kill();
  console.log('\nAssistant test finished successfully!');
}

runTest().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
