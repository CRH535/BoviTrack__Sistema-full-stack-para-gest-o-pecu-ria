require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { criarConfiguracaoPorUrl } = require("../database/config");

async function executar() {
  const url = process.env.SUPABASE_MIGRATION_URL;
  if (!url) {
    throw new Error(
      "SUPABASE_MIGRATION_URL não foi configurada com a credencial administrativa de migrations",
    );
  }

  const arquivo = path.join(
    __dirname,
    "..",
    "database",
    "migrations",
    "011_criar_receitas.sql",
  );

  const cliente = new Client(
    criarConfiguracaoPorUrl(url, {
      sslMode: process.env.DB_SSL,
      sslCaPath: process.env.DB_SSL_CA_PATH,
      sslCaBase64: process.env.DB_SSL_CA_BASE64,
      producao: process.env.NODE_ENV === "production",
    }),
  );

  try {
    await cliente.connect();
    await cliente.query(fs.readFileSync(arquivo, "utf8"));
    console.log("Estrutura de receitas criada ou validada com sucesso.");
  } finally {
    await cliente.end().catch(() => {});
  }
}

executar()
  .catch((erro) => {
    console.error(`Falha na migration de receitas: ${erro.message}`);
    process.exitCode = 1;
  });
