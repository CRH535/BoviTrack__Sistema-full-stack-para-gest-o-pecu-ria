const express = require("express");
const pool = require("../database/pool");
const {
  buscarAnimalPermitido,
  buscarLoteCompativel,
  buscarMaeCompativel,
} = require("../services/acessoAnimais");
const { converterId, normalizarDataCalendario, normalizarDesmama } = require("../utils/validacoes");

const router = express.Router();

async function buscarDesmamaPermitida(id, usuario, cliente = pool, bloquear = false) {
  const resultado = await cliente.query(
    `SELECT d.*, a.propriedade_id, a.data_nascimento, a.nome AS animal,
            a.numero_brinco, a.mae_id AS mae_cadastrada_id
       FROM desmamas d
       JOIN animais a ON a.id = d.animal_id
       JOIN propriedades p ON p.id = a.propriedade_id
      WHERE d.id = $1
        AND ($2 = 'admin' OR p.usuario_id = $3)
      ${bloquear ? "FOR UPDATE OF d" : ""}`,
    [id, usuario.perfil, usuario.id],
  );
  return resultado.rows[0] || null;
}

async function validarReferencias(dados, animal, usuario, cliente = pool) {
  if (dados.maeId && !(await buscarMaeCompativel(dados.maeId, animal, usuario, cliente))) {
    return "A mãe deve ser uma fêmea da mesma propriedade e diferente do animal";
  }
  if (dados.loteDestinoId && !(await buscarLoteCompativel(dados.loteDestinoId, animal.propriedade_id, usuario, cliente))) {
    return "Lote de destino não encontrado na propriedade do animal";
  }
  return null;
}

async function buscarAlertasManejo(animalId, dataReferencia, cliente = pool) {
  if (!dataReferencia) return [];
  const resultado = await cliente.query(
    `SELECT vc.id, vc.proxima_dose, v.nome AS vacina
       FROM vacinacoes vc
       JOIN vacinas v ON v.id = vc.vacina_id
      WHERE vc.animal_id = $1
        AND vc.proxima_dose BETWEEN $2::date - 3 AND $2::date + 3
      ORDER BY vc.proxima_dose`,
    [animalId, dataReferencia],
  );
  return resultado.rows.map((item) => ({
    tipo: "VACINACAO_PROXIMA",
    mensagem: "Existe uma vacinação programada próxima à data da desmama. Considere revisar o planejamento dos manejos.",
    ...item,
  }));
}

const SELECT_DESMAMA = `
  SELECT d.id, d.animal_id, a.nome AS animal, a.numero_brinco,
         a.data_nascimento, a.propriedade_id, p.nome AS propriedade,
         d.mae_id, m.nome AS mae, m.numero_brinco AS mae_brinco,
         d.data_planejada, d.data_inicio, d.data_fim, d.data_desmama,
         d.tipo_desmama, d.peso_desmama_id, pe.peso_kg AS peso_desmama,
         pe.metodo AS metodo_pesagem, d.lote_destino_id,
         l.nome AS lote_destino, d.status, d.suplementacao, d.observacao,
         d.created_at, d.updated_at,
         CASE WHEN d.data_desmama IS NOT NULL AND a.data_nascimento IS NOT NULL
              THEN d.data_desmama - a.data_nascimento ELSE NULL END AS idade_desmama_dias,
         up.peso_kg AS ultimo_peso, up.data_pesagem AS data_ultima_pesagem
    FROM desmamas d
    JOIN animais a ON a.id = d.animal_id
    JOIN propriedades p ON p.id = a.propriedade_id
    LEFT JOIN animais m ON m.id = d.mae_id
    LEFT JOIN pesagens pe ON pe.id = d.peso_desmama_id
    LEFT JOIN lotes l ON l.id = d.lote_destino_id
    LEFT JOIN LATERAL (
      SELECT px.peso_kg, px.data_pesagem
        FROM pesagens px WHERE px.animal_id = a.id
       ORDER BY px.data_pesagem DESC, px.id DESC LIMIT 1
    ) up ON TRUE`;

