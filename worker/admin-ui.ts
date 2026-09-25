/** Server-rendered CRM shell served at /admin.
 *  Modern, dependency-free vanilla JS SPA with a luxury dark/copper design system. */
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Bententrade — Панель управления (CMS)</title>
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesque:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0e0d0b;
    --sidebar: #13110e;
    --panel: #181512;
    --panel2: #201c18;
    --panel3: #2a251f;
    --line: #322b23;
    --line-subtle: #221d17;
    --ink: #f7f3ee;
    --ink-soft: #d8cec2;
    --muted: #968877;
    --copper: #e08a45;
    --copper2: #bd7335;
    --copper-glow: rgba(224, 138, 69, 0.16);
    --copper-hover: #f09a55;
    --ok: #48bb78;
    --ok-soft: rgba(72, 187, 120, 0.15);
    --warn: #ecc94b;
    --warn-soft: rgba(236, 201, 75, 0.15);
    --err: #f56565;
    --err-soft: rgba(245, 101, 101, 0.15);
    --blue: #4299e1;
    --blue-soft: rgba(66, 153, 225, 0.15);
    --radius-sm: 6px;
    --radius: 10px;
    --radius-lg: 16px;
    --shadow: 0 10px 30px -8px rgba(0,0,0,.6);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Hanken Grotesque', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--ink);
    font-size: 14px;
    line-height: 1.5;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--copper); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Layout */
  .app-wrap { display: flex; min-height: 100vh; }
  
  /* Sidebar */
  aside {
    width: 240px;
    flex: none;
    background: var(--sidebar);
    border-right: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 40;
    transition: transform 0.25s ease;
  }
  .brand {
    padding: 22px 18px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--line-subtle);
  }
  .brand-logo {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--copper), var(--copper2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: #fff;
    font-size: 17px;
    box-shadow: 0 4px 12px var(--copper-glow);
  }
  .brand-text h1 {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ink);
    line-height: 1.2;
  }
  .brand-text span {
    font-size: 11px;
    color: var(--copper);
    letter-spacing: .06em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .nav-group {
    padding: 16px 12px;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
  .nav-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--muted);
    font-weight: 700;
    padding: 6px 10px;
    margin-top: 6px;
  }
  nav button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    color: var(--ink-soft);
    padding: 10px 12px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    position: relative;
  }
  nav button:hover {
    background: var(--panel2);
    color: var(--ink);
  }
  nav button.active {
    background: var(--copper-glow);
    color: var(--copper);
    font-weight: 600;
  }
  nav button.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    background: var(--copper);
    border-radius: 0 3px 3px 0;
  }
  nav button svg { width: 18px; height: 18px; stroke-width: 1.9; flex-none: 18px; }
  .badge-count {
    margin-left: auto;
    background: var(--panel3);
    color: var(--ink-soft);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 12px;
    line-height: 1.3;
  }
  nav button.active .badge-count {
    background: var(--copper);
    color: #fff;
  }
  .badge-count.warn { background: var(--warn); color: #000; }

  .aside-foot {
    padding: 14px;
    border-top: 1px solid var(--line-subtle);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .user-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius);
    background: var(--panel);
  }
  .user-ava {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--panel3);
    border: 1px solid var(--line);
    color: var(--copper);
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--ink); truncate: ellipsis; white-space: nowrap; overflow: hidden; }
  .user-role { font-size: 11px; color: var(--muted); }

  /* Main content area */
  .main-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  header.top-bar {
    height: 64px;
    border-bottom: 1px solid var(--line);
    background: rgba(19, 17, 14, 0.7);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    position: sticky;
    top: 0;
    z-index: 30;
  }
  .top-left { display: flex; align-items: center; gap: 16px; }
  .mob-menu-btn {
    display: none;
    background: none;
    border: 1px solid var(--line);
    color: var(--ink);
    border-radius: var(--radius-sm);
    padding: 7px;
    cursor: pointer;
  }
  .page-title { font-size: 19px; font-weight: 700; color: var(--ink); }
  .top-actions { display: flex; align-items: center; gap: 10px; }

  main#content {
    flex: 1;
    padding: 28px;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
  }

  /* Cards, KPI */
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 26px;
  }
  .kpi {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }
  .kpi:hover { border-color: var(--copper); transform: translateY(-2px); }
  .kpi-h { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
  .kpi-icon { width: 36px; height: 36px; border-radius: var(--radius); background: var(--panel2); color: var(--copper); display: flex; align-items: center; justify-content: center; }
  .kpi-icon svg { width: 20px; height: 20px; }
  .kpi-n { font-size: 32px; font-weight: 800; color: var(--ink); margin: 10px 0 2px; }
  .kpi-sub { font-size: 12px; color: var(--muted); }
  .kpi-sub.warn { color: var(--warn); font-weight: 600; }

  /* Buttons */
  button, input, select, textarea { font-family: inherit; }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: var(--copper);
    color: #110e0b;
    font-weight: 700;
    border: 0;
    border-radius: var(--radius);
    padding: 9px 16px;
    cursor: pointer;
    font-size: 13.5px;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .btn:hover { background: var(--copper-hover); transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn svg { width: 16px; height: 16px; stroke-width: 2.2; }
  .btn.ghost {
    background: var(--panel2);
    color: var(--ink);
    border: 1px solid var(--line);
    font-weight: 600;
  }
  .btn.ghost:hover { background: var(--panel3); border-color: var(--copper); color: var(--copper); }
  .btn.danger { background: var(--err-soft); color: var(--err); border: 1px solid transparent; font-weight: 600; }
  .btn.danger:hover { background: var(--err); color: #fff; }
  .btn.sm { padding: 6px 12px; font-size: 12.5px; border-radius: var(--radius-sm); }
  .btn.icon-only { padding: 7px; border-radius: var(--radius-sm); }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 8px 12px;
    min-width: 260px;
    flex: 1;
    max-width: 380px;
  }
  .search-box svg { width: 16px; height: 16px; color: var(--muted); }
  .search-box input {
    background: transparent;
    border: 0;
    color: var(--ink);
    font-size: 13.5px;
    width: 100%;
    outline: none;
  }
  .filters-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .filter-chip {
    background: var(--panel);
    border: 1px solid var(--line);
    color: var(--muted);
    font-size: 12.5px;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .filter-chip:hover { border-color: var(--copper); color: var(--ink); }
  .filter-chip.active {
    background: var(--copper-glow);
    border-color: var(--copper);
    color: var(--copper);
    font-weight: 600;
  }

  /* Table */
  .table-card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  th, td {
    padding: 13px 16px;
    text-align: left;
    border-bottom: 1px solid var(--line-subtle);
    vertical-align: middle;
  }
  th {
    background: var(--panel2);
    color: var(--muted);
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: .06em;
    font-weight: 700;
  }
  tr:last-child td { border-bottom: 0; }
  tbody tr { transition: background 0.15s ease; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }

  /* Product Thumbnail */
  .tbl-thumb {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: var(--panel2);
    object-fit: cover;
    border: 1px solid var(--line);
    flex-none: 44px;
    display: block;
  }
  .tbl-prod-info { display: flex; align-items: center; gap: 12px; }
  .tbl-prod-name { font-weight: 600; color: var(--ink); }
  .tbl-prod-id { font-size: 11px; color: var(--muted); }

  /* Status Pills */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    line-height: 1.2;
  }
  .pill::before { content:''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .pill.new { background: var(--warn-soft); color: var(--warn); }
  .pill.processing { background: var(--blue-soft); color: var(--blue); }
  .pill.delivered, .pill.published, .pill.active { background: var(--ok-soft); color: var(--ok); }
  .pill.cancelled, .pill.draft, .pill.hidden { background: var(--panel3); color: var(--muted); }

  /* Toggle Switch */
  .switch {
    width: 36px;
    height: 20px;
    background: var(--line);
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    padding: 2px;
    cursor: pointer;
    transition: background 0.2s ease;
    border: 0;
  }
  .switch.on { background: var(--ok); }
  .switch-dot {
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }
  .switch.on .switch-dot { transform: translateX(16px); }

  /* Modal / Dialog */
  dialog {
    background: var(--panel);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 0;
    max-width: 680px;
    width: 92%;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.85);
    margin: auto;
  }
  dialog.dlg-wide { max-width: 1160px; width: 96%; }
  dialog.dlg-full { max-width: 1380px; width: 98%; }
  dialog::backdrop {
    background: rgba(8, 7, 6, 0.78);
    backdrop-filter: blur(8px);
  }
  .dlg-header {
    padding: 18px 24px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dlg-header h2 { font-size: 18px; font-weight: 700; }
  .dlg-close {
    background: none;
    border: 0;
    color: var(--muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }
  .dlg-close:hover { color: var(--ink); background: var(--panel2); }
  .dlg-body {
    padding: 24px;
    max-height: 75vh;
    overflow-y: auto;
    scrollbar-width: thin;
  }
  .dlg-foot {
    padding: 16px 24px;
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: var(--panel2);
  }

  /* Form controls */
  .field { margin-bottom: 14px; }
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-soft);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  input, select, textarea {
    background: var(--panel2);
    border: 1px solid var(--line);
    color: var(--ink);
    border-radius: var(--radius);
    padding: 9px 12px;
    font-size: 13.5px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s ease;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--copper);
    box-shadow: 0 0 0 2px var(--copper-glow);
  }
  textarea { min-height: 90px; resize: vertical; }
  .row { display: flex; gap: 14px; }
  .row > * { flex: 1; min-width: 0; }
  .hint { font-size: 11.5px; color: var(--muted); margin-top: 4px; }

  /* Tabs inside modal */
  .tabs {
    display: flex;
    gap: 4px;
    background: var(--panel2);
    padding: 4px;
    border-radius: var(--radius);
    margin-bottom: 18px;
  }
  .tabs button {
    flex: 1;
    background: none;
    border: 0;
    color: var(--muted);
    padding: 7px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .tabs button.active {
    background: var(--copper);
    color: #110e0b;
    font-weight: 700;
  }

  /* Dropzone */
  .dropzone {
    border: 2px dashed var(--line);
    border-radius: var(--radius);
    padding: 24px;
    text-align: center;
    background: rgba(255,255,255,0.01);
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 16px;
  }
  .dropzone:hover, .dropzone.dragover {
    border-color: var(--copper);
    background: var(--copper-glow);
  }
  .dropzone svg { width: 32px; height: 32px; color: var(--copper); margin-bottom: 8px; }

  /* Media Grid */
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  .media-card {
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }
  .media-card:hover { transform: translateY(-2px); border-color: var(--copper); }
  .media-card img { width: 100%; height: 110px; object-fit: cover; display: block; background: var(--line-subtle); }
  .media-meta { padding: 8px; font-size: 11px; color: var(--muted); }

  /* Markdown editor toolbar */
  .md-toolbar {
    display: flex;
    gap: 4px;
    background: var(--panel3);
    padding: 4px 6px;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    border: 1px solid var(--line);
    border-bottom: 0;
  }
  .md-btn {
    background: none;
    border: 0;
    color: var(--ink-soft);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  }
  .md-btn:hover { background: var(--panel2); color: var(--copper); }
  .md-textarea { border-top-left-radius: 0; border-top-right-radius: 0; min-height: 180px; }

  /* Live Preview Box */
  .preview-box {
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 16px;
    margin-top: 14px;
    font-size: 13.5px;
    line-height: 1.6;
  }
  .preview-box h2 { font-size: 18px; margin-bottom: 8px; color: var(--copper); }
  .preview-box p { margin-bottom: 10px; color: var(--ink-soft); }

  /* Industry-grade 2-Column Editor Layout (Shopify Polaris style) */
  .editor-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 22px;
    align-items: start;
  }
  @media (max-width: 980px) {
    .editor-grid { grid-template-columns: 1fr; }
  }
  .editor-main {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }
  .editor-side {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: sticky;
    top: 0;
  }
  .editor-card {
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 18px 20px;
  }
  .editor-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line-subtle);
  }
  .editor-card-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--copper);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .editor-card-title svg { width: 14px; height: 14px; }

  /* Live Google SERP Snippet Preview */
  .serp-box {
    background: #202124;
    border: 1px solid #3c4043;
    border-radius: 8px;
    padding: 14px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  }
  .serp-url {
    font-size: 12px;
    color: #bdc1c6;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .serp-url span { color: #9aa0a6; }
  .serp-title {
    font-size: 16px;
    color: #8ab4f8;
    cursor: pointer;
    line-height: 1.3;
    margin-bottom: 4px;
    font-weight: 400;
    word-break: break-word;
  }
  .serp-title:hover { text-decoration: underline; }
  .serp-desc {
    font-size: 13px;
    color: #bdc1c6;
    line-height: 1.4;
    word-break: break-word;
  }
  .char-counter {
    font-size: 11px;
    color: var(--muted);
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }
  .char-counter.warn { color: var(--warn); }
  .char-counter.err { color: var(--err); font-weight: 700; }

  /* Live Storefront Card Preview */
  .store-card-preview {
    background: #151310;
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,0.5);
    max-width: 290px;
    margin: 0 auto;
    width: 100%;
  }
  .store-card-img-wrap {
    position: relative;
    width: 100%;
    height: 180px;
    background: #1f1b16;
    overflow: hidden;
  }
  .store-card-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .store-card-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: var(--copper);
    color: #110e0b;
    font-size: 9.5px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .store-card-body {
    padding: 14px;
  }
  .store-card-cat {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .05em;
    margin-bottom: 4px;
  }
  .store-card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .store-card-pricing {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }
  .store-card-now {
    font-size: 16px;
    font-weight: 700;
    color: var(--copper);
  }
  .store-card-old {
    font-size: 12px;
    color: var(--muted);
    text-decoration: line-through;
  }
  .store-card-disc {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--ok);
    background: var(--ok-soft);
    padding: 2px 6px;
    border-radius: 4px;
  }

  /* Multi-Photo Gallery Grid (Shopify Polaris style) */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .gallery-item {
    position: relative;
    height: 95px;
    border-radius: var(--radius);
    overflow: hidden;
    border: 2px solid var(--line);
    background: var(--panel3);
    transition: all 0.2s ease;
  }
  .gallery-item.is-primary {
    border-color: var(--copper);
    box-shadow: 0 0 0 2px var(--copper-glow);
  }
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gallery-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    background: var(--copper);
    color: #110e0b;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: .02em;
    pointer-events: none;
    z-index: 2;
  }
  .gallery-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 2;
  }
  .gallery-item:hover .gallery-actions {
    opacity: 1;
  }
  .gallery-btn {
    background: rgba(14, 13, 11, 0.88);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.15s ease;
  }
  .gallery-btn:hover {
    background: var(--copper);
    color: #110e0b;
  }
  .gallery-btn.del:hover {
    background: var(--err);
    color: #fff;
  }

  /* Size Chips / Tag Input */
  .chips-box {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    background: var(--panel2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 6px 10px;
    min-height: 42px;
    align-items: center;
    transition: border-color 0.15s ease;
  }
  .chips-box:focus-within {
    border-color: var(--copper);
    box-shadow: 0 0 0 2px var(--copper-glow);
  }
  .chip-pill {
    background: var(--panel3);
    border: 1px solid var(--line);
    color: var(--ink);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1.2;
  }
  .chip-del {
    background: none;
    border: 0;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
  }
  .chip-del:hover { color: var(--err); }
  .chip-inp {
    border: 0 !important;
    background: transparent !important;
    padding: 3px 6px !important;
    flex: 1;
    min-width: 120px;
    box-shadow: none !important;
    color: var(--ink);
    font-size: 13px;
  }

  /* Side-by-side Translation helper */
  .side-by-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 860px) {
    .side-by-side { grid-template-columns: 1fr; }
  }
  .ref-panel {
    background: var(--panel3);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 12px 14px;
    font-size: 13px;
    color: var(--ink-soft);
  }
  .ref-panel-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--muted);
    margin-bottom: 6px;
  }

  /* Reading meter and draft autosave badge */
  .writing-meter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
    padding: 8px 12px;
    background: var(--panel3);
    border-radius: var(--radius-sm);
    margin-top: 8px;
  }
  .autosave-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    color: var(--muted);
    padding: 3px 10px;
    border-radius: 12px;
    background: var(--panel2);
    border: 1px solid var(--line);
    transition: all 0.2s ease;
  }
  .autosave-pill.saved {
    color: var(--ok);
    border-color: var(--ok-soft);
    background: rgba(72, 187, 120, 0.08);
  }

  /* Spec Dynamic Editor (Key / Value) */
  .spec-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .spec-row {
    display: grid;
    grid-template-columns: 1fr 1fr 32px;
    gap: 8px;
    align-items: center;
  }

  /* Media picker overlay modal */
  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    max-height: 380px;
    overflow-y: auto;
    padding: 10px 0;
  }
  .picker-item {
    position: relative;
    height: 100px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid var(--line);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .picker-item:hover {
    border-color: var(--copper);
    transform: scale(1.02);
  }
  .picker-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Quick Discount Presets */
  .disc-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 6px;
    margin-bottom: 8px;
  }
  .disc-preset {
    background: var(--panel3);
    border: 1px solid var(--line);
    color: var(--ink-soft);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11.5px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .disc-preset:hover {
    border-color: var(--copper);
    color: var(--copper);
    background: var(--copper-glow);
  }

  /* Keyboard shortcut badge */
  .kbd-hint {
    font-size: 11px;
    color: var(--muted);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .kbd-hint kbd {
    background: var(--panel3);
    border: 1px solid var(--line);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: inherit;
    font-size: 10.5px;
    color: var(--ink-soft);
  }

  /* Table search & count badge */
  .filter-chip .chip-cnt {
    display: inline-block;
    background: var(--panel3);
    padding: 1px 6px;
    border-radius: 10px;
    font-size: 10.5px;
    margin-left: 5px;
  }
  .filter-chip.active .chip-cnt {
    background: var(--copper);
    color: #110e0b;
    font-weight: 700;
  }



  /* Toast notification */
  .toast-wrap {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }
  .toast {
    background: var(--panel);
    color: var(--ink);
    border: 1px solid var(--line);
    border-left: 4px solid var(--copper);
    padding: 12px 18px;
    border-radius: var(--radius);
    box-shadow: 0 10px 25px rgba(0,0,0,0.6);
    font-size: 13.5px;
    font-weight: 500;
    opacity: 0;
    transform: translateY(12px);
    transition: all 0.25s ease;
    pointer-events: auto;
  }
  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.ok { border-left-color: var(--ok); }
  .toast.err { border-left-color: var(--err); }

  /* Login Screen */
  .login-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: radial-gradient(circle at top, #241d16 0%, #0e0d0b 70%);
    padding: 20px;
  }
  .login-card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 34px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 40px rgba(0,0,0,.7);
  }
  .login-card .brand { justify-content: center; border: 0; padding: 0 0 24px; }

  /* Responsive */
  @media (max-width: 900px) {
    aside { position: fixed; left: 0; transform: translateX(-100%); }
    aside.open { transform: translateX(0); }
    .mob-menu-btn { display: block; }
    main#content { padding: 18px 16px; }
    header.top-bar { padding: 0 16px; }
  }
</style>
</head>
<body>
<div id="app"></div>
<div class="toast-wrap" id="toasts"></div>
<script src="/admin/app.js"></script>
</body>
</html>`;

