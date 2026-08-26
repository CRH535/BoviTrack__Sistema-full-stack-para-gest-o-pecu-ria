require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../database/pool");

const nome = process.env.ADMIN_NOME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_SENHA;

function lerMigracao(arquivo) {
  return fs.readFileSync(
    path.join(__dirname, "..", "database", "migrations", arquivo),
    "utf8",
  );
}

async function executar() {
  if (!nome || !email || !senha) {
    throw new Error(
      "Informe ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA para criar o administrador",
    );
  }

  if (senha.length < 8) {
    throw new Error("ADMIN_SENHA deve possuir pelo menos 8 caracteres");
  }

  const cliente = await pool.connect();

  try {
    await cliente.query(lerMigracao("001_criar_autenticacao.sql"));

    const adminAtual = await cliente.query(
      "SELECT id, email FROM usuarios WHERE perfil = 'admin'",
    );

    if (adminAtual.rows.length > 0 && adminAtual.rows[0].email !== email) {
      throw new Error(
        `Ja existe um administrador com o email ${adminAtual.rows[0].email}`,
      );
    }

    const hash = await bcrypt.hash(senha, 12);

    await cliente.query("BEGIN");

    await cliente.query(
      `INSERT INTO usuarios (nome, email, senha, perfil)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email)
       DO UPDATE SET nome = EXCLUDED.nome,
                     senha = EXCLUDED.senha,
                     perfil = 'admin'`,
      [nome, email, hash],
    );

    await cliente.query(lerMigracao("002_atribuir_dados_ao_admin.sql"));
    await cliente.query("COMMIT");

    console.log(`Migracao concluida. Administrador: ${email}`);
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => {});
    throw erro;
  } finally {
    cliente.release();
    await pool.end();
  }
}

executar().catch((erro) => {
  console.error(`Erro na migracao: ${erro.message}`);
  process.exit(1);
});
