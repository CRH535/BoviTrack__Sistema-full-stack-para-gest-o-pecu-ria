function criarConfiguracaoCors(ambiente = process.env) {
  const origensFrontend = new Set([
    "http://localhost:5173",
    ...(ambiente.FRONTEND_URL || "")
      .split(",")
      .map((origem) => origem.trim().replace(/\/$/, ""))
      .filter(Boolean),
  ]);

  return {
    credentials: true,
    origin(origem, callback) {
      if (!origem || origensFrontend.has(origem)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
  };
}

module.exports = { criarConfiguracaoCors };
