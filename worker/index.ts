export interface Env {
  ASSETS: Fetcher;
  SITE_ORIGIN?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  API_TOKEN?: string;
}

const DEFAULT_BOT_TOKEN = '8344041596:AAEAJtbcpn8wVE_NcVpXAAbwrkvjE5GHZrA';
const DEFAULT_CHAT_IDS = ['7019985933', '-1003068403630'];

function corsHeaders(origin: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Password, X-Admin-Token, X-Admin-User, X-Request-Id',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}

function formatOrderMessage(orderData: any): string {
  const items = Array.isArray(orderData?.items) ? orderData.items : [];
  const customer = orderData?.customerInfo || {};
  const lines: string[] = [
    '🛒 <b>Новый заказ Bententrade</b>',
    '',
    '<b>Товары:</b>',
  ];

  if (items.length === 0) {
    lines.push('• (Детали заказа не указаны)');
  } else {
    items.forEach((item: any, idx: number) => {
      const parts = [`${idx + 1}. ${item.name || 'Товар'}`, `x${item.quantity || 1}`];
      if (item.variant) parts.push(`цвет: ${item.variant}`);
      if (item.size) parts.push(`размер: ${item.size}`);
      if (item.style) parts.push(`стиль: ${item.style}`);
      if (item.lineMeta) parts.push(String(item.lineMeta));
      lines.push(`• ${parts.join(' | ')}`);
    });
  }

  lines.push('');
  lines.push('<b>Клиент:</b>');
  lines.push(`Имя: ${customer.name || '-'}`);
  lines.push(`Телефон: ${customer.phone || '-'}`);
  if (customer.address) lines.push(`Адрес: ${customer.address}`);
  if (customer.notes) lines.push(`Комментарий: ${customer.notes}`);
  if (orderData?.total) lines.push(`Сумма: ${orderData.total}`);
  lines.push(`Язык: ${orderData?.language || 'ru'}`);
  lines.push(`Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`);

  return lines.join('\n');
}

async function sendTelegramMessage(botToken: string, chatIds: string[], text: string): Promise<{ success: boolean; error?: string }> {
  if (!botToken || chatIds.length === 0) {
    return { success: false, error: 'Telegram bot token or chat ID is missing' };
  }

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json() as any;
      if (!res.ok || !data.ok) {
        throw new Error(data?.description || `Telegram HTTP ${res.status}`);
      }
      return data;
    })
  );

  const anyFulfilled = results.some((r) => r.status === 'fulfilled');
  if (anyFulfilled) {
    return { success: true };
  }

  const firstRejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
  return { success: false, error: firstRejected?.reason?.message || 'Failed to send to Telegram' };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const botToken = env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const rawChatIds = env.TELEGRAM_CHAT_ID ? env.TELEGRAM_CHAT_ID.split(',') : DEFAULT_CHAT_IDS;
    const chatIds = rawChatIds.map((s) => s.trim()).filter(Boolean);

    // API Routing
    if (url.pathname.startsWith('/api/')) {
      const subpath = url.pathname.replace(/^\/api/, '');

      if (subpath === '/health' || subpath === '/health/') {
        return jsonResponse({
          success: true,
          status: 'ok',
          service: 'Bententrade Worker',
          timestamp: new Date().toISOString(),
        }, 200, origin);
      }

      if (subpath === '/telegram/send' || subpath === '/orders') {
        if (request.method !== 'POST') {
          return jsonResponse({ success: false, error: 'Method not allowed' }, 405, origin);
        }
        try {
          const body = await request.json();
          const messageText = formatOrderMessage(body);
          const result = await sendTelegramMessage(botToken, chatIds, messageText);
          if (!result.success) {
            return jsonResponse({ success: false, error: result.error }, 500, origin);
          }
          return jsonResponse({ success: true, message: 'Order sent successfully' }, 200, origin);
        } catch (err: any) {
          return jsonResponse({ success: false, error: err.message || 'Invalid request body' }, 400, origin);
        }
      }

      if (subpath === '/telegram/test') {
        const testText = `🔔 <b>Bententrade Test Ping</b>\n\nПроверка связи Cloudflare Worker → Telegram Bot\nВремя: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`;
        const result = await sendTelegramMessage(botToken, chatIds, testText);
        return jsonResponse(result, result.success ? 200 : 500, origin);
      }

      if (subpath === '/telegram/chats') {
        return jsonResponse({
          success: true,
          configured: true,
          chatIdsCount: chatIds.length,
        }, 200, origin);
      }

      if (subpath === '/public/products' || subpath === '/products') {
        return jsonResponse({
          success: true,
          products: [],
        }, 200, origin);
      }

      if (subpath.startsWith('/public/blog')) {
        return jsonResponse({
          success: true,
          posts: [],
        }, 200, origin);
      }

      return jsonResponse({ success: false, error: 'Endpoint not found' }, 404, origin);
    }

    // Static Assets handling
    let assetResponse = await env.ASSETS.fetch(request);

    // If file not found, try clean URLs or SPA fallback
    if (assetResponse.status === 404) {
      if (url.pathname === '/catalog') {
        const catalogReq = new Request(new URL('/catalog.html', request.url), request);
        const catalogRes = await env.ASSETS.fetch(catalogReq);
        if (catalogRes.status < 400) return catalogRes;
      }
      if (url.pathname === '/legal') {
        const legalReq = new Request(new URL('/legal.html', request.url), request);
        const legalRes = await env.ASSETS.fetch(legalReq);
        if (legalRes.status < 400) return legalRes;
      }

      // If it's a GET request that expects HTML, serve index.html (SPA routing)
      const accept = request.headers.get('Accept') || '';
      if (request.method === 'GET' && !url.pathname.includes('.')) {
        const indexReq = new Request(new URL('/index.html', request.url), request);
        const indexRes = await env.ASSETS.fetch(indexReq);
        if (indexRes.status < 400) return indexRes;
      }
    }

    return assetResponse;
  },
};
