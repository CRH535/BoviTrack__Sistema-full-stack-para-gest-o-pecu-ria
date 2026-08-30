require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { criarConfiguracaoPorUrl } = require("../database/config");

async function executar() {
  const url = process.env.SUPABASE_MIGRATION_URL;
  if (!url) throw new Error("SUPABASE_MIGRATION_URL não foi configurada");
  const cliente = new Client(criarConfiguracaoPorUrl(url, {
    sslMode: process.env.DB_SSL,
    sslCaPath: process.env.DB_SSL_CA_PATH,
    sslCaBase64: process.env.DB_SSL_CA_BASE64,
    producao: process.env.NODE_ENV === "production",
  }));
  const arquivos = ["009_seguranca_sessoes_rate_limit.sql", "010_hardening_supabase_runtime.sql"];
  try {
    await cliente.connect();
    for (const arquivo of arquivos) {
      const sql = fs.readFileSync(path.join(__dirname, "../database/migrations", arquivo), "utf8");
      await cliente.query(sql);
      console.log(`Migration aplicada: ${arquivo}`);
    }
  } finally {
    await cliente.end().catch(() => {});
  }
}

executar().catch((erro) => {
  console.error(`Falha ao aplicar migrations de segurança: ${erro.message}`);
  process.exitCode = 1;
});
