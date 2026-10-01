const express = require("express");
const { validarParametroId } = require("../middleware/validacao");
const { consultarClima } = require("../controllers/climaController");

const router = express.Router();
router.param("id", validarParametroId);
router.get("/clima/propriedades/:id", consultarClima);

module.exports = router;
