const express = require("express");
const pool = require("../database/pool")

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const parametros = [req.usuario.perfil, req.usuario.id];

    const resumoResultado = await pool.query(
      `SELECT
        (SELECT COUNT(*)
           FROM propriedades p
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS propriedades,
        (SELECT COUNT(*)
           FROM animais a
           JOIN propriedades p ON p.id = a.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS animais,
        (SELECT COUNT(*)
           FROM lotes l
           JOIN propriedades p ON p.id = l.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS lotes,
        (SELECT COUNT(*)
           FROM vacinas v
          WHERE ($1 = 'admin' OR v.usuario_id = $2)) AS vacinas,
        (SELECT COALESCE(SUM(d.valor), 0)
           FROM despesas d
           JOIN propriedades p ON p.id = d.propriedade_id
          WHERE ($1 = 'admin' OR p.usuario_id = $2)) AS total_despesas`,
      parametros,
    );

    const proximasResultado = await pool.query(
      `SELECT vc.id,
              vc.animal_id,
              a.nome AS animal,
              vc.vacina_id,
              v.nome AS vacina,
              vc.data_aplicacao,
              vc.proxima_dose,
              vc.observacao
         FROM vacinacoes vc
         JOIN animais a ON a.id = vc.animal_id
         JOIN propriedades p ON p.id = a.propriedade_id
         JOIN vacinas v ON v.id = vc.vacina_id
        WHERE vc.proxima_dose BETWEEN CURRENT_DATE
                                  AND CURRENT_DATE + INTERVAL '7 days'
          AND (
            $1 = 'admin'
            OR (p.usuario_id = $2 AND v.usuario_id = $2)
          )
        ORDER BY vc.proxima_dose`,
      parametros,
    );

    const resumo = resumoResultado.rows[0];

    res.json({
      resumo: {
        propriedades: Number(resumo.propriedades),
        animais: Number(resumo.animais),
        lotes: Number(resumo.lotes),
        vacinas: Number(resumo.vacinas),
        total_despesas: Number(resumo.total_despesas),
      },
      proximas_vacinacoes: proximasResultado.rows,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao carregar o dashboard" });
  }
});

// =========================
// PROPRIEDADES
// =========================

module.exports = router;

