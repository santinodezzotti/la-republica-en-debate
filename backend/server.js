const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const articulosRouter = require('./routes/articulos');
const { router: newsletterRouter } = require('./routes/newsletter');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/api/articulos', articulosRouter);
app.use('/api/newsletter', newsletterRouter);

// Ruta de prueba
app.get('/api/ping', (req, res) => {
  res.json({ mensaje: '¡La República en Debate está en línea!' });
});

// Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err.message);
  });