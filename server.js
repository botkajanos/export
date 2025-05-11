const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const app = express();

let hsTree = [];

// Load HS codes on startup
fs.createReadStream(path.join(__dirname, 'hscodes.csv'))
  .pipe(csv())
  .on('data', row => {
    const { chapter, heading, code, description } = row;
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

// Fallback route to serve index.html for any other paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
