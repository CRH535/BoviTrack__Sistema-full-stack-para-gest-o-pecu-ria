const express = require("express");
const pool = require("../database/pool");
const { normalizarFormaPagamento } = require("../utils/validacoes")

const router = express.Router();

router.post("/despesas", async (req, res) => {
  try {
    const {
      descricao,
      categoria,
      forma_pagamento,
      valor,
      data,
      propriedade_id,
    } = req.body;

    if (!descricao || !categoria || !valor || !data || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero",
      });
    }

    const formaPagamento = normalizarFormaPagamento(forma_pagamento);

    if (formaPagamento.erro) {
      return res.status(400).json({ mensagem: formaPagamento.erro });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
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

    const resultado = await pool.query(
      `INSERT INTO despesas
            (descricao, categoria, forma_pagamento, valor, data, propriedade_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
      [
        descricao,
        categoria,
        formaPagamento.valor,
        valor,
        data,
        propriedade_id,
      ],
    );

    res.status(201).json({
      mensagem: "Despesa cadastrada com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao cadastrar despesa",
    });
  }
});

router.get("/despesas", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT
                despesas.id,
                despesas.descricao,
                despesas.categoria,
                despesas.forma_pagamento,
                despesas.valor,
                despesas.data,
                despesas.propriedade_id,
                propriedades.nome AS propriedade
            FROM despesas
            JOIN propriedades
                ON despesas.propriedade_id = propriedades.id
            WHERE ($1 = 'admin' OR propriedades.usuario_id = $2)
            ORDER BY despesas.data DESC
        `, [req.usuario.perfil, req.usuario.id]);

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesas",
    });
  }
});

router.get("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
            SELECT
                despesas.id,
                despesas.descricao,
                despesas.categoria,
                despesas.forma_pagamento,
                despesas.valor,
                despesas.data,
                despesas.propriedade_id,
                propriedades.nome AS propriedade
            FROM despesas
            JOIN propriedades
                ON despesas.propriedade_id = propriedades.id
            WHERE despesas.id = $1
              AND ($2 = 'admin' OR propriedades.usuario_id = $3)
        `,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesa",
    });
  }
});

router.put("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      descricao,
      categoria,
      forma_pagamento,
      valor,
      data,
      propriedade_id,
    } = req.body;

    if (!descricao || !categoria || !valor || !data || !propriedade_id) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero",
      });
    }

    const formaPagamento = normalizarFormaPagamento(forma_pagamento);

    if (formaPagamento.erro) {
      return res.status(400).json({ mensagem: formaPagamento.erro });
    }

    const propriedadeExiste = await pool.query(
      `SELECT id
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

    const resultado = await pool.query(
      `UPDATE despesas
             SET descricao = $1,
                 categoria = $2,
                 forma_pagamento = $3,
                 valor = $4,
                 data = $5,
                 propriedade_id = $6
             WHERE id = $7
               AND (
                 $8 = 'admin'
                 OR EXISTS (
                   SELECT 1
                     FROM propriedades p
                    WHERE p.id = despesas.propriedade_id
                      AND p.usuario_id = $9
                 )
               )
             RETURNING *`,
      [
        descricao,
        categoria,
        formaPagamento.valor,
        valor,
        data,
        propriedade_id,
        id,
        req.usuario.perfil,
        req.usuario.id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json({
      mensagem: "Despesa atualizada com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar despesa",
    });
  }
});

