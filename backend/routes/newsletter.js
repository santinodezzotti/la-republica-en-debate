const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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

// POST - Enviar newsletter a todos los suscriptores
router.post('/enviar', async (req, res) => {
  try {
    const { adminPassword, titulo, resumen, url } = req.body;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const suscriptores = await Suscriptor.find();
    if (suscriptores.length === 0) {
      return res.status(400).json({ error: 'No hay suscriptores' });
    }

    const emails = suscriptores.map(s => s.email);

    await resend.emails.send({
      from: 'La República en Debate <onboarding@resend.dev>',
      to: emails,
      subject: `Nuevo artículo: ${titulo}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a3a5c, #74ACDF); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.8rem;">La República en Debate</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Nuevo artículo publicado</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #1a3a5c;">${titulo}</h2>
            <p style="color: #555; line-height: 1.8;">${resumen}</p>
            <a href="${url}" style="display:inline-block; margin-top:20px; padding: 12px 25px; background: #1a3a5c; color: white; text-decoration: none; border-radius: 4px;">
              Leer artículo completo
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 0.8rem;">
            <p>© 2026 La República en Debate</p>
          </div>
        </div>
      `
    });

    res.json({ mensaje: `Newsletter enviado a ${emails.length} suscriptores` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el newsletter' });
  }
});

module.exports = { router, Suscriptor };