const express = require('express');
const router = express.Router();
const Articulo = require('../models/Articulo');
const Visita = require('../models/Visita');
const mongoose = require('mongoose');

// Aseguramos que el modelo Suscriptor esté disponible
let Suscriptor;
try {
  Suscriptor = mongoose.model('Suscriptor');
} catch (e) {
  const suscriptorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fechaSuscripcion: { type: Date, default: Date.now }
  });
  Suscriptor = mongoose.model('Suscriptor', suscriptorSchema);
}

// POST - Registrar visita
router.post('/visita', async (req, res) => {
  try {
    const { pagina } = req.body;
    const visita = new Visita({ pagina });
    await visita.save();
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar visita' });
  }
});

// GET - Obtener estadísticas (solo admin)
router.get('/', async (req, res) => {
  try {
    const { adminPassword } = req.query;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const totalArticulos = await Articulo.countDocuments({ publicado: true });
    const totalSuscriptores = await Suscriptor.countDocuments();
    const totalVisitas = await Visita.countDocuments();

    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    const visitasSemana = await Visita.countDocuments({ fecha: { $gte: hace7dias } });

    const masLeidos = await Articulo.find({ publicado: true })
      .sort({ vistas: -1 })
      .limit(5)
      .select('titulo vistas autor fechaCreacion');

    const porCategoria = await Articulo.aggregate([
      { $match: { publicado: true } },
      { $group: { _id: '$categoria', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } }
    ]);

    res.json({
      totalArticulos,
      totalSuscriptores,
      totalVisitas,
      visitasSemana,
      masLeidos,
      porCategoria
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;