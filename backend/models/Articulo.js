const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  categoria: { type: String, default: 'General' },
  resumen: { type: String, required: true },
  contenido: { type: String, required: true },
  imagen: { type: String, default: '' },
  publicado: { type: Boolean, default: false },
  vistas: { type: Number, default: 0 },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Articulo', articuloSchema);