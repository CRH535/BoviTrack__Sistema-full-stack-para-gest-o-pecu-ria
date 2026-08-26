const { criarUsuarioComum } = require("../services/usuarios");

async function responderCriacaoUsuario(req, res, mensagemSucesso) {
  try {
    const usuario = await criarUsuarioComum(req.body);

    res.status(201).json({
      mensagem: mensagemSucesso,
      usuario,
    });
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
}

module.exports = { responderCriacaoUsuario };

