const express = require("express");
const router = express.Router();
const { obtenerUsuarios, crearUsuario, actualizarUsuario } = require("../controllers/usuarioController");

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);

module.exports = router;
