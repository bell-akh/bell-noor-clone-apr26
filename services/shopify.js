// ============================================================
// Belle Noor — Shopify sync client
// Uses the Admin REST API. Requires a custom-app Admin API access
// token with at least read_products and read_product_listings
// scopes (read_inventory helps for stock).
// ============================================================

const API_VERSION = '2024-07';

/* --------------------------------------------------------------
 * Low-level request helpers
 * ------------------------------------------------------------*/

function normaliseShop(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^https?:\/\//, '').replace(/\/$/, '');
  // if the user pastes "belle-noor" just append the suffix
  if (!s.includes('.')) s = `${s}.myshopify.com`;
  return s;
}

async function shopifyGet(shop, token, pathWithQuery) {
  const url = `https://${shop}/admin/api/${API_VERSION}/${pathWithQuery}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Shopify ${res.status}: ${res.statusText}${body ? ' — ' + body.slice(0, 240) : ''}`);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  // Pull next-page cursor from the Link header (cursor pagination)
  const link = res.headers.get('link') || res.headers.get('Link') || '';
  const nextMatch = link.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return { json, nextPageInfo: nextMatch ? nextMatch[1] : null };
}

async function paginate(shop, token, resource, params = {}) {
  const out = [];
  const baseQuery = new URLSearchParams({ limit: '250', ...params }).toString();
  let query = `${resource}.json?${baseQuery}`;
  // Shopify requires you to pass ONLY page_info + limit when cursoring
  let isFirst = true;
  while (true) {
    const { json, nextPageInfo } = await shopifyGet(shop, token, query);
    const items = json[resource] || json[Object.keys(json)[0]] || [];
    out.push(...items);
    if (!nextPageInfo) break;
    query = `${resource}.json?limit=250&page_info=${encodeURIComponent(nextPageInfo)}`;
    isFirst = false;
  }
  return out;
}

/* --------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------*/

async function testConnection(shopRaw, token) {
  const shop = normaliseShop(shopRaw);
  if (!shop || !token) throw new Error('Shop domain and access token are required');
  const { json } = await shopifyGet(shop, token, 'shop.json');
  return { shop, info: json.shop };
}

async function fetchProducts(shop, token) {
  return paginate(shop, token, 'products');
}
async function fetchCustomCollections(shop, token) {
  return paginate(shop, token, 'custom_collections');
}
async function fetchSmartCollections(shop, token) {
  return paginate(shop, token, 'smart_collections');
}
async function fetchCollects(shop, token) {
  return paginate(shop, token, 'collects');
}

/* --------------------------------------------------------------
 * Mappers: Shopify → Belle Noor internal schema
 * ------------------------------------------------------------*/

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBullets(html) {
  if (!html) return [];
  const out = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const txt = stripHtml(m[1]);
    if (txt) out.push(txt);
  }
  return out;
}

function priceToPaise(str) {
  if (str == null) return 0;
  const n = parseFloat(String(str));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function mapProduct(p) {
  const variants = Array.isArray(p.variants) ? p.variants : [];
  const firstVariant = variants[0] || {};
  const images = Array.isArray(p.images) ? p.images.map(i => i.src).filter(Boolean) : [];
  if (!images.length && p.image && p.image.src) images.push(p.image.src);

  // Locate the "Size" option (position-based) so we can extract sizes
  const options = Array.isArray(p.options) ? p.options : [];
  const sizeOpt = options.find(o => /size/i.test(o.name || ''));
  let sizes = [];
  if (sizeOpt) {
    const key = `option${sizeOpt.position}`;   // option1 / option2 / option3
    const set = new Set();
    for (const v of variants) if (v[key]) set.add(String(v[key]));
    sizes = [...set];
  }
  if (!sizes.length) sizes = ['S', 'M', 'L', 'XL'];

  // Stock: active + any variant with inventory_quantity > 0 (or no tracking)
  const inStock = p.status === 'active' && variants.some(v =>
    !v.inventory_management || (typeof v.inventory_quantity === 'number' ? v.inventory_quantity > 0 : true)
  );

  const tags = typeof p.tags === 'string'
    ? p.tags.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(p.tags) ? p.tags : []);

  const description = stripHtml(p.body_html);
  const details = extractBullets(p.body_html);

  return {
    id:            String(p.id),
    handle:        p.handle,
    title:         p.title,
    price:         priceToPaise(firstVariant.price),
    comparePrice:  firstVariant.compare_at_price ? priceToPaise(firstVariant.compare_at_price) : null,
    images,
    collection:    [],              // filled in by buildCollectionMap below
    vendor:        p.vendor || 'Belle Noor',
    type:          p.product_type || '',
    tags,
    sizes,
    inStock,
    description,
    details,
  };
}

