const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Modelo de suscriptor
const suscriptorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fechaSuscripcion: { type: Date, default: Date.now }
});
const Suscriptor = mongoose.model('Suscriptor', suscriptorSchema);

// POST - Suscribirse al newsletter
router.post('/suscribir', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const existe = await Suscriptor.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Este email ya está suscripto' });

    const suscriptor = new Suscriptor({ email });
    await suscriptor.save();
    res.status(201).json({ mensaje: '¡Suscripción exitosa!' });
  } catch (err) {
    res.status(500).json({ error: 'Error al suscribirse' });
  }
});

// GET - Obtener todos los suscriptores (solo admin)
router.get('/lista', async (req, res) => {
  try {
    const { adminPassword } = req.query;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const suscriptores = await Suscriptor.find().sort({ fechaSuscripcion: -1 });
    res.json(suscriptores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

module.exports = { router, Suscriptor };