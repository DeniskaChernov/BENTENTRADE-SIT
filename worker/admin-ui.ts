/** Server-rendered CRM shell served at /admin. It's a small vanilla-JS SPA
 *  that talks to /api/admin/* and /api/auth/*. Kept dependency-free on purpose. */
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Bententrade — CRM</title>
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<style>
  :root{--bg:#141210;--panel:#1d1a17;--panel2:#252019;--line:#332c24;--ink:#f3ece2;--muted:#a99a86;--copper:#e08a45;--copper2:#bd7335;--ok:#5fbf7a;--warn:#e0b545;--err:#e06a5a;}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);font-size:14px}
  a{color:var(--copper)}
  .wrap{display:flex;min-height:100vh}
  aside{width:210px;flex:none;background:var(--panel);border-right:1px solid var(--line);padding:18px 14px;position:sticky;top:0;height:100vh}
  aside h1{font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:var(--copper);margin:0 0 20px}
  nav button{display:block;width:100%;text-align:left;background:none;border:0;color:var(--muted);padding:10px 12px;border-radius:9px;cursor:pointer;font-size:14px;margin-bottom:2px}
  nav button:hover{background:var(--panel2);color:var(--ink)}
  nav button.active{background:var(--copper2);color:#fff}
  main{flex:1;padding:26px 30px;max-width:1100px}
  h2{font-size:22px;margin:0 0 18px}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-bottom:24px}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px}
  .card .n{font-size:26px;font-weight:800}
  .card .l{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
  table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);vertical-align:top}
  th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.05em}
  tr:last-child td{border-bottom:0}
  button.btn{background:var(--copper2);color:#fff;border:0;border-radius:8px;padding:9px 15px;cursor:pointer;font-size:13px}
  button.btn:hover{background:var(--copper)}
  button.ghost{background:none;border:1px solid var(--line);color:var(--ink)}
  input,select,textarea{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:9px 11px;font-size:14px;width:100%;font-family:inherit}
  textarea{min-height:90px;resize:vertical}
  label{display:block;color:var(--muted);font-size:12px;margin:12px 0 5px}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .row > *{flex:1;min-width:120px}
  .toolbar{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
  .toolbar .sp{flex:1}
  .pill{display:inline-block;padding:3px 9px;border-radius:20px;font-size:12px;background:var(--panel2);border:1px solid var(--line)}
  .pill.new{color:var(--warn)} .pill.delivered,.pill.published{color:var(--ok)} .pill.cancelled,.pill.draft{color:var(--muted)}
  dialog{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:22px;max-width:620px;width:92%}
  dialog::backdrop{background:rgba(0,0,0,.6)}
  .login{max-width:340px;margin:14vh auto;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:26px}
  .msg{color:var(--err);min-height:18px;font-size:13px;margin-top:8px}
  .tabs{display:flex;gap:6px;margin-bottom:14px}
  .tabs button{background:var(--panel2);border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:6px 12px;cursor:pointer}
  .tabs button.active{color:#fff;background:var(--copper2)}
  small.muted{color:var(--muted)}
</style>
</head>
<body>
<div id="app"></div>
<script src="/admin/app.js"></script>
</body>
</html>`;