router.delete("/despesas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM despesas d
             USING propriedades p
             WHERE d.id = $1
               AND p.id = d.propriedade_id
               AND ($2 = 'admin' OR p.usuario_id = $3)
             RETURNING d.*`,
      [id, req.usuario.perfil, req.usuario.id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada",
      });
    }

    res.json({
      mensagem: "Despesa excluída com sucesso!",
      despesa: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao excluir despesa",
    });
  }
});
// =========================
// DESPESAS POR PROPRIEDADE
// =========================

router.get("/propriedades/:id/despesas", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      periodo = "todos",
      categoria,
      valor_minimo,
      valor_maximo,
      data_inicio,
      data_fim,
    } = req.query;

    const propriedadeExiste = await pool.query(
      `SELECT id, nome, cidade, estado, area
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

    if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, mes ou todos",
      });
    }

    if (valor_minimo && isNaN(Number(valor_minimo))) {
      return res.status(400).json({
        mensagem: "Valor mínimo inválido",
      });
    }

    if (valor_maximo && isNaN(Number(valor_maximo))) {
      return res.status(400).json({
        mensagem: "Valor máximo inválido",
      });
    }

    if (valor_minimo && Number(valor_minimo) < 0) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser negativo",
      });
    }

    if (valor_maximo && Number(valor_maximo) < 0) {
      return res.status(400).json({
        mensagem: "O valor máximo não pode ser negativo",
      });
    }

    if (
      valor_minimo &&
      valor_maximo &&
      Number(valor_minimo) > Number(valor_maximo)
    ) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser maior que o valor máximo",
      });
    }

    if (data_inicio && isNaN(Date.parse(data_inicio))) {
      return res.status(400).json({
        mensagem: "Data inicial inválida",
      });
    }

    if (data_fim && isNaN(Date.parse(data_fim))) {
      return res.status(400).json({
        mensagem: "Data final inválida",
      });
    }

    if (data_inicio && data_fim && new Date(data_inicio) > new Date(data_fim)) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final",
      });
    }

    if (periodo !== "todos" && (data_inicio || data_fim)) {
      return res.status(400).json({
        mensagem:
          "Use periodo ou intervalo de datas, não os dois ao mesmo tempo",
      });
    }

    const valores = [id];
    let filtro = "";

    if (periodo === "hoje") {
      filtro += " AND data = CURRENT_DATE";
    }

    if (periodo === "semana") {
      filtro += `
                AND data BETWEEN CURRENT_DATE - INTERVAL '7 days'
                AND CURRENT_DATE
            `;
    }

    if (periodo === "mes") {
      filtro += `
                AND data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
                AND CURRENT_DATE
            `;
    }

    if (categoria) {
      const parametro = valores.length + 1;

      filtro += ` AND categoria = $${parametro}`;
      valores.push(categoria);
    }

    if (valor_minimo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor >= $${parametro}`;
      valores.push(Number(valor_minimo));
    }

    if (valor_maximo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor <= $${parametro}`;
      valores.push(Number(valor_maximo));
    }

    if (data_inicio) {
      const parametro = valores.length + 1;

      filtro += ` AND data >= $${parametro}`;
      valores.push(data_inicio);
    }

    if (data_fim) {
      const parametro = valores.length + 1;

      filtro += ` AND data <= $${parametro}`;
      valores.push(data_fim);
    }

    const resultado = await pool.query(
      `SELECT *
             FROM despesas
             WHERE propriedade_id = $1
             ${filtro}
             ORDER BY data DESC, valor DESC`,
      valores,
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar despesas da propriedade",
    });
  }
});
// =========================
// RESUMO FINANCEIRO
// =========================

