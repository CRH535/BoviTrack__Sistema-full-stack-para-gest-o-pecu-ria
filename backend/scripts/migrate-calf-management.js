require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../database/pool");

async function executar() {
  const arquivo = path.join(
    __dirname,
    "..",
    "database",
    "migrations",
    "008_criar_pesagens_desmamas.sql",
  );

  await pool.query(fs.readFileSync(arquivo, "utf8"));
  console.log("Estrutura de pesagens e desmamas criada ou validada com sucesso.");
}

executar()
  .catch((erro) => {
    console.error(`Falha na migration de pesagens/desmamas: ${erro.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
