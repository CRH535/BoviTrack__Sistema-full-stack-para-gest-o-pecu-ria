const { converterId } = require("../utils/validacoes");

function validarParametroId(req, res, next, valor, nome) {
  const id = converterId(valor);
  if (!id) return res.status(400).json({ mensagem: `Parâmetro ${nome} inválido` });
  req.params[nome] = String(id);
  next();
}

module.exports = { validarParametroId };
