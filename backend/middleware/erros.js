const { registrarErro } = require("../utils/log");

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: "Rota não encontrada" });
}

function tratarErros(erro, req, res, next) {
  if (res.headersSent) return next(erro);

  if (erro?.type === "entity.too.large") {
    return res.status(413).json({ mensagem: "Payload acima do limite permitido" });
  }

  if (erro instanceof SyntaxError && erro.status === 400 && "body" in erro) {
    return res.status(400).json({ mensagem: "JSON inválido" });
  }

  if (erro?.message === "Origem não permitida pelo CORS") {
    return res.status(403).json({ mensagem: "Origem não permitida" });
  }

  const status = Number.isInteger(erro?.status) ? erro.status : 500;
  if (status >= 500) registrarErro("erro_nao_tratado", erro, req);

  res.status(status).json({
    mensagem:
      status >= 500 ? "Erro interno do servidor" : erro.message || "Requisição inválida",
  });
}

module.exports = { rotaNaoEncontrada, tratarErros };
