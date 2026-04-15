const { body, validationResult } = require('express-validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Crear instancia de DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Middleware de validación para comentarios
 * Reglas:
 * - texto: requerido, máximo 200 caracteres
 * - puntuacion: entero entre 1 y 5 (opcional)
 */
const validarComentario = [
  body('texto')
    .trim()
    .notEmpty()
    .withMessage('El texto es requerido')
    .isLength({ max: 200 })
    .withMessage('El texto no puede superar los 200 caracteres')
    .customSanitizer((value) => {
      // Sanitizar HTML/JS malicioso
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
    }),

  body('puntuacion')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La puntuación debe ser un entero entre 1 y 5'),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: errores.array()
      });
    }
    next();
  }
];

module.exports = { validarComentario };
