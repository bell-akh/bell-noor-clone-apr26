const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/', (req, res) => {
  const newArrivals = db.getProductsByCollection('new-arrivals').slice(0, 8);
  const womenTops   = db.getProductsByCollection('women-tops').slice(0, 4);
  const kurtis      = db.getProductsByCollection('kurti').slice(0, 4);
  const festive     = db.getProductsByCollection('festive').slice(0, 4);
  res.render('home', { title: 'Belle Noor – Timeless Fashion for Her', newArrivals, womenTops, kurtis, festive });
});

module.exports = router;
