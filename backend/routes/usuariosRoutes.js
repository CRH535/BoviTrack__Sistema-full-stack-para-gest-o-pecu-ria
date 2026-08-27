const express = require("express");
const pool = require("../database/pool");
const { somenteAdmin } = require("../middleware/autenticacao");
const { responderCriacaoUsuario } = require("../controllers/usuariosController")
const { excluirUsuarioComDados } = require("../services/usuarios");
const { limparCookieRefresh } = require("../services/sessoes");

const router = express.Router();

router.post("/usuarios", somenteAdmin, async (req, res) => {
  await responderCriacaoUsuario(req, res, "Usuário cadastrado com sucesso!");
});

router.get("/auth/me", (req, res) => {
  res.json({ usuario: req.usuario });
});

router.get("/usuarios", somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, perfil, ativo, created_at
         FROM usuarios
        ORDER BY id`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuários" });
  }
});

router.put("/usuarios/me", async (req, res) => {
  try {
    const { nome: nomeRecebido, email: emailRecebido } = req.body;

    if (typeof nomeRecebido !== "string" || typeof emailRecebido !== "string") {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    const nome = nomeRecebido.trim();
    const email = emailRecebido.trim().toLowerCase();

    if (!nome || !email) {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    if (nome.length > 120 || email.length > 255) {
      return res.status(400).json({ mensagem: "Nome ou email excede o tamanho permitido" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Email inválido" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
          SET nome = $1,
              email = $2
        WHERE id = $3
        RETURNING id, nome, email, perfil, ativo, created_at`,
      [nome, email, req.usuario.id],
    );

    res.json({
      mensagem: "Conta atualizada com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({ mensagem: "Este email já está cadastrado" });
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar conta" });
  }
});

router.delete("/usuarios/me", async (req, res) => {
  if (req.body?.confirmacao !== "EXCLUIR") {
    return res.status(400).json({
      mensagem: "Digite EXCLUIR para confirmar a exclusão da conta",
    });
  }

  try {
    await excluirUsuarioComDados(req.usuario.id);
    limparCookieRefresh(res);

    res.json({ mensagem: "Sua conta foi excluída com sucesso" });
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }

    console.error(erro);
    res.status(500).json({
      mensagem: "Não foi possível excluir sua conta. Nenhum dado foi removido",
    });
  }
});

router.get("/usuarios/:id", somenteAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, perfil, ativo, created_at
         FROM usuarios
        WHERE id = $1`,
      [req.params.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuário" });
  }
});

router.put("/usuarios/:id", somenteAdmin, async (req, res) => {
  try {
    const { nome: nomeRecebido, email: emailRecebido } = req.body;

    if (typeof nomeRecebido !== "string" || typeof emailRecebido !== "string") {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    const nome = nomeRecebido.trim();
    const email = emailRecebido.trim().toLowerCase();

    if (!nome || !email) {
      return res.status(400).json({ mensagem: "Nome e email são obrigatórios" });
    }

    if (nome.length > 120 || email.length > 255) {
      return res.status(400).json({ mensagem: "Nome ou email excede o tamanho permitido" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Email inválido" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
          SET nome = $1,
              email = $2
        WHERE id = $3
        RETURNING id, nome, email, perfil, ativo, created_at`,
      [nome, email, req.params.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({ mensagem: "Este email já está cadastrado" });
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar usuário" });
  }
});

router.put("/usuarios/:id/ativo", somenteAdmin, async (req, res) => {
  try {
    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({ mensagem: "O campo ativo deve ser verdadeiro ou falso" });
    }

    const usuarioResultado = await pool.query(
      "SELECT id, perfil FROM usuarios WHERE id = $1",
      [req.params.id],
    );

    if (usuarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    if (usuarioResultado.rows[0].perfil === "admin") {
      return res.status(403).json({
        mensagem: "O administrador principal não pode ser ativado ou desativado por esta rota",
      });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
          SET ativo = $1
        WHERE id = $2
        RETURNING id, nome, email, perfil, ativo, created_at`,
      [ativo, req.params.id],
    );

    res.json({
      mensagem: ativo
        ? "Usuário ativado com sucesso!"
        : "Usuário desativado com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao alterar situação do usuário" });
  }
});

router.delete("/usuarios/:id", somenteAdmin, async (req, res) => {
  if (Number(req.params.id) === Number(req.usuario.id)) {
    return res.status(403).json({
      mensagem: "O administrador não pode excluir a própria conta",
    });
  }

  try {
    const resultado = await excluirUsuarioComDados(req.params.id);

    res.json({
      mensagem: "Usuário e dados vinculados excluídos com sucesso",
      usuario: resultado.usuario,
    });
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }

    console.error(erro);
    res.status(500).json({
      mensagem: "Não foi possível excluir o usuário. Nenhum dado foi removido",
    });
  }
});

// =========================
// DASHBOARD
// =========================

module.exports = router;
