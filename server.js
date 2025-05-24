const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA_FILE = '/data/state.json'; // später auf Persistent Disk mounten

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/state', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

app.post('/state', (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body), err => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
