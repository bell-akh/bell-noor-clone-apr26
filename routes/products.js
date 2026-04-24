const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/:handle', (req, res) => {
  const product = db.getProductByHandle(req.params.handle);
  if (!product) return res.redirect('/collections/all');
  const related = db.products
    .filter(p => p.id !== product.id && p.collection.some(c => product.collection.includes(c)))
    .slice(0, 4);
  res.render('product', { title: `${product.title} – Belle Noor`, product, related });
});

module.exports = router;
