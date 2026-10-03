import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';

const ROLE_RANK = {
  manager: 1,
  editor: 2,
  owner: 3,
};

const ADMIN_ROLE = process.env.ADMIN_ROLE || 'owner';

/** Макс. размер загружаемого изображения (после декодирования base64), по умолчанию 5 МБ. */
const ADMIN_MEDIA_MAX_BYTES = Math.max(256 * 1024, Number(process.env.ADMIN_MEDIA_MAX_BYTES || 5 * 1024 * 1024));

const ALLOWED_UPLOAD_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function slugify(input = '') {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || randomUUID().slice(0, 8);
}

function hasRole(requiredRole, currentRole = 'manager') {
  return (ROLE_RANK[currentRole] || 0) >= (ROLE_RANK[requiredRole] || 0);
}

function mapCmsProductRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content || {},
    price: row.price,
    image: row.image,
    category: row.category,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapBlogRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content || {},
    image: row.image,
    tag: row.tag || {},
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

async function writeAudit(pool, session, action, entityType, entityId, payload) {
  const actor = String(session?.actor || 'admin');
  const role = String(session?.role || 'manager');
  await pool.query(
    `INSERT INTO audit_log (id, actor, actor_role, action, entity_type, entity_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [randomUUID(), actor, role, action, entityType, entityId, JSON.stringify(payload || {})],
  );
}

export async function ensureCmsSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      content JSONB NOT NULL DEFAULT '{}'::jsonb,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      image TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      content JSONB NOT NULL DEFAULT '{}'::jsonb,
      image TEXT NOT NULL DEFAULT '',
      tag JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'manager',
      password_hash TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_roles (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      rank INT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cms_products_slug ON cms_products(slug);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cms_products_status ON cms_products(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cms_products_updated ON cms_products(updated_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_updated ON blog_posts(updated_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);`);

  await pool.query(`
    INSERT INTO admin_roles (id, code, title, rank) VALUES
      ('role-owner', 'owner', 'Owner', 3),
      ('role-editor', 'editor', 'Editor', 2),
      ('role-manager', 'manager', 'Manager', 1)
    ON CONFLICT (code) DO NOTHING;
  `);

  const seededEmail = process.env.ADMIN_EMAIL || 'admin@local';
  const passHash = createHash('sha256').update(String(process.env.ADMIN_PASSWORD || '')).digest('hex');
  await pool.query(
    `INSERT INTO admin_users (id, email, role, password_hash)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    ['admin-default', seededEmail, ADMIN_ROLE, passHash],
  );
}

export async function handleCmsApi({ req, res, method, path: apiPath, pool, readBody, sendJson, resolveAdminSession }) {
  const requestUrl = new URL(req.url || '/api', 'http://localhost');
  const search = requestUrl.searchParams;

  const skipAdminSession =
    method === 'POST' && apiPath === '/admin/login';

  /** @type {{ role: string; actor: string } | null} */
  let adminSession = null;
  if (apiPath.startsWith('/admin/') && !skipAdminSession) {
    adminSession = await resolveAdminSession(req);
    if (!adminSession) {
      sendJson(res, 401, { success: false, error: 'Invalid admin credentials' });
      return true;
    }
  }

  const role = adminSession ? adminSession.role : 'manager';
  const auditSession = adminSession || { role: 'manager', actor: 'system' };

  const ensureRole = (requiredRole) => {
    if (!hasRole(requiredRole, role)) {
      sendJson(res, 403, { success: false, error: 'Forbidden by role policy' });
      return false;
    }
    return true;
  };

  if (method === 'GET' && apiPath === '/public/products') {
    const result = await pool.query(
      `SELECT * FROM cms_products WHERE deleted_at IS NULL AND status = 'published' ORDER BY published_at DESC NULLS LAST, created_at DESC`,
    );
    sendJson(res, 200, { success: true, products: result.rows.map(mapCmsProductRow) });
    return true;
  }

  if (method === 'GET' && apiPath === '/public/blog') {
    const limitRaw = Number(search.get('limit') || 12);
    const offsetRaw = Number(search.get('offset') || 0);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 12;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
    const tag = String(search.get('tag') || '').trim();
    const hasTag = Boolean(tag);

    const totalResult = hasTag
      ? await pool.query(
          `SELECT COUNT(*)::int AS count
           FROM blog_posts
           WHERE deleted_at IS NULL AND status = 'published' AND LOWER(COALESCE(tag->>'ru','')) = LOWER($1)`,
          [tag],
        )
      : await pool.query(
          `SELECT COUNT(*)::int AS count
           FROM blog_posts
           WHERE deleted_at IS NULL AND status = 'published'`,
        );

    const result = hasTag
      ? await pool.query(
          `SELECT * FROM blog_posts
           WHERE deleted_at IS NULL AND status = 'published' AND LOWER(COALESCE(tag->>'ru','')) = LOWER($1)
           ORDER BY published_at DESC NULLS LAST, created_at DESC
           LIMIT $2 OFFSET $3`,
          [tag, limit, offset],
        )
      : await pool.query(
          `SELECT * FROM blog_posts
           WHERE deleted_at IS NULL AND status = 'published'
           ORDER BY published_at DESC NULLS LAST, created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset],
        );
    sendJson(res, 200, {
      success: true,
      posts: result.rows.map(mapBlogRow),
      pagination: {
        total: Number(totalResult.rows[0]?.count || 0),
        limit,
        offset,
        hasMore: offset + result.rows.length < Number(totalResult.rows[0]?.count || 0),
      },
    });
    return true;
  }

  if (method === 'GET' && apiPath.startsWith('/public/blog/')) {
    const slug = decodeURIComponent(apiPath.replace('/public/blog/', ''));
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND deleted_at IS NULL AND status = 'published' LIMIT 1`,
      [slug],
    );
    if (!result.rows.length) {
      sendJson(res, 404, { success: false, error: 'Post not found' });
      return true;
    }
    sendJson(res, 200, { success: true, post: mapBlogRow(result.rows[0]) });
    return true;
  }

  if (method === 'GET' && apiPath === '/admin/roles') {
    const result = await pool.query('SELECT code, title, rank FROM admin_roles ORDER BY rank DESC');
    sendJson(res, 200, { success: true, roles: result.rows, activeRole: role });
    return true;
  }

  if (method === 'GET' && apiPath === '/admin/audit') {
    if (!ensureRole('editor')) return true;
    const result = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200');
    sendJson(res, 200, { success: true, logs: result.rows });
    return true;
  }

  if (method === 'POST' && apiPath === '/admin/media/upload') {
    if (!ensureRole('editor')) return true;
    const body = await readBody(req);
    const fileName = String(body.fileName || `upload-${Date.now()}.txt`);
    const dataUrl = String(body.dataUrl || '');
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      sendJson(res, 400, { success: false, error: 'Invalid dataUrl payload' });
      return true;
    }
    const mimeRaw = String(match[1] || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_UPLOAD_MIMES.has(mimeRaw)) {
      sendJson(res, 400, { success: false, error: 'Допустимы только изображения JPEG, PNG, WebP или GIF' });
      return true;
    }
    const base64 = match[2];
    if (base64.length * 0.75 > ADMIN_MEDIA_MAX_BYTES + 65536) {
      sendJson(res, 400, { success: false, error: 'Файл слишком большой' });
      return true;
    }
    let buf;
    try {
      buf = Buffer.from(base64, 'base64');
    } catch {
      sendJson(res, 400, { success: false, error: 'Некорректные данные изображения' });
      return true;
    }
    if (buf.length > ADMIN_MEDIA_MAX_BYTES) {
      sendJson(res, 400, { success: false, error: 'Файл слишком большой' });
      return true;
    }
    const ext =
      mimeRaw.includes('png') ? 'png' : mimeRaw.includes('webp') ? 'webp' : mimeRaw.includes('gif') ? 'gif' : 'jpg';
    const safeName = `${Date.now()}-${slugify(fileName)}.${ext}`;
    const dir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, safeName), buf);
    const url = `/api/media/${encodeURIComponent(safeName)}`;
    await writeAudit(pool, auditSession, 'upload', 'media', safeName, { mime: mimeRaw, url });
    sendJson(res, 201, { success: true, url, fileName: safeName });
    return true;
  }

  if (method === 'GET' && apiPath.startsWith('/media/')) {
    const decoded = decodeURIComponent(apiPath.replace('/media/', ''));
    if (decoded.includes('..')) {
      sendJson(res, 400, { success: false, error: 'Invalid path' });
      return true;
    }
    const base = path.basename(decoded);
    if (!base || base !== decoded.replace(/\\/g, '/').split('/').pop()) {
      sendJson(res, 400, { success: false, error: 'Invalid path' });
      return true;
    }
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const filePath = path.resolve(uploadsRoot, base);
    if (!filePath.startsWith(uploadsRoot + path.sep) && filePath !== uploadsRoot) {
      sendJson(res, 400, { success: false, error: 'Invalid path' });
      return true;
    }
    try {
      const file = await fs.readFile(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', base.endsWith('.png') ? 'image/png' : base.endsWith('.webp') ? 'image/webp' : base.endsWith('.gif') ? 'image/gif' : 'image/jpeg');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(file);
    } catch {
      sendJson(res, 404, { success: false, error: 'File not found' });
    }
    return true;
  }

  if (method === 'GET' && apiPath === '/admin/products') {
    if (!ensureRole('manager')) return true;
    const limitRaw = Number(search.get('limit') || 100);
    const offsetRaw = Number(search.get('offset') || 0);
    const q = String(search.get('q') || '').trim();
    const status = String(search.get('status') || '').trim();
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
    const params = [];
    let where = 'deleted_at IS NULL';
    if (q) {
      params.push(`%${q}%`);
      where += ` AND (title ILIKE $${params.length} OR slug ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    params.push(limit);
    params.push(offset);
    const result = await pool.query(
      `SELECT * FROM cms_products WHERE ${where} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    sendJson(res, 200, { success: true, products: result.rows.map(mapCmsProductRow) });
    return true;
  }

  if (method === 'POST' && apiPath === '/admin/products') {
    if (!ensureRole('editor')) return true;
    const body = await readBody(req);
    const id = body.id || randomUUID();
    const slug = slugify(body.slug || body.title);
    const result = await pool.query(
      `INSERT INTO cms_products (id, slug, title, description, content, price, image, category, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        id,
        slug,
        String(body.title || ''),
        String(body.description || ''),
        JSON.stringify(body.content || {}),
        Number(body.price || 0),
        String(body.image || ''),
        String(body.category || ''),
        String(body.status || 'draft'),
        body.status === 'published' ? new Date().toISOString() : null,
      ],
    );
    await writeAudit(pool, auditSession, 'create', 'product', id, body);
    sendJson(res, 201, { success: true, product: mapCmsProductRow(result.rows[0]) });
    return true;
  }

  if (method === 'PUT' && apiPath.startsWith('/admin/products/')) {
    if (!ensureRole('editor')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/products/', ''));
    const body = await readBody(req);
    const existing = await pool.query('SELECT * FROM cms_products WHERE id = $1 LIMIT 1', [id]);
    if (!existing.rows.length) {
      sendJson(res, 404, { success: false, error: 'Product not found' });
      return true;
    }
    const cur = existing.rows[0];
    const nextStatus = String(body.status || cur.status);
    const result = await pool.query(
      `UPDATE cms_products
       SET slug=$2, title=$3, description=$4, content=$5, price=$6, image=$7, category=$8, status=$9,
           published_at = CASE WHEN $9 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
           updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [
        id,
        slugify(body.slug || body.title || cur.slug),
        body.title ?? cur.title,
        body.description ?? cur.description,
        JSON.stringify(body.content ?? cur.content ?? {}),
        Number(body.price ?? cur.price ?? 0),
        body.image ?? cur.image,
        body.category ?? cur.category,
        nextStatus,
      ],
    );
    await writeAudit(pool, auditSession, 'update', 'product', id, body);
    sendJson(res, 200, { success: true, product: mapCmsProductRow(result.rows[0]) });
    return true;
  }

  if (method === 'POST' && apiPath.startsWith('/admin/products/') && apiPath.endsWith('/publish')) {
    if (!ensureRole('editor')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/products/', '').replace('/publish', ''));
    const result = await pool.query(
      `UPDATE cms_products SET status='published', published_at=COALESCE(published_at, NOW()), updated_at=NOW()
       WHERE id=$1 AND deleted_at IS NULL RETURNING *`,
      [id],
    );
    if (!result.rows.length) {
      sendJson(res, 404, { success: false, error: 'Product not found' });
      return true;
    }
    await writeAudit(pool, auditSession, 'publish', 'product', id, {});
    sendJson(res, 200, { success: true, product: mapCmsProductRow(result.rows[0]) });
    return true;
  }

  if (method === 'DELETE' && apiPath.startsWith('/admin/products/')) {
    if (!ensureRole('owner')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/products/', ''));
    await pool.query(`UPDATE cms_products SET deleted_at = NOW(), updated_at = NOW(), status='archived' WHERE id=$1`, [id]);
    await writeAudit(pool, auditSession, 'delete', 'product', id, {});
    sendJson(res, 200, { success: true });
    return true;
  }

  if (method === 'GET' && apiPath === '/admin/blog') {
    if (!ensureRole('manager')) return true;
    const limitRaw = Number(search.get('limit') || 100);
    const offsetRaw = Number(search.get('offset') || 0);
    const q = String(search.get('q') || '').trim();
    const status = String(search.get('status') || '').trim();
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
    const params = [];
    let where = 'deleted_at IS NULL';
    if (q) {
      params.push(`%${q}%`);
      where += ` AND (title ILIKE $${params.length} OR slug ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    params.push(limit);
    params.push(offset);
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE ${where} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    sendJson(res, 200, { success: true, posts: result.rows.map(mapBlogRow) });
    return true;
  }

  if (method === 'POST' && apiPath === '/admin/blog') {
    if (!ensureRole('editor')) return true;
    const body = await readBody(req);
    const id = body.id || randomUUID();
    const slug = slugify(body.slug || body.title);
    const result = await pool.query(
      `INSERT INTO blog_posts (id, slug, title, description, content, image, tag, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        id,
        slug,
        String(body.title || ''),
        String(body.description || ''),
        JSON.stringify(body.content || {}),
        String(body.image || ''),
        JSON.stringify(body.tag || {}),
        String(body.status || 'draft'),
        body.status === 'published' ? new Date().toISOString() : null,
      ],
    );
    await writeAudit(pool, auditSession, 'create', 'blog_post', id, body);
    sendJson(res, 201, { success: true, post: mapBlogRow(result.rows[0]) });
    return true;
  }

  if (method === 'PUT' && apiPath.startsWith('/admin/blog/')) {
    if (!ensureRole('editor')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/blog/', ''));
    const body = await readBody(req);
    const existing = await pool.query('SELECT * FROM blog_posts WHERE id = $1 LIMIT 1', [id]);
    if (!existing.rows.length) {
      sendJson(res, 404, { success: false, error: 'Post not found' });
      return true;
    }
    const cur = existing.rows[0];
    const nextStatus = String(body.status || cur.status);
    const result = await pool.query(
      `UPDATE blog_posts
       SET slug=$2, title=$3, description=$4, content=$5, image=$6, tag=$7, status=$8,
           published_at = CASE WHEN $8 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
           updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [
        id,
        slugify(body.slug || body.title || cur.slug),
        body.title ?? cur.title,
        body.description ?? cur.description,
        JSON.stringify(body.content ?? cur.content ?? {}),
        body.image ?? cur.image,
        JSON.stringify(body.tag ?? cur.tag ?? {}),
        nextStatus,
      ],
    );
    await writeAudit(pool, auditSession, 'update', 'blog_post', id, body);
    sendJson(res, 200, { success: true, post: mapBlogRow(result.rows[0]) });
    return true;
  }

  if (method === 'POST' && apiPath.startsWith('/admin/blog/') && apiPath.endsWith('/publish')) {
    if (!ensureRole('editor')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/blog/', '').replace('/publish', ''));
    const result = await pool.query(
      `UPDATE blog_posts SET status='published', published_at=COALESCE(published_at, NOW()), updated_at=NOW()
       WHERE id=$1 AND deleted_at IS NULL RETURNING *`,
      [id],
    );
    if (!result.rows.length) {
      sendJson(res, 404, { success: false, error: 'Post not found' });
      return true;
    }
    await writeAudit(pool, auditSession, 'publish', 'blog_post', id, {});
    sendJson(res, 200, { success: true, post: mapBlogRow(result.rows[0]) });
    return true;
  }

  if (method === 'DELETE' && apiPath.startsWith('/admin/blog/')) {
    if (!ensureRole('owner')) return true;
    const id = decodeURIComponent(apiPath.replace('/admin/blog/', ''));
    await pool.query(`UPDATE blog_posts SET deleted_at = NOW(), updated_at = NOW(), status='archived' WHERE id=$1`, [id]);
    await writeAudit(pool, auditSession, 'delete', 'blog_post', id, {});
    sendJson(res, 200, { success: true });
    return true;
  }

  return false;
}
