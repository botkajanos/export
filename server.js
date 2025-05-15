const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Knex = require('knex');
const knexfile = require('./knexfile.js');
const ENV = process.env.NODE_ENV || 'development';
const knex = Knex(knexfile[ENV]);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const profilesRoute = require('./routes/profiles');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use('/profiles', profilesRoute);

let hsTree = [];

// Load HS codes
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

app.get('/api/hs-codes', (req, res) => {
  res.json(hsTree);
});

// ✅ Submit profile (JSON only for now)
app.post('/submit-profile', async (req, res) => {
  try {
    const { name, hq_country, products } = req.body;
    console.log('[submit-profile] BODY:', req.body);

    const [companyId] = await knex('companies')
      .insert({ name, hq_country })
      .returning('id');

    for (const p of products) {
      await knex('products').insert({
        company_id: companyId.id || companyId,
        name: p.productName,
        certifications: p.certifications || ''
      });
    }console.log('Inserting product:', p.productName);


    res.json({ success: true, companyId });
  } catch (err) {
    console.error('[submit-profile error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Profiles query
app.get('/profiles', async (req, res) => {
  const { country, product, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = knex('companies as c')
      .leftJoin('products as p', 'p.company_id', 'c.id')
      .select(
        'c.id',
        'c.name',
        'c.hq_country as country',
        knex.raw('json_agg(DISTINCT p.name) as products') // 🔧 fixed column
      )
      .groupBy('c.id')
      .limit(limit)
      .offset(offset);

    if (country) query.whereILike('c.hq_country', `%${country}%`);
    if (product) query.whereILike('p.name', `%${product}%`); // 🔧 fixed column

    const rows = await query;
    res.json(rows);
  } catch (err) {
    console.error('[profiles error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Debug route
app.get('/debug-data', async (req, res) => {
  try {
    const companies = await knex('companies').select('*');
    const products = await knex('products').select('*');
    res.json({ companies, products });
  } catch (err) {
    console.error('[DEBUG ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ⚠️ File upload route — TODO: implement this later
// Keep this but rename it
app.post('/upload-files', upload.array('photos', 5), async (req, res) => {
  const files = req.files;
  console.log('[upload-files]', files);
  res.json({ uploaded: files.length });
});

// Fallback to index.html
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
