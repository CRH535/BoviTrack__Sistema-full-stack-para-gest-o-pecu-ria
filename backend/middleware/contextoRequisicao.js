const crypto = require("crypto");

function contextoRequisicao(req, res, next) {
  const recebido = req.headers["x-request-id"];
  req.id =
    typeof recebido === "string" && /^[A-Za-z0-9._-]{1,64}$/.test(recebido)
      ? recebido
      : crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  res.setHeader("Cache-Control", "no-store");
  next();
}

module.exports = { contextoRequisicao };
