const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Der Mount-Pfad für deine Persistent Disk
// In den Render-Settings unter Advanced → Disks als Mount-Pfad /data einrichten
const DATA_DIR = '/data';
const DATA_FILE = path.join(DATA_DIR, 'state.json');

// JSON-Bodyparser
app.use(express.json());

// Static-Middleware: liefert alle Dateien aus /public (index.html usw.)
app.use(express.static(path.join(__dirname, 'public')));

// GET /state → gibt den aktuellen Zustand zurück
app.get('/state', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      // Datei existiert noch nicht oder Fehler → leeres Array zurückgeben
      return res.json([]);
    }
    try {
      return res.json(JSON.parse(data));
    } catch {
      return res.json([]);
    }
  });
});

// POST /state → speichert neuen Zustand
app.post('/state', (req, res) => {
  // Verzeichnis anlegen, falls nicht da
  fs.mkdir(DATA_DIR, { recursive: true }, (mkErr) => {
    if (mkErr) return res.status(500).send(mkErr);

    fs.writeFile(DATA_FILE, JSON.stringify(req.body), (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    });
  });
});

// Port aus Umgebungsvariable (Render setzt PORT automatisch)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
