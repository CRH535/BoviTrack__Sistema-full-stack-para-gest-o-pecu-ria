const express = require("express");
const pool = require("../database/pool")

const router = express.Router();

router.post("/vacinacoes", async (req, res) => {
  try {
    const { animal_id, vacina_id, data_aplicacao, proxima_dose, observacao } =
      req.body;

    if (!animal_id || !vacina_id || !data_aplicacao) {
      return res.status(400).json({
        mensagem: "Animal, vacina e data de aplicação são obrigatórios",
      });
    }

    const animalExiste = await pool.query(
      `SELECT a.*, p.usuario_id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animal_id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const vacinaExiste = await pool.query(
      `SELECT id, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [vacina_id, req.usuario.perfil, req.usuario.id],
    );

    if (vacinaExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    if (animalExiste.rows[0].usuario_id !== vacinaExiste.rows[0].usuario_id) {
      return res.status(400).json({
        mensagem: "Animal e vacina pertencem a usuários diferentes",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO vacinacoes
             (animal_id, vacina_id, data_aplicacao, proxima_dose, observacao)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [
        animal_id,
        vacina_id,
        data_aplicacao,
        proxima_dose || null,
        observacao || null,
      ],
    );

    res.status(201).json({
      mensagem: "Vacinação registrada com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao registrar vacinação",
    });
  }
});

router.get("/vacinacoes", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
            FROM vacinacoes
            JOIN animais
                ON vacinacoes.animal_id = animais.id
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            WHERE (
              $1 = 'admin'
              OR (propriedades.usuario_id = $2 AND vacinas.usuario_id = $2)
            )
            ORDER BY vacinacoes.id
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinações",
    });
  }
});

// IMPORTANTE:
// esta rota deve ficar ANTES de /vacinacoes/:id

router.get("/vacinacoes/proximas", async (req, res) => {
  try {
    const { periodo = "todos" } = req.query;

    const filtrosPeriodo = {
      hoje: "vacinacoes.proxima_dose = CURRENT_DATE",

      semana: `
                vacinacoes.proxima_dose BETWEEN CURRENT_DATE
                AND CURRENT_DATE + INTERVAL '7 days'
            `,

      futuro: "vacinacoes.proxima_dose > CURRENT_DATE",

      todos: "vacinacoes.proxima_dose IS NOT NULL",
    };

    const filtro = filtrosPeriodo[periodo];

    if (!filtro) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, futuro ou todos",
      });
    }

    const resultado = await pool.query(`
            SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
            FROM vacinacoes
            JOIN animais
                ON vacinacoes.animal_id = animais.id
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
            WHERE ${filtro}
              AND (
                $1 = 'admin'
                OR (propriedades.usuario_id = $2 AND vacinas.usuario_id = $2)
              )
            ORDER BY vacinacoes.proxima_dose
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar próximas vacinações",
    });
  }
});

router.get("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
                vacinacoes.id,
                vacinacoes.animal_id,
                animais.nome AS animal,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
             FROM vacinacoes
             JOIN animais
                ON vacinacoes.animal_id = animais.id
             JOIN propriedades
                ON animais.propriedade_id = propriedades.id
             JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
             WHERE vacinacoes.id = $1
               AND (
                 $2 = 'admin'
                 OR (propriedades.usuario_id = $3 AND vacinas.usuario_id = $3)
               )`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinação",
    });
  }
});

router.put("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { animal_id, vacina_id, data_aplicacao, proxima_dose, observacao } =
      req.body;

    if (!animal_id || !vacina_id || !data_aplicacao) {
      return res.status(400).json({
        mensagem: "Animal, vacina e data de aplicação são obrigatórios",
      });
    }

    const animalExiste = await pool.query(
      `SELECT a.*, p.usuario_id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [animal_id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const vacinaExiste = await pool.query(
      `SELECT id, usuario_id
         FROM vacinas
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [vacina_id, req.usuario.perfil, req.usuario.id],
    );

    if (vacinaExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacina não encontrada",
      });
    }

    if (animalExiste.rows[0].usuario_id !== vacinaExiste.rows[0].usuario_id) {
      return res.status(400).json({
        mensagem: "Animal e vacina pertencem a usuários diferentes",
      });
    }

    const resultado = await pool.query(
      `UPDATE vacinacoes
             SET animal_id = $1,
                 vacina_id = $2,
                 data_aplicacao = $3,
                 proxima_dose = $4,
                 observacao = $5
             WHERE id = $6
               AND (
                 $7 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM animais a_atual
                     JOIN propriedades p_atual
                       ON p_atual.id = a_atual.propriedade_id
                    WHERE a_atual.id = vacinacoes.animal_id
                      AND p_atual.usuario_id = $8
                 )
               )
             RETURNING *`,
      [
        animal_id,
        vacina_id,
        data_aplicacao,
        proxima_dose || null,
        observacao || null,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json({
      mensagem: "Vacinação atualizada com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar vacinação",
    });
  }
});

router.delete("/vacinacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM vacinacoes vc
             USING animais a, propriedades p
             WHERE vc.id = $1
               AND a.id = vc.animal_id
               AND p.id = a.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING vc.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Vacinação não encontrada",
      });
    }

    res.json({
      mensagem: "Vacinação excluída com sucesso!",
      vacinacao: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir vacinação",
    });
  }
});

// =========================
// HISTÓRICO DO ANIMAL
// =========================

router.get("/animais/:id/vacinacoes", async (req, res) => {
  try {
    const { id } = req.params;

    const animalExiste = await pool.query(
      `SELECT a.id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    const resultado = await pool.query(
      `SELECT
                vacinacoes.id,
                vacinacoes.vacina_id,
                vacinas.nome AS vacina,
                vacinacoes.data_aplicacao,
                vacinacoes.proxima_dose,
                vacinacoes.observacao
             FROM vacinacoes
             JOIN vacinas
                ON vacinacoes.vacina_id = vacinas.id
             JOIN animais
                ON animais.id = vacinacoes.animal_id
             JOIN propriedades
                ON propriedades.id = animais.propriedade_id
             WHERE vacinacoes.animal_id = $1
               AND vacinas.usuario_id = propriedades.usuario_id
             ORDER BY vacinacoes.data_aplicacao DESC`,
      [id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar vacinações do animal",
    });
  }
});
// =========================
// CONTROLE LEITEIRO
// =========================

module.exports = router;

