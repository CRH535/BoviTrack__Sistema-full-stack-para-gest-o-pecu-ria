require("dotenv").config();

const pool = require("../database/pool");

const TABELAS = [
  "usuarios",
  "sessoes_refresh",
  "propriedades",
  "animais",
  "lotes",
  "animais_lotes",
  "vacinas",
  "vacinacoes",
  "despesas",
];

const TABELAS_COM_SEQUENCE = TABELAS.filter(
  (tabela) => tabela !== "animais_lotes",
);

async function executar() {
  const versao = await pool.query("SHOW server_version");
  const tabelas = await pool.query(
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
      ORDER BY table_name`,
    [TABELAS],
  );
  const encontradas = new Set(tabelas.rows.map((linha) => linha.table_name));
  const ausentes = TABELAS.filter((tabela) => !encontradas.has(tabela));

  if (ausentes.length > 0) {
    throw new Error(`Tabelas ausentes: ${ausentes.join(", ")}`);
  }

  const contagens = [];

  for (const tabela of TABELAS) {
    const resultado = await pool.query(
      `SELECT COUNT(*)::integer AS total FROM public."${tabela}"`,
    );
    contagens.push({ tabela, registros: resultado.rows[0].total });
  }

  const orfaos = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM propriedades p LEFT JOIN usuarios u ON u.id = p.usuario_id WHERE u.id IS NULL)::integer
         AS propriedades_sem_usuario,
       (SELECT COUNT(*) FROM animais a LEFT JOIN propriedades p ON p.id = a.propriedade_id WHERE p.id IS NULL)::integer
         AS animais_sem_propriedade,
       (SELECT COUNT(*) FROM lotes l LEFT JOIN propriedades p ON p.id = l.propriedade_id WHERE p.id IS NULL)::integer
         AS lotes_sem_propriedade,
       (SELECT COUNT(*) FROM despesas d LEFT JOIN propriedades p ON p.id = d.propriedade_id WHERE p.id IS NULL)::integer
         AS despesas_sem_propriedade,
       (SELECT COUNT(*) FROM vacinas v LEFT JOIN usuarios u ON u.id = v.usuario_id WHERE u.id IS NULL)::integer
         AS vacinas_sem_usuario,
       (SELECT COUNT(*) FROM sessoes_refresh sr LEFT JOIN usuarios u ON u.id = sr.usuario_id WHERE u.id IS NULL)::integer
         AS sessoes_sem_usuario,
       (SELECT COUNT(*) FROM vacinacoes vc LEFT JOIN animais a ON a.id = vc.animal_id WHERE a.id IS NULL)::integer
         AS vacinacoes_sem_animal,
       (SELECT COUNT(*) FROM vacinacoes vc LEFT JOIN vacinas v ON v.id = vc.vacina_id WHERE v.id IS NULL)::integer
         AS vacinacoes_sem_vacina,
       (SELECT COUNT(*) FROM animais_lotes al LEFT JOIN animais a ON a.id = al.animal_id WHERE a.id IS NULL)::integer
         AS relacoes_sem_animal,
       (SELECT COUNT(*) FROM animais_lotes al LEFT JOIN lotes l ON l.id = al.lote_id WHERE l.id IS NULL)::integer
         AS relacoes_sem_lote`,
  );
  const problemas = Object.entries(orfaos.rows[0]).filter(([, total]) => total > 0);

  if (problemas.length > 0) {
    throw new Error(
      `Relacionamentos orfaos: ${problemas.map(([nome, total]) => `${nome}=${total}`).join(", ")}`,
    );
  }

  for (const tabela of TABELAS_COM_SEQUENCE) {
    const sequence = await pool.query(
      `SELECT pg_get_serial_sequence($1, 'id') AS nome`,
      [`public.${tabela}`],
    );

    if (!sequence.rows[0].nome) {
      throw new Error(`Sequence do ID nao encontrada para ${tabela}`);
    }

    const posicao = await pool.query(
      `SELECT MAX(id)::bigint AS maior_id,
              (SELECT last_value FROM public."${tabela}_id_seq")::bigint AS ultimo_valor
         FROM public."${tabela}"`,
    );
    const { maior_id, ultimo_valor } = posicao.rows[0];

    if (maior_id !== null && Number(ultimo_valor) < Number(maior_id)) {
      throw new Error(
        `Sequence de ${tabela} esta atrasada: ${ultimo_valor} < ${maior_id}`,
      );
    }
  }

  console.log(`PostgreSQL ${versao.rows[0].server_version}`);
  console.table(contagens);
  console.log("Schema e relacionamentos do AgroControl validados com sucesso.");
}

executar()
  .catch((erro) => {
    console.error(`Falha na verificacao: ${erro.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