router.get("/animais/:animalId/desmamas", async (req, res) => {
  try {
    const animalId = converterId(req.params.animalId);
    if (!animalId) return res.status(400).json({ mensagem: "ID do animal inválido" });
    const animal = await buscarAnimalPermitido(animalId, req.usuario);
    if (!animal) return res.status(404).json({ mensagem: "Animal não encontrado" });
    const resultado = await pool.query(
      `${SELECT_DESMAMA}
        WHERE d.animal_id = $1
        ORDER BY d.data_planejada DESC, d.id DESC`,
      [animalId],
    );
    const alertas = [];
    for (const evento of resultado.rows.filter((item) => ["PLANEJADA", "EM_ANDAMENTO"].includes(item.status))) {
      alertas.push(...await buscarAlertasManejo(animalId, evento.data_planejada));
    }
    const definitiva = resultado.rows.find((item) => (
      item.status === "CONCLUIDA" && item.tipo_desmama !== "TEMPORARIA"
    ));
    res.json({
      eventos: resultado.rows.map((item) => ({
        ...item,
        peso_desmama: item.peso_desmama == null ? null : Number(item.peso_desmama),
        ultimo_peso: item.ultimo_peso == null ? null : Number(item.ultimo_peso),
      })),
      status_atual: definitiva ? "DESMAMADO" : "NAO_DESMAMADO",
      desmama_definitiva: definitiva || null,
      alertas,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar histórico de desmama" });
  }
});

router.post("/animais/:animalId/desmamas", async (req, res) => {
  try {
    const animalId = converterId(req.params.animalId);
    if (!animalId) return res.status(400).json({ mensagem: "ID do animal inválido" });
    const animal = await buscarAnimalPermitido(animalId, req.usuario);
    if (!animal) return res.status(404).json({ mensagem: "Animal não encontrado" });
    const normalizada = normalizarDesmama(req.body);
    if (normalizada.erro) return res.status(400).json({ mensagem: normalizada.erro });
    const dados = normalizada.valor;
    dados.maeId = dados.maeId || animal.mae_id || null;
    const erroReferencias = await validarReferencias(dados, animal, req.usuario);
    if (erroReferencias) return res.status(400).json({ mensagem: erroReferencias });

    if (dados.tipoDesmama !== "TEMPORARIA") {
      const ativa = await pool.query(
        `SELECT 1 FROM desmamas
          WHERE animal_id = $1 AND tipo_desmama <> 'TEMPORARIA'
            AND status <> 'CANCELADA' LIMIT 1`,
        [animalId],
      );
      if (ativa.rows.length) return res.status(409).json({ mensagem: "O animal já possui uma desmama definitiva registrada" });
    }

    const resultado = await pool.query(
      `INSERT INTO desmamas
              (animal_id, mae_id, data_planejada, data_inicio, data_fim,
               tipo_desmama, lote_destino_id, status, suplementacao,
               observacao, registrado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [animalId, dados.maeId, dados.dataPlanejada, dados.dataInicio, dados.dataFim,
        dados.tipoDesmama, dados.loteDestinoId, dados.status,
        dados.suplementacao, dados.observacao, req.usuario.id],
    );
    const alertas = await buscarAlertasManejo(animalId, dados.dataPlanejada);
    res.status(201).json({ mensagem: "Desmama planejada com sucesso!", desmama: resultado.rows[0], alertas });
  } catch (erro) {
    if (erro.code === "23505" && erro.constraint === "desmamas_definitiva_unica_idx") {
      return res.status(409).json({ mensagem: "O animal já possui uma desmama definitiva registrada" });
    }
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao planejar desmama" });
  }
});

router.put("/desmamas/:id", async (req, res) => {
  try {
    const id = converterId(req.params.id);
    if (!id) return res.status(400).json({ mensagem: "ID da desmama inválido" });
    const atual = await buscarDesmamaPermitida(id, req.usuario);
    if (!atual) return res.status(404).json({ mensagem: "Desmama não encontrada" });
    if (["CONCLUIDA", "CANCELADA"].includes(atual.status)) {
      return res.status(409).json({ mensagem: "Eventos concluídos ou cancelados permanecem somente no histórico" });
    }
    const normalizada = normalizarDesmama(req.body);
    if (normalizada.erro) return res.status(400).json({ mensagem: normalizada.erro });
    const dados = normalizada.valor;
    dados.maeId = dados.maeId || atual.mae_cadastrada_id || null;
    const animal = await buscarAnimalPermitido(atual.animal_id, req.usuario);
    const erroReferencias = await validarReferencias(dados, animal, req.usuario);
    if (erroReferencias) return res.status(400).json({ mensagem: erroReferencias });

    const resultado = await pool.query(
      `UPDATE desmamas SET mae_id=$1, data_planejada=$2, data_inicio=$3,
              data_fim=$4, tipo_desmama=$5, lote_destino_id=$6, status=$7,
              suplementacao=$8, observacao=$9, updated_at=CURRENT_TIMESTAMP
        WHERE id=$10 RETURNING *`,
      [dados.maeId, dados.dataPlanejada, dados.dataInicio, dados.dataFim,
        dados.tipoDesmama, dados.loteDestinoId, dados.status,
        dados.suplementacao, dados.observacao, id],
    );
    const alertas = await buscarAlertasManejo(atual.animal_id, dados.dataPlanejada);
    res.json({ mensagem: "Planejamento atualizado com sucesso!", desmama: resultado.rows[0], alertas });
  } catch (erro) {
    if (erro.code === "23505" && erro.constraint === "desmamas_definitiva_unica_idx") {
      return res.status(409).json({ mensagem: "O animal já possui uma desmama definitiva registrada" });
    }
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar desmama" });
  }
});

router.post("/desmamas/:id/concluir", async (req, res) => {
  const cliente = await pool.connect();
  try {
    const id = converterId(req.params.id);
    if (!id) return res.status(400).json({ mensagem: "ID da desmama inválido" });
    await cliente.query("BEGIN");
    const atual = await buscarDesmamaPermitida(id, req.usuario, cliente, true);
    if (!atual) {
      await cliente.query("ROLLBACK");
      return res.status(404).json({ mensagem: "Desmama não encontrada" });
    }
    if (atual.status === "CONCLUIDA") {
      await cliente.query("ROLLBACK");
      return res.status(409).json({ mensagem: "A desmama já foi concluída" });
    }
    if (atual.status === "CANCELADA") {
      await cliente.query("ROLLBACK");
      return res.status(409).json({ mensagem: "Uma desmama cancelada não pode ser concluída" });
    }

    const animal = await buscarAnimalPermitido(atual.animal_id, req.usuario);
    const loteId = req.body.lote_destino_id ? converterId(req.body.lote_destino_id) : atual.lote_destino_id;
    if (loteId && !(await buscarLoteCompativel(loteId, animal.propriedade_id, req.usuario, cliente))) {
      await cliente.query("ROLLBACK");
      return res.status(400).json({ mensagem: "Lote de destino não pertence à propriedade do animal" });
    }

    if (atual.tipo_desmama === "TEMPORARIA") {
      const dataFim = normalizarDataCalendario(req.body.data_fim, "Data de fim");
      if (dataFim.erro || !atual.data_inicio || dataFim.valor < String(atual.data_inicio)) {
        await cliente.query("ROLLBACK");
        return res.status(400).json({ mensagem: dataFim.erro || "Data de fim inválida para a desmama temporária" });
      }
      const resultado = await cliente.query(
        `UPDATE desmamas SET data_fim=$1, lote_destino_id=$2, status='CONCLUIDA',
                observacao=COALESCE($3, observacao), updated_at=CURRENT_TIMESTAMP
          WHERE id=$4 RETURNING *`,
        [dataFim.valor, loteId, req.body.observacao?.trim() || null, id],
      );
      await cliente.query("COMMIT");
      return res.json({ mensagem: "Período de desmama temporária concluído; o animal não foi marcado como definitivamente desmamado.", desmama: resultado.rows[0] });
    }

    const data = normalizarDataCalendario(req.body.data_desmama, "Data da desmama");
    const peso = Number(req.body.peso_kg);
    const metodos = new Set(["BALANCA", "FITA", "ESTIMATIVA", "OUTRO"]);
    const metodo = req.body.metodo ? String(req.body.metodo).toUpperCase() : null;
    if (data.erro || !Number.isFinite(peso) || peso <= 0 || (metodo && !metodos.has(metodo))) {
      await cliente.query("ROLLBACK");
      return res.status(400).json({ mensagem: data.erro || "Informe um peso válido e um método permitido" });
    }
    if (animal.data_nascimento && data.valor < animal.data_nascimento) {
      await cliente.query("ROLLBACK");
      return res.status(400).json({ mensagem: "A desmama não pode ser anterior ao nascimento" });
    }

    const pesagem = await cliente.query(
      `INSERT INTO pesagens
              (animal_id, data_pesagem, peso_kg, tipo_pesagem, metodo,
               lote_id, observacao, registrado_por)
       VALUES ($1,$2,$3,'DESMAMA',$4,$5,$6,$7) RETURNING *`,
      [animal.id, data.valor, peso, metodo, loteId,
        req.body.observacao?.trim() || atual.observacao, req.usuario.id],
    );
    const resultado = await cliente.query(
      `UPDATE desmamas SET data_desmama=$1, peso_desmama_id=$2,
              lote_destino_id=$3, status='CONCLUIDA',
              observacao=COALESCE($4, observacao), updated_at=CURRENT_TIMESTAMP
        WHERE id=$5 RETURNING *`,
      [data.valor, pesagem.rows[0].id, loteId, req.body.observacao?.trim() || null, id],
    );
    if (loteId) {
      await cliente.query(
        `INSERT INTO animais_lotes (animal_id, lote_id) VALUES ($1,$2)
         ON CONFLICT (animal_id, lote_id) DO NOTHING`,
        [animal.id, loteId],
      );
    }
    await cliente.query(
      `UPDATE animais SET peso=$1 WHERE id=$2`,
      [peso, animal.id],
    );
    await cliente.query("COMMIT");
    res.json({ mensagem: "Desmama concluída e pesagem registrada com sucesso!", desmama: resultado.rows[0], pesagem: pesagem.rows[0] });
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => {});
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao concluir desmama" });
  } finally {
    cliente.release();
  }
});

router.post("/desmamas/:id/cancelar", async (req, res) => {
  try {
    const id = converterId(req.params.id);
    if (!id) return res.status(400).json({ mensagem: "ID da desmama inválido" });
    const resultado = await pool.query(
      `UPDATE desmamas d SET status='CANCELADA',
              observacao=COALESCE($1, observacao), updated_at=CURRENT_TIMESTAMP
        WHERE d.id=$2 AND d.status IN ('PLANEJADA','EM_ANDAMENTO')
          AND EXISTS (
            SELECT 1 FROM animais a JOIN propriedades p ON p.id=a.propriedade_id
             WHERE a.id=d.animal_id AND ($3='admin' OR p.usuario_id=$4)
          ) RETURNING d.*`,
      [req.body.observacao?.trim() || null, id, req.usuario.perfil, req.usuario.id],
    );
    if (!resultado.rows[0]) return res.status(404).json({ mensagem: "Desmama ativa não encontrada" });
    res.json({ mensagem: "Planejamento cancelado e mantido no histórico.", desmama: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao cancelar desmama" });
  }
});

router.get("/desmamas", async (req, res) => {
  try {
    const propriedadeId = req.query.propriedade_id ? converterId(req.query.propriedade_id) : null;
    const loteId = req.query.lote_id ? converterId(req.query.lote_id) : null;
    const status = req.query.status ? String(req.query.status).toUpperCase() : null;
    const tipo = req.query.tipo ? String(req.query.tipo).toUpperCase() : null;
    const busca = String(req.query.busca || "").trim();
    if ((req.query.propriedade_id && !propriedadeId) || (req.query.lote_id && !loteId)) {
      return res.status(400).json({ mensagem: "Filtro de ID inválido" });
    }
    if (status && !["PLANEJADA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"].includes(status)) {
      return res.status(400).json({ mensagem: "Status de desmama inválido" });
    }
    if (tipo && !["CONVENCIONAL", "LADO_A_LADO", "ABRUPTA", "PRECOCE", "TEMPORARIA", "CONTROLADA", "OUTRA"].includes(tipo)) {
      return res.status(400).json({ mensagem: "Tipo de desmama inválido" });
    }
    const resultado = await pool.query(
      `${SELECT_DESMAMA}
        WHERE ($1='admin' OR p.usuario_id=$2)
          AND ($3::integer IS NULL OR p.id=$3)
          AND ($4::integer IS NULL OR d.lote_destino_id=$4)
          AND ($5::text IS NULL OR d.status=$5)
          AND ($6::text IS NULL OR d.tipo_desmama=$6)
          AND ($7='' OR a.nome ILIKE '%'||$7||'%' OR COALESCE(a.numero_brinco,'') ILIKE '%'||$7||'%')
        ORDER BY CASE d.status WHEN 'EM_ANDAMENTO' THEN 1 WHEN 'PLANEJADA' THEN 2 WHEN 'CONCLUIDA' THEN 3 ELSE 4 END,
                 d.data_planejada DESC, d.id DESC LIMIT 500`,
      [req.usuario.perfil, req.usuario.id, propriedadeId, loteId, status, tipo, busca],
    );
    res.json(resultado.rows.map((item) => ({
      ...item,
      peso_desmama: item.peso_desmama == null ? null : Number(item.peso_desmama),
      ultimo_peso: item.ultimo_peso == null ? null : Number(item.ultimo_peso),
    })));
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar desmamas" });
  }
});

module.exports = router;
