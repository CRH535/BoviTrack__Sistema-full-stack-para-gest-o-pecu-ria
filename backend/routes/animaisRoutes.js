const express = require("express");
const pool = require("../database/pool");
const {
  converterId,
  normalizarDataNascimento,
  normalizarNumeroBrinco,
} = require("../utils/validacoes")

const router = express.Router();

router.get("/animais", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                animais.id,
                animais.nome,
                animais.numero_brinco,
                animais.data_nascimento,
                animais.especie,
                animais.raca,
                animais.sexo,
                animais.peso,
                animais.propriedade_id,
                animais.mae_id,
                mae.nome AS mae,
                mae.numero_brinco AS mae_numero_brinco,
                propriedades.nome AS propriedade,
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object('id', l.id, 'nome', l.nome)
                      ORDER BY l.nome, l.id
                    )
                    FROM animais_lotes al
                    JOIN lotes l ON l.id = al.lote_id
                    WHERE al.animal_id = animais.id
                      AND l.propriedade_id = animais.propriedade_id
                  ),
                  '[]'::json
                ) AS lotes
            FROM animais
            JOIN propriedades
                ON animais.propriedade_id = propriedades.id
            LEFT JOIN animais mae ON mae.id = animais.mae_id
            WHERE ($1 = 'admin' OR propriedades.usuario_id = $2)
            ORDER BY animais.id
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais",
    });
  }
});

router.get("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT
                animais.id,
                animais.nome,
                animais.numero_brinco,
                animais.data_nascimento,
                animais.especie,
                animais.raca,
                animais.sexo,
                animais.peso,
                animais.propriedade_id,
                animais.mae_id,
                mae.nome AS mae,
                mae.numero_brinco AS mae_numero_brinco,
                propriedades.nome AS propriedade,
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object('id', l.id, 'nome', l.nome)
                      ORDER BY l.nome, l.id
                    )
                    FROM animais_lotes al
                    JOIN lotes l ON l.id = al.lote_id
                    WHERE al.animal_id = animais.id
                      AND l.propriedade_id = animais.propriedade_id
                  ),
                  '[]'::json
                ) AS lotes
             FROM animais
             JOIN propriedades
                ON animais.propriedade_id = propriedades.id
             LEFT JOIN animais mae ON mae.id = animais.mae_id
             WHERE animais.id = $1
               AND ($2 = 'admin' OR propriedades.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animal",
    });
  }
});

router.get("/propriedades/:id/animais", async (req, res) => {
  try {
    const { id } = req.params;

    const propriedadeExiste = await pool.query(
      `SELECT id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const resultado = await pool.query(
      `SELECT *
             FROM animais
             WHERE propriedade_id = $1
             ORDER BY id`,
      [id],
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar animais da propriedade",
    });
  }
});

router.post("/animais", async (req, res) => {
  try {
    const {
      nome,
      numero_brinco,
      data_nascimento,
      especie,
      raca,
      sexo,
      peso,
      propriedade_id,
      mae_id,
    } = req.body;

    if (!nome || !especie || !sexo || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
      });
    }

    if (sexo.toUpperCase() !== "M" && sexo.toUpperCase() !== "F") {
      return res.status(400).json({
        mensagem: "Sexo deve ser M ou F",
      });
    }

    if (peso !== undefined && peso !== null && peso < 0) {
      return res.status(400).json({
        mensagem: "Peso não pode ser negativo",
      });
    }

    const numeroBrinco = normalizarNumeroBrinco(numero_brinco);
    const dataNascimento = normalizarDataNascimento(data_nascimento);

    if (numeroBrinco.erro || dataNascimento.erro) {
      return res.status(400).json({
        mensagem: numeroBrinco.erro || dataNascimento.erro,
      });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const maeId = mae_id ? converterId(mae_id) : null;
    if (mae_id && !maeId) {
      return res.status(400).json({ mensagem: "Mãe inválida" });
    }
    if (maeId) {
      const maeExiste = await pool.query(
        `SELECT id FROM animais
          WHERE id = $1 AND propriedade_id = $2 AND sexo = 'F'`,
        [maeId, propriedade_id],
      );
      if (!maeExiste.rows.length) {
        return res.status(400).json({ mensagem: "A mãe deve ser uma fêmea da mesma propriedade" });
      }
    }

    if (numeroBrinco.valor) {
      const brincoExistente = await pool.query(
        `SELECT 1
           FROM animais
          WHERE propriedade_id = $1
            AND numero_brinco = $2`,
        [propriedade_id, numeroBrinco.valor],
      );

      if (brincoExistente.rows.length > 0) {
        return res.status(409).json({
          mensagem:
            "Ja existe um animal com este numero de brinco nesta propriedade",
        });
      }
    }

    const resultado = await pool.query(
      `INSERT INTO animais
            (nome, numero_brinco, data_nascimento, especie, raca, sexo, peso, propriedade_id, mae_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
      [
        nome,
        numeroBrinco.valor,
        dataNascimento.valor,
        especie,
        raca,
        sexo.toUpperCase(),
        peso,
        propriedade_id,
        maeId,
      ],
    );

    res.status(201).json({
      mensagem: "Animal cadastrado com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    if (
      erro.code === "23505" &&
      erro.constraint === "animais_propriedade_numero_brinco_uidx"
    ) {
      return res.status(409).json({
        mensagem:
          "Ja existe um animal com este numero de brinco nesta propriedade",
      });
    }

    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar animal",
    });
  }
});

