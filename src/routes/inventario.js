const express = require("express");
const router = express.Router();
const { obtenerMovimientos, ajustarStock, resumenStock } = require("../controllers/inventarioController");

router.get("/", obtenerMovimientos);
router.get("/resumen", resumenStock);
router.post("/ajuste", ajustarStock);

module.exports = router;
