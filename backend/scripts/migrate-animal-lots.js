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
      "004_animais_lotes_on_delete_cascade.sql",
    ),
    "utf8",
  );

  try {
    await pool.query(sql);
    console.log("Migration de animais e lotes concluida.");
  } finally {
    await pool.end();
  }
}

executar().catch((erro) => {
  console.error(`Erro na migration: ${erro.message}`);
  process.exit(1);
});
