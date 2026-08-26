const express = require("express");
const pool = require("../database/pool")

const router = express.Router();

router.post("/vacinas", async (req, res) => {
  try {
    const { nome, fabricante, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "Nome da vacina é obrigatório",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO vacinas
             (nome, fabricante, descricao, usuario_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [nome, fabricante, descricao, req.usuario.id],
    );

    res.status(201).json({
      mensagem: "Vacina cadastrada com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar vacina",
    });
  }
});

router.get("/vacinas", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, fabricante, descricao, usuario_id
         FROM vacinas
        WHERE ($1 = 'admin' OR usuario_id = $2)
        ORDER BY id`,
      [req.usuario.perfil, req.usuario.id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinas",
    });
  }
});

router.get("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT id, nome, fabricante, descricao, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacina",
    });
  }
});

router.put("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, fabricante, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "Nome da vacina é obrigatório",
      });
    }

    const resultado = await pool.query(
      `UPDATE vacinas
             SET nome = $1,
                 fabricante = $2,
                 descricao = $3
             WHERE id = $4
               AND ($5 = 'admin' OR usuario_id = $6)
             RETURNING *`,
      [nome, fabricante, descricao, id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json({
      mensagem: "Vacina atualizada com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar vacina",
    });
  }
});

router.delete("/vacinas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM vacinas
             WHERE id = $1
               AND ($2 = 'admin' OR usuario_id = $3)
             RETURNING *`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    res.json({
      mensagem: "Vacina excluída com sucesso!",
      vacina: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir vacina",
    });
  }
});

// =========================
// VACINAÇÕES
// =========================

module.exports = router;

