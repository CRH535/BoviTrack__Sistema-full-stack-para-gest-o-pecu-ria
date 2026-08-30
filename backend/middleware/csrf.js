const {
  normalizarOrigem,
  obterOrigensPermitidas,
} = require("../config/cors");
const { registrarEvento } = require("../utils/log");

function origemDoReferer(referer) {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return "invalida";
  }
}

function protegerContraCsrf(req, res, next) {
  const permitidas = obterOrigensPermitidas();
  const origin = req.headers.origin
    ? normalizarOrigem(req.headers.origin)
    : null;
  const referer = origemDoReferer(req.headers.referer);
  const fetchSite = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  const origemInformada = origin || referer;
  const permitirSemOrigem =
    process.env.NODE_ENV !== "production" &&
    process.env.CSRF_ALLOW_NO_ORIGIN !== "false";

  const origemPermitida = origemInformada && permitidas.has(origemInformada);
  const suspeita =
    (origemInformada && !origemPermitida) ||
    (!origemInformada && fetchSite === "cross-site") ||
    (!origemInformada && !permitirSemOrigem);

  if (suspeita) {
    registrarEvento("aviso", "csrf_bloqueado", {
      request_id: req.id,
      rota: req.originalUrl,
      fetch_site: fetchSite || "ausente",
    });
    return res.status(403).json({ mensagem: "Origem da requisição não permitida" });
  }

  next();
}

module.exports = { protegerContraCsrf };
