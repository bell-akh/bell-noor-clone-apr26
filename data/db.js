// ============================================================
// Belle Noor — In-Memory Database
// Seed data is defined below. If data/products.json or
// data/collections.json exist on disk (produced by the admin
// Shopify sync) they are loaded over the seed at boot, and the
// setProducts / setCollections helpers splice-replace the arrays
// in place so already-required route modules always see the
// latest data without a restart.
// ============================================================
const fs = require('fs');
const path = require('path');
const { randomUUID: uuidv4 } = require('crypto');

const DATA_DIR            = __dirname;
const PRODUCTS_FILE       = path.join(DATA_DIR, 'products.json');
const COLLECTIONS_FILE    = path.join(DATA_DIR, 'collections.json');
const SETTINGS_FILE       = path.join(DATA_DIR, 'settings.json');

// ── Products ─────────────────────────────────────────────────
const products = [
  // New Arrivals
  {
    id: 'ladies-nightwear-shorts',
    handle: 'ladies-nightwear-shorts',
    title: 'Ladies Nightwear Shorts',
    price: 27022,          // paise
    comparePrice: null,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
    ],
    collection: ['new-arrivals', 'women-bottoms'],
    vendor: 'Belle Noor',
    type: 'Nightwear',
    tags: ['women', 'nightwear', 'shorts'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Comfortable ladies nightwear shorts crafted from premium breathable fabric. Perfect for lounging and a good night\'s sleep.',
    details: ['100% premium cotton fabric', 'Elastic waistband', 'Available in S, M, L, XL', 'Easy to care for'],
  },
  {
    id: 'noir-contrast-co-ord-set',
    handle: 'noir-contrast-co-ord-set',
    title: 'Noir Contrast Co-Ord Set',
    price: 179900,
    comparePrice: 349900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-3_fcaa1e62-25ca-4619-a3f9-8869a0a7c8aa.png?v=1765598266',
    ],
    collection: ['new-arrivals', 'dresses', 'women'],
    vendor: 'Belle Noor',
    type: 'Dress',
    tags: ['women', 'co-ord', 'dress', 'casual'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Redefine modern elegance with this black and white co-ord set designed for effortless sophistication. The sleeveless crop top features a clean V-neck silhouette, paired with high-waisted wide-leg trousers accentuated by a contrast wrap belt detail.',
    details: ['Color: Black with white contrast detailing', 'Set Includes: Sleeveless crop top + wide-leg trousers', 'Neckline: V-neck', 'Waist: High-rise with contrast belt detail', 'Fit: Structured top, relaxed wide-leg bottom', 'Closure: Back zip (top)', 'Occasion: Smart casual, brunch, office-to-evening'],
  },
  {
    id: 'royal-azure-allure-dress',
    handle: 'royal-azure-allure-dress',
    title: 'Royal Azure Allure Dress',
    price: 49900,
    comparePrice: 99900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['new-arrivals', 'dresses', 'women'],
    vendor: 'Belle Noor',
    type: 'Dress',
    tags: ['women', 'dress', 'royal', 'azure'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Step into royalty with the Royal Azure Allure Dress. This stunning piece combines rich azure tones with an alluring silhouette for a look that commands attention.',
    details: ['Premium quality fabric', 'Flattering A-line silhouette', 'Back zip closure', 'Occasion: Festive, formal, evening'],
  },
  {
    id: 'midnight-allure-dress',
    handle: 'midnight-allure-dress',
    title: 'Midnight Allure Dress',
    price: 49900,
    comparePrice: 99900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
    ],
    collection: ['new-arrivals', 'dresses', 'women'],
    vendor: 'Belle Noor',
    type: 'Dress',
    tags: ['women', 'dress', 'midnight', 'allure'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'The Midnight Allure Dress is the perfect blend of mystery and elegance. Deep tones and a sleek silhouette make it ideal for evening events and special occasions.',
    details: ['Premium midnight fabric', 'Elegant drape', 'Available in S, M, L, XL', 'Occasion: Evening, formal, parties'],
  },
  {
    id: 'blue-crush-silk-lehenga',
    handle: 'blue-crush-silk-lehenga',
    title: 'Blue Crush Silk Lehenga with Heavy Border Work Party Collection',
    price: 389282,
    comparePrice: null,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['new-arrivals', 'lehengas', 'women', 'festive'],
    vendor: 'Belle Noor',
    type: 'Lehenga',
    tags: ['women', 'lehenga', 'ethnic', 'party', 'festive'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Make a grand entrance in this Blue Crush Silk Lehenga featuring heavy border work. The luxurious silk fabric and intricate detailing make it perfect for parties and festive celebrations.',
    details: ['Pure silk fabric', 'Heavy border embroidery', 'Includes: Lehenga, blouse, and dupatta', 'Occasion: Parties, festivals, weddings'],
  },
  {
    id: 'solid-green-kurti-pant-set',
    handle: 'solid-green-kurti-pant-set',
    title: 'Solid Green Heavy Sequence Embroidered Kurti Pant Set with Dupatta',
    price: 249900,
    comparePrice: 429900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['new-arrivals', 'kurti', 'women', 'ethnic-essentials', 'festive'],
    vendor: 'Belle Noor',
    type: 'Kurti Set',
    tags: ['women', 'kurti', 'ethnic', 'embroidered'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    description: 'Dazzle in this Solid Green Kurti Pant Set adorned with heavy sequence embroidery. The rich green hue and intricate work make it a showstopper for festive events.',
    details: ['Heavy sequence embroidery', 'Includes: Kurti, pant, and dupatta', 'Rich green color', 'Occasion: Festivals, functions, weddings'],
  },
  {
    id: 'rogue-rider-leather-jacket',
    handle: 'rogue-rider-leather-jacket',
    title: 'Rogue Rider – Leather Jacket for Adventurous Women',
    price: 149900,
    comparePrice: 349900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
    ],
    collection: ['new-arrivals', 'women'],
    vendor: 'Belle Noor',
    type: 'Jacket',
    tags: ['women', 'jacket', 'leather', 'casual'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'For the bold and adventurous woman — the Rogue Rider Leather Jacket is crafted to empower your spirit. Premium faux leather with edgy detailing for the modern rebel.',
    details: ['Premium faux leather', 'Edgy moto-style stitching', 'Front zip closure', 'Occasion: Casual, travel, street style'],
  },
  {
    id: 'red-viscose-velvet-top-pant-set',
    handle: 'red-viscose-velvet-top-pant-set',
    title: 'Red Viscose Velvet Top Pant Set with Sequence Gold Floral Embroidery',
    price: 249900,
    comparePrice: 499900,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-3_fcaa1e62-25ca-4619-a3f9-8869a0a7c8aa.png?v=1765598266',
    ],
    collection: ['new-arrivals', 'kurti', 'women', 'ethnic-essentials', 'festive'],
    vendor: 'Belle Noor',
    type: 'Set',
    tags: ['women', 'velvet', 'ethnic', 'festive'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Luxurious red viscose velvet top and pant set with stunning gold floral sequence embroidery. A perfect ensemble for festive occasions and evening events.',
    details: ['Viscose velvet fabric', 'Gold sequence floral embroidery', 'Includes: Top and pant', 'Occasion: Festivals, evening, parties'],
  },
  // Women Tops
  {
    id: 'womens-pleated-crop-shirt',
    handle: 'womens-pleated-crop-shirt',
    title: "Women's Pleated Crop Shirt with Collar, Khaki, Short Sleeve",
    price: 39900,
    comparePrice: null,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
    ],
    collection: ['women-tops', 'women'],
    vendor: 'Belle Noor',
    type: 'Top',
    tags: ['women', 'top', 'crop', 'shirt', 'casual'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    description: "A chic khaki pleated crop shirt with a classic collar and short sleeves. Pairs beautifully with high-waist skinny jeans for a smart casual look.",
    details: ['Khaki color', 'Pleated front detailing', 'Classic collar', 'Short sleeve'],
  },
  {
    id: 'elegant-printed-top',
    handle: 'elegant-printed-top',
    title: 'Elegant Printed Top with Button Closure',
    price: 58882,
    comparePrice: 117882,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['women-tops', 'kurti', 'women', 'festive'],
    vendor: 'Belle Noor',
    type: 'Top',
    tags: ['women', 'top', 'printed', 'casual', 'kurti'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Elevate your everyday look with this elegant printed top featuring a stylish button closure. Versatile enough for both casual outings and semi-formal occasions.',
    details: ['Vibrant print design', 'Button closure front', 'Flowy silhouette', 'Occasion: Casual, semi-formal'],
  },
  {
    id: 'chic-floral-crop-top-pants',
    handle: 'chic-floral-crop-top-pants',
    title: 'Chic Floral Crop Top and Pants Set',
    price: 106082,
    comparePrice: 212282,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-3_fcaa1e62-25ca-4619-a3f9-8869a0a7c8aa.png?v=1765598266',
    ],
    collection: ['women-tops', 'women', 'festive'],
    vendor: 'Belle Noor',
    type: 'Set',
    tags: ['women', 'floral', 'crop', 'set', 'casual'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'A stunning floral co-ord set featuring a chic crop top paired with matching wide-leg pants. Perfect for brunch, vacations, and everything in between.',
    details: ['Floral print throughout', 'Crop top + matching pants', 'Lightweight fabric', 'Occasion: Brunch, vacation, casual outings'],
  },
  {
    id: 'elegant-blue-floral-tunic-set',
    handle: 'elegant-blue-floral-tunic-set',
    title: 'Elegant Blue Floral Print Tunic Set',
    price: 100182,
    comparePrice: 200482,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['women-tops', 'women'],
    vendor: 'Belle Noor',
    type: 'Set',
    tags: ['women', 'tunic', 'floral', 'blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Embrace graceful charm with this elegant blue floral tunic set. The delicate print and relaxed silhouette offer comfort and style for all-day wear.',
    details: ['Blue floral print', 'Tunic-length top', 'Coordinated bottoms included', 'Occasion: Casual, office, outings'],
  },
  // Kurti collection
  {
    id: 'royal-blue-velvet-top-pant',
    handle: 'royal-blue-velvet-top-pant',
    title: 'Royal Blue Viscose Velvet Top and Pant Set',
    price: 265382,
    comparePrice: null,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-2_1.jpg?v=1765598265',
    ],
    collection: ['kurti', 'women', 'ethnic-essentials'],
    vendor: 'Belle Noor',
    type: 'Set',
    tags: ['women', 'velvet', 'ethnic', 'kurti'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    description: 'Make a regal statement in this Royal Blue Viscose Velvet Top and Pant Set. The deep royal blue hue and velvet texture exude luxury and sophistication.',
    details: ['Viscose velvet material', 'Royal blue color', 'Includes: Top and pant set', 'Occasion: Festive, evening events'],
  },
  {
    id: 'elegant-blue-printed-salwar',
    handle: 'elegant-blue-printed-salwar',
    title: 'Elegant Blue Printed Salwar Kameez Set',
    price: 141482,
    comparePrice: 283082,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/virtual-photoshoot-3_fcaa1e62-25ca-4619-a3f9-8869a0a7c8aa.png?v=1765598266',
    ],
    collection: ['kurti', 'women', 'ethnic-essentials', 'festive'],
    vendor: 'Belle Noor',
    type: 'Salwar Kameez',
    tags: ['women', 'salwar', 'ethnic', 'traditional'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    description: 'An elegant blue printed salwar kameez set that embodies traditional craftsmanship with a modern touch. The gorgeous print and comfortable silhouette make it a wardrobe staple.',
    details: ['Blue printed fabric', 'Includes: Kameez, salwar, and dupatta', 'Traditional ethnic wear', 'Occasion: Festivals, functions, daily wear'],
  },
  {
    id: 'womens-beige-straight-kurta',
    handle: 'womens-beige-straight-kurta',
    title: "Women's Beige Printed Straight Kurta",
    price: 117882,
    comparePrice: 235882,
    images: [
      'https://www.belle-noor.in/cdn/shop/files/WhatsApp_Image_2025-03-22_at_19.14.43_b1e5b0dd.jpg?v=1742649332',
    ],
    collection: ['kurti', 'women', 'festive'],
    vendor: 'Belle Noor',
    type: 'Kurta',
    tags: ['women', 'kurta', 'beige', 'casual'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    description: "A versatile beige straight kurta with a delicate printed pattern. The classic straight cut and neutral beige tone make it an everyday ethnic wardrobe essential.",
    details: ['Beige printed fabric', 'Straight cut kurta', 'Comfortable daily wear', 'Occasion: Daily, casual, office'],
  },
];

// ── Collections ───────────────────────────────────────────────
const collections = [
  { id: 'all', handle: 'all', title: 'All Products', description: 'Shop our complete collection' },
  { id: 'new-arrivals', handle: 'new-arrivals', title: 'New Arrivals', description: 'The latest additions to our collection' },
  { id: 'women', handle: 'women', title: 'Women', description: "Women's clothing and fashion" },
  { id: 'women-tops', handle: 'women-tops', title: 'Women Tops', description: "Stylish tops for women" },
  { id: 'women-bottoms', handle: 'women-bottoms', title: 'Women Bottoms', description: "Bottoms and trousers for women" },
  { id: 'dresses', handle: 'dresses', title: 'Dresses', description: "Elegant dresses for every occasion" },
  { id: 'kurti', handle: 'kurti', title: 'Kurti', description: "Traditional and fusion kurtis" },
  { id: 'ethnic-essentials', handle: 'ethnic-essentials', title: 'Ethnic Essentials', description: "Traditional ethnic wear" },
  { id: 'lehengas', handle: 'lehengas', title: 'Lehengas', description: "Stunning lehengas for special occasions" },
  { id: 'festive', handle: 'festive', title: 'Festive Collection', description: "Celebrate in style" },
];

// ── In-Memory Carts (keyed by sessionId) ─────────────────────
const carts = {};

// ── In-Memory Orders ──────────────────────────────────────────
const orders = [];

// ── Helpers ───────────────────────────────────────────────────
function formatPrice(paise) {
  return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getProductsByCollection(collectionHandle) {
  if (collectionHandle === 'all') return products;
  return products.filter(p => p.collection.includes(collectionHandle));
}

function getProductByHandle(handle) {
  return products.find(p => p.handle === handle);
}

function getCart(sessionId) {
  if (!carts[sessionId]) carts[sessionId] = { items: [] };
  return carts[sessionId];
}

function addToCart(sessionId, productId, size, qty = 1) {
  const cart = getCart(sessionId);
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  const existing = cart.items.find(i => i.productId === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ id: uuidv4(), productId, size, qty, product });
  }
  return cart;
}

function updateCartItem(sessionId, itemId, qty) {
  const cart = getCart(sessionId);
  const item = cart.items.find(i => i.id === itemId);
  if (!item) return null;
  if (qty <= 0) {
    cart.items = cart.items.filter(i => i.id !== itemId);
  } else {
    item.qty = qty;
  }
  return cart;
}

function removeFromCart(sessionId, itemId) {
  const cart = getCart(sessionId);
  cart.items = cart.items.filter(i => i.id !== itemId);
  return cart;
}

function getCartTotal(sessionId) {
  const cart = getCart(sessionId);
  return cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

function getCartCount(sessionId) {
  const cart = getCart(sessionId);
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

function clearCart(sessionId) {
  carts[sessionId] = { items: [] };
}

function createOrder(sessionId, customerInfo) {
  const cart = getCart(sessionId);
  const order = {
    id: uuidv4(),
    orderNumber: `BN-${Date.now().toString().slice(-6)}`,
    customer: customerInfo,
    items: [...cart.items],
    total: getCartTotal(sessionId),
    status: 'confirmed',
    createdAt: new Date(),
  };
  orders.push(order);
  clearCart(sessionId);
  return order;
}

// ── Persistence helpers ───────────────────────────────────────
function _readJson(file) {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[db] failed to read ${file}:`, e.message);
    return null;
  }
}
function _writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`[db] failed to write ${file}:`, e.message);
    return false;
  }
}

// Replace the contents of the existing `products` array in place
// so references held by route modules stay valid.
function setProducts(newProducts) {
  if (!Array.isArray(newProducts)) return;
  products.splice(0, products.length, ...newProducts);
}
function setCollections(newCollections) {
  if (!Array.isArray(newCollections)) return;
  collections.splice(0, collections.length, ...newCollections);
}
function persistProducts()    { return _writeJson(PRODUCTS_FILE, products); }
function persistCollections() { return _writeJson(COLLECTIONS_FILE, collections); }

// ── Settings (Shopify creds, last sync, admin password hash) ──
function getSettings() {
  return _readJson(SETTINGS_FILE) || {};
}
function saveSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  _writeJson(SETTINGS_FILE, next);
  return next;
}

// ── Hydrate from disk on boot ─────────────────────────────────
(function hydrate() {
  const diskProducts = _readJson(PRODUCTS_FILE);
  if (Array.isArray(diskProducts) && diskProducts.length) {
    setProducts(diskProducts);
    console.log(`[db] hydrated ${diskProducts.length} products from products.json`);
  }
  const diskCollections = _readJson(COLLECTIONS_FILE);
  if (Array.isArray(diskCollections) && diskCollections.length) {
    setCollections(diskCollections);
    console.log(`[db] hydrated ${diskCollections.length} collections from collections.json`);
  }
})();

module.exports = {
  products,
  collections,
  formatPrice,
  getProductsByCollection,
  getProductByHandle,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCartTotal,
  getCartCount,
  clearCart,
  createOrder,
  // admin / sync helpers
  setProducts,
  setCollections,
  persistProducts,
  persistCollections,
  getSettings,
  saveSettings,
};