function mapCollection(c) {
  return {
    id:           c.handle,
    handle:       c.handle,
    title:        c.title,
    description:  stripHtml(c.body_html),
    // keep the numeric Shopify id so we can map collects → our handle
    _shopifyId:   String(c.id),
  };
}

/* --------------------------------------------------------------
 * End-to-end sync: returns shaped products + collections
 * ------------------------------------------------------------*/

async function syncAll(shopRaw, token, { log = () => {} } = {}) {
  const shop = normaliseShop(shopRaw);
  if (!shop || !token) throw new Error('Shop domain and access token are required');

  log('Testing connection…');
  await shopifyGet(shop, token, 'shop.json');

  log('Fetching products…');
  const rawProducts = await fetchProducts(shop, token);
  log(`Fetched ${rawProducts.length} products`);

  log('Fetching custom collections…');
  const rawCustom = await fetchCustomCollections(shop, token);
  log('Fetching smart collections…');
  const rawSmart  = await fetchSmartCollections(shop, token);

  // Collects only map products → custom_collections. Smart collections
  // resolve via rules server-side, so we pull their products separately.
  log('Fetching collects (custom collection memberships)…');
  const collects = await fetchCollects(shop, token);

  const mappedCollections = [...rawCustom, ...rawSmart].map(mapCollection);
  const byShopifyId = new Map(mappedCollections.map(c => [c._shopifyId, c]));

  const productByShopifyId = new Map();
  const mappedProducts = rawProducts.map(p => {
    const m = mapProduct(p);
    productByShopifyId.set(String(p.id), m);
    return m;
  });

  // Apply collects → custom collections
  for (const c of collects) {
    const prod = productByShopifyId.get(String(c.product_id));
    const col  = byShopifyId.get(String(c.collection_id));
    if (prod && col && !prod.collection.includes(col.handle)) {
      prod.collection.push(col.handle);
    }
  }

  // Smart collections: fetch their products list directly
  for (const sc of rawSmart) {
    try {
      const { json } = await shopifyGet(shop, token, `collections/${sc.id}/products.json?limit=250`);
      const items = json.products || [];
      const col = byShopifyId.get(String(sc.id));
      if (!col) continue;
      for (const p of items) {
        const prod = productByShopifyId.get(String(p.id));
        if (prod && !prod.collection.includes(col.handle)) {
          prod.collection.push(col.handle);
        }
      }
    } catch (e) {
      log(`Smart collection ${sc.handle} failed: ${e.message}`);
    }
  }

  // Always include a synthetic "all" collection so the /collections/all
  // route keeps working regardless of what Shopify sends.
  const finalCollections = [
    { id: 'all', handle: 'all', title: 'All Products', description: 'Shop our complete collection' },
    ...mappedCollections.map(({ _shopifyId, ...c }) => c),
  ];

  // Make sure every product shows up under "all"
  for (const p of mappedProducts) {
    if (!p.collection.includes('all')) p.collection.push('all');
  }

  log(`Mapped ${mappedProducts.length} products across ${finalCollections.length} collections`);
  return { products: mappedProducts, collections: finalCollections, shop };
}

module.exports = {
  API_VERSION,
  normaliseShop,
  testConnection,
  syncAll,
  // exposed for unit-testing / debugging
  mapProduct,
  mapCollection,
};
