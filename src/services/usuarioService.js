const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioAuth = require('../models/UsuarioAuth');

/**
 * Crear un nuevo usuario con contraseña hasheada
 * @param {Object} param0 - username y password
 * @returns {Promise<Object>} - Usuario creado
 */
async function createUsuario({ username, password }) {
  // Hashear la contraseña con bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario
  const usuario = new UsuarioAuth({
    username,
    password: hashedPassword
  });

  return await usuario.save();
}

/**
 * Autenticar usuario y generar JWT
 * @param {Object} param0 - username y password
 * @returns {Promise<String>} - Token JWT
 */
async function loginUsuario({ username, password }) {
  // Buscar usuario por username
  const usuario = await UsuarioAuth.findOne({ username });

  if (!usuario) {
    throw new Error('Nombre de Usuario Incorrecto!');
  }

  // Comparar contraseñas
  const isPasswordCorrect = await bcrypt.compare(password, usuario.password);

  if (!isPasswordCorrect) {
    throw new Error('Contraseña inválida!');
  }

  // Generar JWT
  const token = jwt.sign(
    { sub: usuario._id, username: usuario.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
}

/**
 * Obtener información del usuario por ID
 * @param {String} userId - ID del usuario
 * @returns {Promise<Object>} - Información del usuario
 */
async function getUsuarioInfoById(userId) {
  try {
    const usuario = await UsuarioAuth.findById(userId);

    if (!usuario) {
      return { username: userId };
    }

    return { username: usuario.username };
  } catch (err) {
    return { username: userId };
  }
}

/**
 * Verificar token JWT
 * @param {String} token - Token JWT
 * @returns {Object} - Payload decodificado
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  createUsuario,
  loginUsuario,
  getUsuarioInfoById,
  verifyToken
};
