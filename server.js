const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

// ── View engine ───────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Disable EJS template caching in development so .ejs edits show up
// without restarting the server. Express caches views by default in
// production for performance.
app.set('view cache', !IS_DEV);

// ── Middleware ────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (css / js / images).
// In dev: no-cache so style.css + main.js edits always reload.
// In prod: cache for 7 days (we cache-bust via ?v=<assetVersion> query).
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  maxAge: IS_DEV ? 0 : '7d',
  setHeaders(res) {
    if (IS_DEV) res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  },
}));

app.use(session({
  secret: 'belle-noor-secret-2025',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ── HTML = never cached by the browser ───────────────────────
// Product / collection data lives in memory and can change at any
// moment. We want every page load to hit the server so updates to
// products reflect immediately — while static assets (images, css,
// js) are still cached normally below.
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ── Inject cart count + asset version into all views ─────────
const db = require('./data/db');

// Build a stable "asset version" from the mtime of style.css / main.js.
// This becomes `?v=<num>` on <link>/<script> tags, so browsers
// auto-fetch fresh assets whenever you save a CSS/JS file.
function computeAssetVersion() {
  const files = [
    path.join(__dirname, 'public', 'css', 'style.css'),
    path.join(__dirname, 'public', 'js', 'main.js'),
  ];
  let latest = 0;
  for (const f of files) {
    try { latest = Math.max(latest, fs.statSync(f).mtimeMs); } catch (_) {}
  }
  return Math.floor(latest) || Date.now();
}

// Refresh in dev every request; in prod compute once at boot.
let cachedAssetVersion = computeAssetVersion();
app.use((req, res, next) => {
  res.locals.assetVersion = IS_DEV ? computeAssetVersion() : cachedAssetVersion;
  res.locals.cartCount    = db.getCartCount(req.session.id);
  res.locals.formatPrice  = db.formatPrice;
  next();
});

// NOTE on picking up product edits:
// The products array in data/db.js is an in-memory singleton that
// route modules hold by reference. Editing db.js therefore requires
// the Node process to restart. `npm run dev` uses nodemon which does
// this automatically on every save — combined with the no-cache
// headers above, your product edits show up on the very next refresh.

// ── Routes ────────────────────────────────────────────────────
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/home'));
app.use('/collections', require('./routes/collections'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: '404 – Page Not Found' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌸 Belle Noor is live → http://localhost:${PORT}\n`);
});
