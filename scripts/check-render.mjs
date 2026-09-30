import { execSync } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

for (const slug of ['stul-roero', 'stul-todo', 'stul-todo-soft']) {
  const url = `https://bententrade.denisblackman2.workers.dev/catalog/${slug}`;
  const out = `C:\\Bententrade-Sit\\screenshot-${slug}.png`;
  console.log(`Taking screenshot for ${slug}...`);
  execSync(`"${chromePath}" --headless=new "--screenshot=${out}" "${url}"`, {
    stdio: 'inherit'
  });
  console.log(`Saved screenshot for ${slug}`);
}
