const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const Knex      = require('knex');                 // ← add here
const knexfile  = require('./knexfile.js');        // ← add here
const ENV       = process.env.NODE_ENV || 'development'; // ← add here
const knex      = Knex(knexfile[ENV]);             // ← add here
const app = express();
let hsTree = [];

// Load HS codes on startup
fs.createReadStream(path.join(__dirname, 'hscodes.csv'))
  .pipe(csv())
  .on('data', row => {
    const { chapter, heading, hscode, description } = row;
    const code = hscode;
    let ch = hsTree.find(c => c.chapter === chapter);
    if (!ch) {
      ch = { chapter, title: '', headings: [] };
      hsTree.push(ch);
    }
    let hd = ch.headings.find(h => h.heading === heading);
    if (!hd) {
      hd = { heading, title: '', codes: [] };
      ch.headings.push(hd);
    }
    hd.codes.push({ code, desc: description });
  })
  .on('end', () => console.log('HS codes loaded'));

// Serve HS codes
app.get('/api/hs-codes', (req, res) => {
  res.json(hsTree);
});

// Serve static files from root (index.html at root)
app.use(express.static(__dirname));

// /profiles?country=HU&product=grapes&page=1&limit=25
app.get('/profiles', async (req, res) => {
  const {
    country,
    product,
    page = 1,
    limit = 25
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = knex('companies as c')
      .leftJoin('products as p', 'p.company_id', 'c.id')
      .select(
        'c.id',
        'c.name',
        'c.hq_country',
        knex.raw('json_agg(DISTINCT p.product_name) as products')
      )
      .groupBy('c.id')
      .limit(limit)
      .offset(offset);

    if (country) query.whereILike('c.hq_country', `%${country}%`);
    if (product) query.whereILike('p.product_name', `%${product}%`);

    const rows = await query;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Fallback route to serve index.html for non-API paths
app.use((req, res, next) => {
  // If the request is not for an API endpoint and not for a static file, serve index.html
  if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
