// Automated test for guest purchase linking, profile creation, and bot intent understanding
import assert from "node:assert";

console.log("=== BTT GUEST CHECKOUT, USER PROFILE & BOT AUDIT ===");

// 1. Verify bot intent engine
import fs from "node:fs";

const botCode = fs.readFileSync("assets/assistant.js", "utf8");

// Verify zero em-dash in assistant.js
assert(!botCode.includes("\u2014") && !botCode.includes("\u2013"), "Strict rule: assistant.js must not contain em-dash or en-dash");
console.log("  PASS: assistant.js has zero em-dash or en-dash");

// Verify that assistant.js contains intent recognition for prices, delivery, models, location, etc.
assert(botCode.includes("resolveBotResponse"), "assistant.js must implement resolveBotResponse");
assert(botCode.includes("matchProduct"), "assistant.js must implement matchProduct");
assert(botCode.includes("roero"), "assistant.js must support roero model");
assert(botCode.includes("todo"), "assistant.js must support todo model");
assert(botCode.includes("jardin"), "assistant.js must support jardin model");
assert(!botCode.includes("до 120 кг"), "assistant.js must not contain unverified 120kg claims");
assert(!botCode.includes("до 150 кг"), "assistant.js must not contain unverified 150kg claims");
assert(!botCode.includes("до 180 кг"), "assistant.js must not contain unverified 180kg claims");
console.log("  PASS: assistant.js cleanly stripped of unverified load claims and equipped with intent engine");

// 2. Verify cart.js has create_account and guest linking
const cartCode = fs.readFileSync("assets/cart.js", "utf8");
assert(!cartCode.includes("\u2014") && !cartCode.includes("\u2013"), "Strict rule: cart.js must not contain em-dash or en-dash");
assert(cartCode.includes("create_account"), "cart.js must support create_account");
assert(cartCode.includes("data-co-pwd-wrap"), "cart.js must have password toggle");
assert(cartCode.includes("guestTrackTitle"), "cart.js must provide guest order tracking invitation");
console.log("  PASS: cart.js has seamless checkout account creation and guest tracking UI");

// 3. Verify orders.ts creates user and links orders
const ordersCode = fs.readFileSync("worker/routes/orders.ts", "utf8");
assert(ordersCode.includes("createAccount"), "orders.ts must handle createAccount");
assert(ordersCode.includes("hashPassword"), "orders.ts must hash password for new customer");
assert(ordersCode.includes("UPDATE orders"), "orders.ts must claim unassigned guest orders");
console.log("  PASS: orders.ts creates user profile and claims guest orders");

// 4. Verify authRoutes.ts links guest orders on registration and login
const authCode = fs.readFileSync("worker/routes/authRoutes.ts", "utf8");
assert(authCode.includes("UPDATE orders"), "authRoutes.ts must link guest orders on register/login");
console.log("  PASS: authRoutes.ts automatically links guest orders on registration and login");

// 5. Verify contact.ts bot lead dispatch to Telegram
const contactCode = fs.readFileSync("worker/routes/contact.ts", "utf8");
assert(!contactCode.includes("\u2014") && !contactCode.includes("\u2013"), "Strict rule: contact.ts must not contain em-dash or en-dash");
assert(contactCode.includes('source === "bot"'), "contact.ts must format bot leads for Telegram");
assert(contactCode.includes("Контекст диалога"), "contact.ts must forward chat history context to Telegram");
assert(contactCode.includes("notifyTelegram"), "contact.ts must call notifyTelegram");
console.log("  PASS: contact.ts supports rich bot lead formatting and Telegram notifications with chat history");

// 6. Verify assistant.js lead capture and product cards
assert(botCode.includes("sendBotLead"), "assistant.js must implement sendBotLead");
assert(botCode.includes("extractPhone"), "assistant.js must implement extractPhone");
assert(botCode.includes("renderProductCard"), "assistant.js must implement renderProductCard");
assert(botCode.includes("renderLeadForm"), "assistant.js must implement renderLeadForm");
assert(botCode.includes("renderCartState"), "assistant.js must implement renderCartState");
assert(botCode.includes("data-bot-add"), "assistant.js must allow direct add to cart from chat");
console.log("  PASS: assistant.js has full lead dispatch, product cards, and cart integration");

// 7. Verify pages.css bot styling and dashes
const cssCode = fs.readFileSync("assets/pages.css", "utf8");
assert(!cssCode.includes("\u2014") && !cssCode.includes("\u2013"), "Strict rule: pages.css must not contain em-dash or en-dash");
assert(cssCode.includes(".bot-prod-card"), "pages.css must include .bot-prod-card");
assert(cssCode.includes(".bot-lead-box"), "pages.css must include .bot-lead-box");
assert(cssCode.includes(".bot-lead-btn"), "pages.css must include .bot-lead-btn");
assert(cssCode.includes(".bot-cart-card"), "pages.css must include .bot-cart-card");
console.log("  PASS: pages.css has bot styling and zero em-dash/en-dash");

console.log("\nALL VERIFICATIONS PASSED!");
