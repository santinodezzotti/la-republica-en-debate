const express = require('express');
const router = express.Router();
const Articulo = require('../models/Articulo');

// GET - Obtener todos los artículos publicados
router.get('/', async (req, res) => {
  try {
    const articulos = await Articulo.find({ publicado: true })
      .sort({ fechaCreacion: -1 });
    res.json(articulos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
});

// GET - Obtener un artículo por ID
router.get('/:id', async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el artículo' });
  }
});

// POST - Crear artículo (solo admin)
router.post('/', async (req, res) => {
  try {
    const { adminPassword, ...datos } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const articulo = new Articulo(datos);
    await articulo.save();
    res.status(201).json(articulo);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el artículo' });
  }
});

// PUT - Actualizar artículo (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const { adminPassword, ...datos } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const articulo = await Articulo.findByIdAndUpdate(req.params.id, datos, { new: true });
    res.json(articulo);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el artículo' });
  }
});

// DELETE - Eliminar artículo (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const { adminPassword } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    await Articulo.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Artículo eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
});

module.exports = router;