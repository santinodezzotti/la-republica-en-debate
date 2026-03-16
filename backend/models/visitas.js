const mongoose = require('mongoose');

const visitaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  pagina: { type: String, default: '/' }
});

module.exports = mongoose.model('Visita', visitaSchema);