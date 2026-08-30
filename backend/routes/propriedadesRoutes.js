const express = require("express");
const pool = require("../database/pool")
const { normalizarPaginacao, responderPagina, validarCamposPermitidos, normalizarTextoObrigatorio, normalizarNumeroFinito } = require("../utils/validacoes");
const { validarParametroId } = require("../middleware/validacao");
const { registrarErro } = require("../utils/log");

const router = express.Router();
router.param("id", validarParametroId);

router.get("/propriedades", async (req, res) => {
  try {
    const paginacao = normalizarPaginacao(req.query);
    if (paginacao.erro) return res.status(400).json({ mensagem: paginacao.erro });
    const { limite, offset } = paginacao.valor;
    const resultado = await pool.query(
      `SELECT id, nome, cidade, estado, area, usuario_id
         FROM propriedades
        WHERE ($1 = 'admin' OR usuario_id = $2)
        ORDER BY id
        LIMIT $3 OFFSET $4`,
      [req.usuario.perfil, req.usuario.id, limite + 1, offset],
    );

    res.json(responderPagina(res, resultado.rows, paginacao.valor));
  } catch (erro) {
    registrarErro("propriedades_rota_erro", erro, req);

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
    registrarErro("propriedades_rota_erro", erro, req);

    res.status(500).json({
      mensagem: "Erro ao buscar propriedade",
    });
  }
});

router.post("/propriedades", async (req, res) => {
  try {
    const campos = validarCamposPermitidos(req.body, ["nome", "cidade", "estado", "area"]);
    if (campos.erro) return res.status(400).json({ mensagem: campos.erro });
    const nome = normalizarTextoObrigatorio(req.body.nome, "Nome", 120);
    const cidade = normalizarTextoObrigatorio(req.body.cidade, "Cidade", 120);
    const estado = normalizarTextoObrigatorio(req.body.estado, "Estado", 2, 2);
    const area = normalizarNumeroFinito(req.body.area, "Área", { minimo: 0.01, maximo: 1e9 });
    const erro = nome.erro || cidade.erro || estado.erro || area.erro;
    if (erro) return res.status(400).json({ mensagem: erro });

    const resultado = await pool.query(
      `INSERT INTO propriedades (nome, cidade, estado, area, usuario_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [nome.valor, cidade.valor, estado.valor.toUpperCase(), area.valor, req.usuario.id],
    );

    res.status(201).json({
      mensagem: "Propriedade cadastrada com sucesso!",
      propriedade: resultado.rows[0],
    });
  } catch (erro) {
    registrarErro("propriedades_rota_erro", erro, req);

    res.status(500).json({
      mensagem: "Erro ao cadastrar propriedade",
    });
  }
});

router.put("/propriedades/:id", async (req, res) => {
  try {
    const campos = validarCamposPermitidos(req.body, ["nome", "cidade", "estado", "area"]);
    if (campos.erro) return res.status(400).json({ mensagem: campos.erro });
    const { id } = req.params;
    const nome = normalizarTextoObrigatorio(req.body.nome, "Nome", 120);
    const cidade = normalizarTextoObrigatorio(req.body.cidade, "Cidade", 120);
    const estado = normalizarTextoObrigatorio(req.body.estado, "Estado", 2, 2);
    const area = normalizarNumeroFinito(req.body.area, "Área", { minimo: 0.01, maximo: 1e9 });
    const erro = nome.erro || cidade.erro || estado.erro || area.erro;
    if (erro) return res.status(400).json({ mensagem: erro });

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
        nome.valor,
        cidade.valor,
        estado.valor.toUpperCase(),
        area.valor,
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
    registrarErro("propriedades_rota_erro", erro, req);

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
    registrarErro("propriedades_rota_erro", erro, req);

    res.status(500).json({
      mensagem: "Erro ao excluir propriedade",
    });
  }
});
// =========================
// ANIMAIS
// =========================

module.exports = router;
