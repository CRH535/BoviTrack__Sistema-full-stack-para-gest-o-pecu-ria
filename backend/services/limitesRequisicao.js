const crypto = require("crypto");
const pool = require("../database/pool");

function hashChave(chave) {
  return crypto.createHash("sha256").update(String(chave)).digest("hex");
}

async function consumirLimite({ escopo, chave, limite, janelaMs, executor = pool }) {
  const agora = Date.now();
  const inicioMs = Math.floor(agora / janelaMs) * janelaMs;
  const janelaInicio = new Date(inicioMs);
  const janelaFim = new Date(inicioMs + janelaMs);
  const chaveHash = hashChave(chave);

  const resultado = await executor.query(
    `INSERT INTO limites_requisicao
            (escopo, chave_hash, janela_inicio, janela_fim, contador)
     VALUES ($1, $2, $3, $4, 1)
     ON CONFLICT (escopo, chave_hash, janela_inicio)
     DO UPDATE SET contador = limites_requisicao.contador + 1
     RETURNING contador`,
    [escopo, chaveHash, janelaInicio, janelaFim],
  );

  if (Math.random() < 0.01) {
    executor.query(
      "DELETE FROM limites_requisicao WHERE janela_fim < CURRENT_TIMESTAMP - INTERVAL '1 day'",
    ).catch(() => {});
  }

  return {
    permitido: resultado.rows[0].contador <= limite,
    restante: Math.max(0, limite - resultado.rows[0].contador),
    retryAfter: Math.max(1, Math.ceil((janelaFim.getTime() - agora) / 1000)),
    chaveHashPrefixo: chaveHash.slice(0, 12),
  };
}

module.exports = { consumirLimite, hashChave };
