const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/', (req, res) => {
  const cart = db.getCart(req.session.id);
  const total = db.getCartTotal(req.session.id);
  res.render('cart', { title: 'Your Cart – Belle Noor', cart, total });
});

router.post('/add', (req, res) => {
  const { productId, size, qty } = req.body;
  db.addToCart(req.session.id, productId, size, parseInt(qty) || 1);
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.json({ success: true, cartCount: db.getCartCount(req.session.id) });
  }
  res.redirect('/cart');
});

router.post('/update', (req, res) => {
  const { itemId, qty } = req.body;
  db.updateCartItem(req.session.id, itemId, parseInt(qty));
  res.redirect('/cart');
});

router.post('/remove', (req, res) => {
  const { itemId } = req.body;
  db.removeFromCart(req.session.id, itemId);
  res.redirect('/cart');
});

module.exports = router;
