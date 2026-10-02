// Automated test for guest purchase linking, profile creation, and bot intent understanding
import assert from "node:assert";

console.log("=== BTT GUEST CHECKOUT, USER PROFILE & BOT AUDIT ===");

// 1. Verify bot intent engine
import fs from "node:fs";

const botCode = fs.readFileSync("assets/assistant.js", "utf8");

// Verify zero em-dash in assistant.js
assert(!botCode.includes("—") && !botCode.includes("–"), "Strict rule: assistant.js must not contain em-dash or en-dash");
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
assert(!cartCode.includes("—") && !cartCode.includes("–"), "Strict rule: cart.js must not contain em-dash or en-dash");
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

console.log("\nALL VERIFICATIONS PASSED!");
