require("dotenv").config();

const pool = require("../database/pool");

async function verificar() {
  const runtime = await pool.query(
    `SELECT current_user, r.rolsuper, r.rolcreaterole,
            r.rolcreatedb, r.rolreplication, r.rolbypassrls
       FROM pg_roles r
      WHERE r.rolname = current_user`,
  );
  const grantsTabelas = await pool.query(
    `SELECT grantee, COUNT(1)::integer AS quantidade
       FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee IN ('anon', 'authenticated')
      GROUP BY grantee
      ORDER BY grantee`,
  );
  const grantsSequences = await pool.query(
    `SELECT grantee, COUNT(1)::integer AS quantidade
       FROM information_schema.usage_privileges
      WHERE object_schema = 'public'
        AND object_type = 'SEQUENCE'
        AND grantee IN ('anon', 'authenticated')
      GROUP BY grantee
      ORDER BY grantee`,
  );
  const grantsFuncoes = await pool.query(
    `SELECT grantee, COUNT(1)::integer AS quantidade
       FROM information_schema.routine_privileges
      WHERE specific_schema = 'public'
        AND privilege_type = 'EXECUTE'
        AND grantee IN ('PUBLIC', 'anon', 'authenticated')
      GROUP BY grantee
      ORDER BY grantee`,
  );
  const migration = await pool.query(
    `SELECT COUNT(1)::integer AS novas_colunas
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'sessoes_refresh'
        AND column_name IN ('session_id', 'family_id', 'revoked_at')`,
  );

  console.log(JSON.stringify({
    runtime: runtime.rows[0],
    grants_tabelas_publicos: grantsTabelas.rows,
    grants_sequences_publicos: grantsSequences.rows,
    grants_funcoes_publicos: grantsFuncoes.rows,
    colunas_migration_009: migration.rows[0].novas_colunas,
  }, null, 2));
}

verificar()
  .catch((erro) => {
    console.error(`Falha na verificação de segurança: ${erro.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
