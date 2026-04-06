const Usuario = require("../models/Usuario");

// GET /api/usuarios
const obtenerUsuarios = async (req, res) => {
  const { rol } = req.query;
  const filtro = { activo: true };
  if (rol) filtro.rol = rol;

  const usuarios = await Usuario.find(filtro).sort({ nombre: 1 });
  res.json({ ok: true, usuarios });
};

// POST /api/usuarios
const crearUsuario = async (req, res) => {
  const usuario = await Usuario.create(req.body);
  res.status(201).json({ ok: true, usuario });
};

// PUT /api/usuarios/:id
const actualizarUsuario = async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!usuario) {
    res.status(404);
    throw new Error("Usuario no encontrado");
  }
  res.json({ ok: true, usuario });
};

module.exports = { obtenerUsuarios, crearUsuario, actualizarUsuario };
