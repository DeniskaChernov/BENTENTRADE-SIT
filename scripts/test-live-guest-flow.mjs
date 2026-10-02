// Live test for guest order linking and checkout registration
import assert from "node:assert";

const BASE_URL = "https://bententrade.denisblackman2.workers.dev";

async function run(){
  console.log("=== TESTING LIVE GUEST ORDER LINKING & REGISTRATION ===");

  const rnd = Math.floor(Math.random() * 1000000);
  const testEmail = `testuser_${rnd}@btt-test.uz`;
  const testPhone = `+99890${String(rnd).padStart(7, "0")}`;
  const testPassword = `Password${rnd}!`;

  // 1. Place an order as a guest (unregistered)
  console.log(`1. Placing guest order with phone ${testPhone} and email ${testEmail}...`);
  const guestOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: "stul-roero", name: "Стул Roero", qty: 1, price: 188000 }],
      currency: "сум",
      lang: "ru",
      name: "Тестовый Гость",
      phone: testPhone,
      email: testEmail,
      delivery: "pickup",
      payment_method: "cash_or_pos"
    })
  });
  assert(guestOrderRes.ok, `Guest order placement failed: HTTP ${guestOrderRes.status}`);
  const guestOrderData = await guestOrderRes.json();
  assert(guestOrderData.ok, "Guest order ok should be true");
  const guestOrderId = guestOrderData.orderId;
  console.log(`   Order created: ${guestOrderId}`);

  // 2. Now, the guest registers an account with the SAME email and phone
  console.log(`2. Registering account for ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Тестовый Гость",
      email: testEmail,
      phone: testPhone,
      password: testPassword
    })
  });
  assert(regRes.ok, `Registration failed: HTTP ${regRes.status}`);
  const regData = await regRes.json();
  assert(regData.ok && regData.user, "Registration data should have user");
  console.log(`   User registered: ID ${regData.user.id}, email ${regData.user.email}`);

  // Extract session cookie from registration response
  const setCookie = regRes.headers.get("set-cookie");
  assert(setCookie, "Session cookie must be returned upon registration");

  // 3. Request user's orders (/api/orders) using the session cookie
  console.log("3. Fetching user's order history via GET /api/orders...");
  const myOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
    headers: { "Cookie": setCookie }
  });
  assert(myOrdersRes.ok, `Fetch orders failed: HTTP ${myOrdersRes.status}`);
  const myOrdersData = await myOrdersRes.json();
  const linked = (myOrdersData.orders || []).find(o => o.public_id === guestOrderId);
  assert(linked, `Guest order ${guestOrderId} was NOT automatically linked to user profile! Found orders: ${JSON.stringify(myOrdersData.orders)}`);
  console.log(`   SUCCESS: Guest order ${guestOrderId} was automatically claimed by newly registered profile!`);

  // 4. Test assistant bot code on live deployment
  console.log("4. Verifying live assets/assistant.js...");
  const botRes = await fetch(`${BASE_URL}/assets/assistant.js`);
  assert(botRes.ok, `Failed to fetch assistant.js: HTTP ${botRes.status}`);
  const liveBotCode = await botRes.text();
  assert(liveBotCode.includes("resolveBotResponse"), "Live assistant.js must have resolveBotResponse");
  assert(liveBotCode.includes("matchProduct"), "Live assistant.js must have matchProduct");
  assert(!liveBotCode.includes("до 120 кг"), "Live assistant.js must not contain unverified 120kg claims");
  console.log("   SUCCESS: Live assistant.js has smart intent engine and zero unverified claims!");

  console.log("\nALL PRODUCTION LIVE CHECKS PASSED!");
}

run().catch(e => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
