async function testBotLead() {
  const target = process.env.TEST_URL || "https://bententrade.denisblackman2.workers.dev";
  console.log("Testing live bot lead submission to:", target);
  const res = await fetch(`${target}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "bot",
      name: "Посетитель чата (тест)",
      phone: "+998901234567",
      message: "Тест передачи контекста диалога в Telegram",
      lang: "ru",
      history: [
        { who: "user", text: "Здравствуйте, есть ли у вас декоративные лампы?" },
        { who: "bot", text: "Дизайнерские декоративные лампы 3D-печати в каталоге <a href='catalog.html?cat=lamps'>ламп</a>." }
      ]
    })
  });
  console.log("HTTP status:", res.status);
  const data = await res.json();
  console.log("Response data:", data);
  if (res.status === 200 && data.ok) {
    console.log("SUCCESS: Bot lead saved and transmitted cleanly to Telegram!");
  } else {
    console.error("FAIL: Bot lead submission failed:", data);
    process.exit(1);
  }
}
testBotLead();
