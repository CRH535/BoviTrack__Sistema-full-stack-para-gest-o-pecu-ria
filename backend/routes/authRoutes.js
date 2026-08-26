const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../database/pool");
const { responderCriacaoUsuario } = require("../controllers/usuariosController");
const {
  criarSessaoRefresh,
  criarTokenAcesso,
  definirCookieRefresh,
  encerrarSessaoRefresh,
  lerRefreshToken,
  limparCookieRefresh,
  renovarSessaoRefresh,
} = require("../services/sessoes")

const router = express.Router();

router.post("/auth/cadastro", async (req, res) => {
  await responderCriacaoUsuario(
    req,
    res,
    "Conta criada com sucesso. Agora você já pode entrar no BoviTrack.",
  );
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email: emailRecebido, senha } = req.body;

    if (typeof emailRecebido !== "string" || typeof senha !== "string") {
      return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
    }

    const email = emailRecebido.trim().toLowerCase();

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
    }

    const resultado = await pool.query(
      `SELECT id, nome, email, senha, perfil, ativo
         FROM usuarios
        WHERE email = $1`,
      [email],
    );

    const usuario = resultado.rows[0];
    const senhaCorreta = usuario && (await bcrypt.compare(senha, usuario.senha));

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Email ou senha inválidos" });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        mensagem: "Usuário desativado. Entre em contato com o administrador",
      });
    }

    const token = criarTokenAcesso(usuario);
    const sessaoRefresh = await criarSessaoRefresh(pool, usuario.id);

    definirCookieRefresh(
      res,
      sessaoRefresh.token,
      sessaoRefresh.expiresAt,
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao realizar login" });
  }
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const refreshToken = lerRefreshToken(req);
    const sessao = await renovarSessaoRefresh(pool, refreshToken);

    if (!sessao) {
      limparCookieRefresh(res);
      return res.status(401).json({
        mensagem: "Sessão expirada. Entre novamente",
        codigo: "SESSAO_EXPIRADA",
      });
    }

    const token = criarTokenAcesso(sessao.usuario);

    definirCookieRefresh(res, sessao.token, sessao.expiresAt);

    res.json({
      token,
      usuario: {
        id: sessao.usuario.id,
        nome: sessao.usuario.nome,
        email: sessao.usuario.email,
        perfil: sessao.usuario.perfil,
        ativo: sessao.usuario.ativo,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao renovar sessão" });
  }
});

router.post("/auth/logout", async (req, res) => {
  const refreshToken = lerRefreshToken(req);

  try {
    await encerrarSessaoRefresh(pool, refreshToken);
    limparCookieRefresh(res);
    res.json({ mensagem: "Logout realizado com sucesso" });
  } catch (erro) {
    console.error(erro);
    limparCookieRefresh(res);
    res.status(500).json({ mensagem: "Erro ao encerrar sessão" });
  }
});

module.exports = router;
