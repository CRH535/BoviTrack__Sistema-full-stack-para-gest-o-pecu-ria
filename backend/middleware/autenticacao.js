const jwt = require("jsonwebtoken");
const pool = require("../database/pool");

async function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!/^Bearer\s+/i.test(authorization || "")) {
    return res
      .status(401)
      .json({ mensagem: "Token de autenticação não informado" });
  }

  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return res
      .status(401)
      .json({ mensagem: "Token de autenticação não informado" });
  }

  let dados;

  try {
    dados = jwt.verify(token, process.env.JWT_SECRET);
  } catch (erro) {
    if (erro.name === "TokenExpiredError") {
      return res.status(401).json({
        mensagem: "Token de autenticação expirado",
        codigo: "TOKEN_EXPIRADO",
      });
    }

    if (erro.name !== "JsonWebTokenError") {
      console.error(erro);
    }

    return res.status(401).json({
      mensagem: "Token de autenticação inválido",
      codigo: "TOKEN_INVALIDO",
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, perfil, ativo
         FROM usuarios
        WHERE id = $1
          AND ativo = TRUE`,
      [dados.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensagem: "Sessão inválida ou usuário desativado",
        codigo: "SESSAO_INVALIDA",
      });
    }

    req.usuario = resultado.rows[0];
    next();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao validar sessão" });
  }
}

function somenteAdmin(req, res, next) {
  if (req.usuario.perfil !== "admin") {
    return res.status(403).json({ mensagem: "Acesso restrito ao administrador" });
  }

  next();
}

module.exports = { autenticar, somenteAdmin };
