function primeiroIp(valor) {
  return String(valor || "").split(",")[0].trim().slice(0, 64);
}

function obterIpCliente(req, ambiente = process.env) {
  if (ambiente.VERCEL) {
    return (
      primeiroIp(req.headers["x-vercel-forwarded-for"]) ||
      primeiroIp(req.headers["x-forwarded-for"]) ||
      req.socket?.remoteAddress ||
      "desconhecido"
    );
  }

  return req.ip || req.socket?.remoteAddress || "desconhecido";
}

module.exports = { obterIpCliente, primeiroIp };
