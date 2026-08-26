const express = require("express");
const pool = require("../database/pool")

const router = express.Router();

router.get("/propriedades", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, cidade, estado, area, usuario_id
         FROM propriedades
        WHERE ($1 = 'admin' OR usuario_id = $2)
        ORDER BY id`,
      [req.usuario.perfil, req.usuario.id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar propriedades",
    });
  }
});

router.get("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT id, nome, cidade, estado, area, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar propriedade",
    });
  }
});

router.post("/propriedades", async (req, res) => {
  try {
    const { nome, cidade, estado, area } = req.body;

    if (!nome || !cidade || !estado || !area) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (estado.length !== 2) {
      return res.status(400).json({
        mensagem: "Estado deve conter 2 caracteres",
      });
    }

    if (area <= 0) {
      return res.status(400).json({
        mensagem: "A área deve ser maior que zero",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO propriedades (nome, cidade, estado, area, usuario_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [nome, cidade, estado.toUpperCase(), area, req.usuario.id],
    );

    res.status(201).json({
      mensagem: "Propriedade cadastrada com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar propriedade",
    });
  }
});

router.put("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cidade, estado, area } = req.body;

    if (!nome || !cidade || !estado || !area) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (estado.length !== 2) {
      return res.status(400).json({
        mensagem: "Estado deve conter 2 caracteres",
      });
    }

    if (area <= 0) {
      return res.status(400).json({
        mensagem: "A área deve ser maior que zero",
      });
    }

    const resultado = await pool.query(
      `UPDATE propriedades
             SET nome = $1,
                 cidade = $2,
                 estado = $3,
                 area = $4
             WHERE id = $5
               AND ($6 = 'admin' OR usuario_id = $7)
             RETURNING *`,
      [
        nome,
        cidade,
        estado.toUpperCase(),
        area,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json({
      mensagem: "Propriedade atualizada com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar propriedade",
    });
  }
});

router.delete("/propriedades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM propriedades
             WHERE id = $1
               AND ($2 = 'admin' OR usuario_id = $3)
             RETURNING *`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    res.json({
      mensagem: "Propriedade excluída com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir propriedade",
    });
  }
});
// =========================
// ANIMAIS
// =========================

module.exports = router;

