require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../database/pool");

async function executar() {
  const arquivo = path.join(
    __dirname,
    "..",
    "database",
    "supabase",
    "003_sessoes_refresh.sql",
  );

  await pool.query(fs.readFileSync(arquivo, "utf8"));
  console.log("Tabela de sessoes de renovacao criada ou validada com sucesso.");
}

executar()
  .catch((erro) => {
    console.error(`Falha na migration de sessoes: ${erro.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
