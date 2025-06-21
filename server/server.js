const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde /public
app.use(express.static('public'));

// Rutas específicas para cada blog
app.get('/blogA', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/blogA.html'));
});

app.get('/blogB', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/blogB.html'));
});

app.get('/blogC', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/blogC.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});