router.put("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      numero_brinco,
      data_nascimento,
      especie,
      raca,
      sexo,
      peso,
      propriedade_id,
      mae_id,
    } = req.body;

    if (!nome || !especie || !sexo || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Nome, espécie, sexo e propriedade são obrigatórios",
      });
    }

    if (sexo.toUpperCase() !== "M" && sexo.toUpperCase() !== "F") {
      return res.status(400).json({
        mensagem: "Sexo deve ser M ou F",
      });
    }

    if (peso !== undefined && peso !== null && peso < 0) {
      return res.status(400).json({
        mensagem: "Peso não pode ser negativo",
      });
    }

    const numeroBrinco = normalizarNumeroBrinco(numero_brinco);
    const dataNascimento = normalizarDataNascimento(data_nascimento);

    if (numeroBrinco.erro || dataNascimento.erro) {
      return res.status(400).json({
        mensagem: numeroBrinco.erro || dataNascimento.erro,
      });
    }

    const animalAtual = await pool.query(
      `SELECT a.id
         FROM animais a
         JOIN propriedades p ON p.id = a.propriedade_id
        WHERE a.id = $1
          AND ($2 = 'admin' OR p.usuario_id = $3)`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (animalAtual.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id, usuario_id
         FROM propriedades
        WHERE id = $1
          AND ($2 = 'admin' OR usuario_id = $3)`,
      [propriedade_id, req.usuario.perfil, req.usuario.id],
    );

    if (propriedadeExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Propriedade não encontrada",
      });
    }

    const maeId = mae_id ? converterId(mae_id) : null;
    if (mae_id && !maeId) {
      return res.status(400).json({ mensagem: "Mãe inválida" });
    }
    if (maeId === Number(id)) {
      return res.status(400).json({ mensagem: "Um animal não pode ser sua própria mãe" });
    }
    if (maeId) {
      const maeExiste = await pool.query(
        `SELECT id FROM animais
          WHERE id = $1 AND propriedade_id = $2 AND sexo = 'F'`,
        [maeId, propriedade_id],
      );
      if (!maeExiste.rows.length) {
        return res.status(400).json({ mensagem: "A mãe deve ser uma fêmea da mesma propriedade" });
      }
    }

    if (numeroBrinco.valor) {
      const brincoExistente = await pool.query(
        `SELECT 1
           FROM animais
          WHERE propriedade_id = $1
            AND numero_brinco = $2
            AND id <> $3`,
        [propriedade_id, numeroBrinco.valor, id],
      );

      if (brincoExistente.rows.length > 0) {
        return res.status(409).json({
          mensagem:
            "Ja existe um animal com este numero de brinco nesta propriedade",
        });
      }
    }

    const vinculoIncompativel = await pool.query(
      `SELECT 1
         FROM animais_lotes al
         JOIN lotes l ON l.id = al.lote_id
        WHERE al.animal_id = $1
          AND l.propriedade_id <> $2
       UNION ALL
       SELECT 1
         FROM vacinacoes vc
         JOIN vacinas v ON v.id = vc.vacina_id
        WHERE vc.animal_id = $1
          AND v.usuario_id <> $3
       UNION ALL
       SELECT 1 FROM animais filho
        WHERE filho.mae_id = $1 AND filho.propriedade_id <> $2
       UNION ALL
       SELECT 1 FROM pesagens pe
        JOIN lotes lp ON lp.id = pe.lote_id
        WHERE pe.animal_id = $1 AND lp.propriedade_id <> $2
       UNION ALL
       SELECT 1 FROM desmamas de
        LEFT JOIN animais m ON m.id = de.mae_id
        LEFT JOIN lotes ld ON ld.id = de.lote_destino_id
        WHERE de.animal_id = $1
          AND (m.propriedade_id <> $2 OR ld.propriedade_id <> $2)
       LIMIT 1`,
      [id, propriedade_id, propriedadeExiste.rows[0].usuario_id],
    );

    if (vinculoIncompativel.rows.length > 0) {
      return res.status(400).json({
        mensagem: "O animal possui lote ou vacinação incompatível com a nova propriedade",
      });
    }

    const resultado = await pool.query(
      `UPDATE animais
             SET nome = $1,
                 numero_brinco = $2,
                 data_nascimento = $3,
                 especie = $4,
                 raca = $5,
                 sexo = $6,
                 peso = $7,
                 propriedade_id = $8,
                 mae_id = $9
             WHERE id = $10
               AND (
                 $11 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM propriedades p
                    WHERE p.id = animais.propriedade_id
                      AND p.usuario_id = $12
                 )
               )
             RETURNING *`,
      [
        nome,
        numeroBrinco.valor,
        dataNascimento.valor,
        especie,
        raca,
        sexo.toUpperCase(),
        peso,
        propriedade_id,
        maeId,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json({
      mensagem: "Animal atualizado com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    if (
      erro.code === "23505" &&
      erro.constraint === "animais_propriedade_numero_brinco_uidx"
    ) {
      return res.status(409).json({
        mensagem:
          "Ja existe um animal com este numero de brinco nesta propriedade",
      });
    }

    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar animal",
    });
  }
});

router.delete("/animais/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM animais a
             USING propriedades p
             WHERE a.id = $1
               AND p.id = a.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING a.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Animal não encontrado",
      });
    }

    res.json({
      mensagem: "Animal excluído com sucesso!",
      animal: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir animal",
    });
  }
});
// =========================
// LOTES
// =========================

module.exports = router;