router.get("/propriedades/:id/despesas/resumo", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      periodo = "todos",
      categoria,
      valor_minimo,
      valor_maximo,
      data_inicio,
      data_fim,
    } = req.query;

    const propriedadeExiste = await pool.query(
      `SELECT id, nome, cidade, estado, area
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

    if (!["hoje", "semana", "mes", "todos"].includes(periodo)) {
      return res.status(400).json({
        mensagem: "Período inválido. Use hoje, semana, mes ou todos",
      });
    }

    if (valor_minimo && isNaN(Number(valor_minimo))) {
      return res.status(400).json({
        mensagem: "Valor mínimo inválido",
      });
    }

    if (valor_maximo && isNaN(Number(valor_maximo))) {
      return res.status(400).json({
        mensagem: "Valor máximo inválido",
      });
    }

    if (valor_minimo && Number(valor_minimo) < 0) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser negativo",
      });
    }

    if (valor_maximo && Number(valor_maximo) < 0) {
      return res.status(400).json({
        mensagem: "O valor máximo não pode ser negativo",
      });
    }

    if (
      valor_minimo &&
      valor_maximo &&
      Number(valor_minimo) > Number(valor_maximo)
    ) {
      return res.status(400).json({
        mensagem: "O valor mínimo não pode ser maior que o valor máximo",
      });
    }

    if (data_inicio && isNaN(Date.parse(data_inicio))) {
      return res.status(400).json({
        mensagem: "Data inicial inválida",
      });
    }

    if (data_fim && isNaN(Date.parse(data_fim))) {
      return res.status(400).json({
        mensagem: "Data final inválida",
      });
    }

    if (data_inicio && data_fim && new Date(data_inicio) > new Date(data_fim)) {
      return res.status(400).json({
        mensagem: "A data inicial não pode ser posterior à data final",
      });
    }

    if (periodo !== "todos" && (data_inicio || data_fim)) {
      return res.status(400).json({
        mensagem:
          "Use periodo ou intervalo de datas, não os dois ao mesmo tempo",
      });
    }

    const valores = [id];
    let filtro = "";

    if (periodo === "hoje") {
      filtro += " AND data = CURRENT_DATE";
    }

    if (periodo === "semana") {
      filtro += `
                AND data BETWEEN CURRENT_DATE - INTERVAL '7 days'
                AND CURRENT_DATE
            `;
    }

    if (periodo === "mes") {
      filtro += `
                AND data BETWEEN DATE_TRUNC('month', CURRENT_DATE)
                AND CURRENT_DATE
            `;
    }

    if (categoria) {
      const parametro = valores.length + 1;

      filtro += ` AND categoria = $${parametro}`;
      valores.push(categoria);
    }

    if (valor_minimo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor >= $${parametro}`;
      valores.push(Number(valor_minimo));
    }

    if (valor_maximo) {
      const parametro = valores.length + 1;

      filtro += ` AND valor <= $${parametro}`;
      valores.push(Number(valor_maximo));
    }

    if (data_inicio) {
      const parametro = valores.length + 1;

      filtro += ` AND data >= $${parametro}`;
      valores.push(data_inicio);
    }

    if (data_fim) {
      const parametro = valores.length + 1;

      filtro += ` AND data <= $${parametro}`;
      valores.push(data_fim);
    }

    const resumoResultado = await pool.query(
      `SELECT
        COALESCE(SUM(valor), 0) AS total,
        COALESCE(ROUND(AVG(valor), 2), 0) AS media,
        COALESCE(MAX(valor), 0) AS maior,
        COALESCE(MIN(valor), 0) AS menor,
        COUNT(*) AS quantidade
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}`,
      valores,
    );

    const categoriasResultado = await pool.query(
      `SELECT
        categoria,
        COALESCE(SUM(valor), 0) AS total,
        COUNT(*) AS quantidade,
        COALESCE(ROUND(AVG(valor), 2), 0) AS media
     FROM despesas
     WHERE propriedade_id = $1
     ${filtro}
     GROUP BY categoria
     ORDER BY total DESC`,
      valores,
    );

    const propriedade = propriedadeExiste.rows[0];

    const dadosPropriedade = {
      id: propriedade.id,
      nome: propriedade.nome,
      cidade: propriedade.cidade,
      estado: propriedade.estado,
      area: propriedade.area,
    };

    res.json({
      propriedade: dadosPropriedade,

      resumo: {
        total: resumoResultado.rows[0].total,
        media: resumoResultado.rows[0].media,
        maior: resumoResultado.rows[0].maior,
        menor: resumoResultado.rows[0].menor,
        quantidade: resumoResultado.rows[0].quantidade,
      },

      categorias: categoriasResultado.rows,
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao buscar resumo de despesas",
    });
  }
});

module.exports = router;

