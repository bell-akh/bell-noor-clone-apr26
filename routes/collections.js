const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/:handle', (req, res) => {
  const { handle } = req.params;
  const collection = db.collections.find(c => c.handle === handle);
  if (!collection) return res.redirect('/collections/all');
  const products = db.getProductsByCollection(handle);
  const sort = req.query.sort || 'featured';
  let sorted = [...products];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
  res.render('collection', { title: `${collection.title} – Belle Noor`, collection, products: sorted, sort });
});

module.exports = router;
