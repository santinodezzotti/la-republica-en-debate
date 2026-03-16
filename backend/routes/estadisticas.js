const express = require('express');
const router = express.Router();
const Articulo = require('../models/Articulo');
const Visita = require('../models/visita');
const mongoose = require('mongoose');

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

    // Total de artículos
    const totalArticulos = await Articulo.countDocuments({ publicado: true });

    // Total de suscriptores
    const Suscriptor = mongoose.model('Suscriptor');
    const totalSuscriptores = await Suscriptor.countDocuments();

    // Total de visitas
    const totalVisitas = await Visita.countDocuments();

    // Visitas últimos 7 días
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    const visitasSemana = await Visita.countDocuments({ fecha: { $gte: hace7dias } });

    // Artículos más leídos
    const masLeidos = await Articulo.find({ publicado: true })
      .sort({ vistas: -1 })
      .limit(5)
      .select('titulo vistas autor fechaCreacion');

    // Artículos por categoría
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