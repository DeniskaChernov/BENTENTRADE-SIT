import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
// Find the end of the stul-todo article
const todoEnd = html.indexOf('data-slug="stul-todo"');
const articleEnd = html.indexOf('</article>', todoEnd) + 10;
console.log('After stul-todo article ends at char:', articleEnd);
console.log('Next 200 chars:');
console.log(JSON.stringify(html.substring(articleEnd, articleEnd + 200)));
