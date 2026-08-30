function normalizarOrigem(origem) {
  return String(origem || "").trim().replace(/\/$/, "");
}

function obterOrigensPermitidas(ambiente = process.env) {
  const origens = (ambiente.FRONTEND_URL || "")
    .split(",")
    .map(normalizarOrigem)
    .filter(Boolean);

  if (ambiente.NODE_ENV !== "production" || ambiente.CORS_ALLOW_LOCALHOST === "true") {
    origens.push("http://localhost:5173");
  }

  return new Set(origens);
}

function criarConfiguracaoCors(ambiente = process.env) {
  const origensFrontend = obterOrigensPermitidas(ambiente);

  return {
    credentials: true,
    exposedHeaders: [
      "X-Request-Id",
      "X-Page",
      "X-Limit",
      "X-Has-More",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "Retry-After",
    ],
    origin(origem, callback) {
      if (!origem || origensFrontend.has(normalizarOrigem(origem))) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
  };
}

module.exports = {
  criarConfiguracaoCors,
  normalizarOrigem,
  obterOrigensPermitidas,
};
