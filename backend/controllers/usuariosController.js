const { criarUsuarioComum } = require("../services/usuarios");
const { registrarEvento, registrarErro } = require("../utils/log");

async function responderCriacaoUsuario(req, res, mensagemSucesso, opcoes = {}) {
  try {
    const usuario = await criarUsuarioComum(req.body);

    if (opcoes.cadastroPublico) {
      return res.status(202).json({
        mensagem: "Se os dados puderem ser utilizados, a conta será criada.",
      });
    }

    registrarEvento("info", "usuario_criado_por_admin", {
      request_id: req.id,
      administrador_id: req.usuario?.id,
      usuario_id: usuario.id,
    });
    res.status(201).json({ mensagem: mensagemSucesso, usuario });
  } catch (erro) {
    if (opcoes.cadastroPublico && erro.status === 409) {
      registrarEvento("aviso", "cadastro_email_indisponivel", {
        request_id: req.id,
      });
      return res.status(202).json({
        mensagem: "Se os dados puderem ser utilizados, a conta será criada.",
      });
    }
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }

    registrarErro("erro_cadastro_usuario", erro, req);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
}

module.exports = { responderCriacaoUsuario };
