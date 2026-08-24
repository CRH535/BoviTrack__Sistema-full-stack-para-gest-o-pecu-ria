require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../database/pool");

async function executar() {
  const sql = fs.readFileSync(
    path.join(
      __dirname,
      "..",
      "database",
      "migrations",
      "005_adicionar_brinco_nascimento_animais.sql",
    ),
    "utf8",
  );

  try {
    await pool.query(sql);
    console.log("Migration dos novos campos de animais concluida.");
  } finally {
    await pool.end();
  }
}

executar().catch((erro) => {
  console.error(`Erro na migration: ${erro.message}`);
  process.exit(1);
});
