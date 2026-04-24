const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/', (req, res) => {
  const cart = db.getCart(req.session.id);
  if (!cart.items.length) return res.redirect('/cart');
  const total = db.getCartTotal(req.session.id);
  res.render('checkout', { title: 'Checkout – Belle Noor', cart, total, error: null });
});

router.post('/', (req, res) => {
  const { name, email, phone, address, city, state, pincode, payment } = req.body;
  if (!name || !email || !phone || !address || !city || !pincode) {
    const cart = db.getCart(req.session.id);
    const total = db.getCartTotal(req.session.id);
    return res.render('checkout', { title: 'Checkout – Belle Noor', cart, total, error: 'Please fill in all required fields.' });
  }
  const order = db.createOrder(req.session.id, { name, email, phone, address, city, state, pincode, payment });
  res.render('order-success', { title: 'Order Confirmed – Belle Noor', order });
});

module.exports = router;
