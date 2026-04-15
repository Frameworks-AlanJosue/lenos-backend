const express = require('express');
const UsuarioAuth = require('../models/UsuarioAuth');
const { createUsuario, loginUsuario, getUsuarioInfoById } = require('../services/usuarioService');

const router = express.Router();

/**
 * POST /api/v1/usuario/signup
 * Registrar un nuevo usuario
 */
router.post('/signup', async (req, res) => {
  try {
    const usuario = await createUsuario(req.body);
    return res.status(201).json({
      ok: true,
      username: usuario.username,
      message: 'Usuario creado exitosamente'
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: 'Falló al crear el usuario. ¿El usuario ya existe?',
      details: err.message
    });
  }
});

/**
 * POST /api/v1/usuario/login
 * Iniciar sesión y obtener token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const token = await loginUsuario(req.body);
    return res.status(200).json({
      ok: true,
      token
    });
  } catch (err) {
    return res.status(401).json({
      ok: false,
      error: 'Login Falló. ¿Ingresaste el Usuario/Contraseña correcta?'
    });
  }
});

/**
 * GET /api/v1/usuarios/:id
 * Obtener información de un usuario por ID
 */
router.get('/usuarios/:id', async (req, res) => {
  try {
    const userInfo = await getUsuarioInfoById(req.params.id);
    return res.status(200).json({
      ok: true,
      user: userInfo
    });
  } catch (err) {
    return res.status(404).json({
      ok: false,
      error: 'Usuario no encontrado'
    });
  }
});

/**
 * GET /api/v1/usuario/debug/:username
 * Verificar hash de contraseña (SOLO PARA PRUEBAS)
 * NOTA: Eliminar en producción
 */
router.get('/debug/:username', async (req, res) => {
  try {
    const usuario = await UsuarioAuth.findOne({ username: req.params.username });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      ok: true,
      verificacion: {
        username: usuario.username,
        password_hash: usuario.password,
        observacion: 'La contraseña NO está en texto plano, está hasheada con bcrypt',
        empieza_con: usuario.password.substring(0, 7) + '...'
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

module.exports = router;
