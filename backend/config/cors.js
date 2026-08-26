function criarConfiguracaoCors(ambiente = process.env) {
  const origensFrontend = (
    ambiente.FRONTEND_URL || "http://localhost:5173"
  )
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);

  return {
    credentials: true,
    origin(origem, callback) {
      if (!origem || origensFrontend.includes(origem)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
  };
}

module.exports = { criarConfiguracaoCors };

