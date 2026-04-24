const express = require('express');
const router = express.Router();
const db = require('../data/db');
const shopify = require('../services/shopify');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bellenoor-admin';

// Last sync log kept in memory so the dashboard can show it.
const syncState = {
  inProgress: false,
  lastResult: null, // { ok, at, productCount, collectionCount, error, log:[] }
};

/* ── Auth middleware ───────────────────────────────────────── */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.xhr || req.headers.accept === 'application/json') {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return res.redirect('/admin/login');
}

/* ── Login / Logout ────────────────────────────────────────── */
router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', {
    title: 'Admin — Belle Noor',
    error: req.query.error || null,
    layout: false,
  });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  return res.redirect('/admin/login?error=invalid');
});

router.post('/logout', (req, res) => {
  if (req.session) req.session.isAdmin = false;
  res.redirect('/admin/login');
});

/* ── Dashboard ─────────────────────────────────────────────── */
router.get('/', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  res.render('admin/dashboard', {
    title: 'Admin Dashboard — Belle Noor',
    layout: false,
    settings: {
      shopDomain: settings.shopDomain || '',
      hasToken:   Boolean(settings.accessToken),
      tokenMask:  settings.accessToken ? maskToken(settings.accessToken) : '',
      lastSyncAt: settings.lastSyncAt || null,
    },
    stats: {
      productCount:    db.products.length,
      collectionCount: db.collections.length,
    },
    products: db.products.slice(0, 12),
    syncState,
  });
});

function maskToken(t) {
  if (!t) return '';
  if (t.length <= 8) return '••••';
  return `${t.slice(0, 4)}••••••••${t.slice(-4)}`;
}

/* ── Save Shopify credentials ─────────────────────────────── */
router.post('/credentials', requireAdmin, express.urlencoded({ extended: true }), (req, res) => {
  const shopDomain  = shopify.normaliseShop(req.body.shopDomain || '');
  const rawToken    = (req.body.accessToken || '').trim();
  const existing    = db.getSettings();
  const accessToken = rawToken || existing.accessToken || '';

  if (!shopDomain || !accessToken) {
    return res.status(400).json({ ok: false, error: 'Shop domain and access token are both required' });
  }
  db.saveSettings({ shopDomain, accessToken });
  return res.json({ ok: true, shopDomain, tokenMask: maskToken(accessToken) });
});

/* ── Test connection (doesn't mutate anything) ────────────── */
router.post('/test', requireAdmin, async (req, res) => {
  const settings = db.getSettings();
  const shopDomain  = shopify.normaliseShop(req.body.shopDomain || settings.shopDomain || '');
  const accessToken = (req.body.accessToken || settings.accessToken || '').trim();

  if (!shopDomain || !accessToken) {
    return res.status(400).json({ ok: false, error: 'Missing credentials' });
  }
  try {
    const { info } = await shopify.testConnection(shopDomain, accessToken);
    return res.json({
      ok: true,
      shop: {
        name: info.name,
        domain: info.domain,
        email: info.email,
        currency: info.currency,
        country: info.country_name,
      },
    });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});

/* ── Run full sync ────────────────────────────────────────── */
router.post('/sync', requireAdmin, async (req, res) => {
  if (syncState.inProgress) {
    return res.status(409).json({ ok: false, error: 'A sync is already running' });
  }
  const settings = db.getSettings();
  const shopDomain  = settings.shopDomain;
  const accessToken = settings.accessToken;

  if (!shopDomain || !accessToken) {
    return res.status(400).json({ ok: false, error: 'Save your Shopify credentials first' });
  }

  syncState.inProgress = true;
  const log = [];
  const push = (m) => { log.push(`[${new Date().toISOString()}] ${m}`); };
  push('Sync started');

  try {
    const result = await shopify.syncAll(shopDomain, accessToken, { log: push });

    // Hot-swap arrays in place so running routes immediately see new data
    db.setProducts(result.products);
    db.setCollections(result.collections);
    db.persistProducts();
    db.persistCollections();
    db.saveSettings({ lastSyncAt: new Date().toISOString() });

    push(`Applied ${result.products.length} products and ${result.collections.length} collections`);

    syncState.lastResult = {
      ok: true,
      at: new Date().toISOString(),
      productCount: result.products.length,
      collectionCount: result.collections.length,
      log,
    };
    return res.json(syncState.lastResult);
  } catch (err) {
    push(`ERROR: ${err.message}`);
    syncState.lastResult = {
      ok: false,
      at: new Date().toISOString(),
      error: err.message,
      log,
    };
    return res.status(500).json(syncState.lastResult);
  } finally {
    syncState.inProgress = false;
  }
});

/* ── Clear synced data (reverts to seed on next restart) ──── */
router.post('/reset', requireAdmin, (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    for (const f of ['products.json', 'collections.json']) {
      const p = path.join(__dirname, '..', 'data', f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    db.saveSettings({ lastSyncAt: null });
    return res.json({ ok: true, message: 'Cleared. Restart the server to see seed data again.' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
