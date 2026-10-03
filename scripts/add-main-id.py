import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
for p in root.glob("*.html"):
    t = p.read_text(encoding="utf-8")
    if 'id="main"' in t:
        continue
    t = t.replace("<main class=", '<main id="main" class=')
    t = t.replace("<main>", '<main id="main">')
    p.write_text(t, encoding="utf-8")
    print(p.name)
