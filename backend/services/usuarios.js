const bcrypt = require("bcryptjs");
const pool = require("../database/pool");

function criarErroValidacao(mensagem, status = 400) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function criarUsuarioComum(body) {
  const { nome: nomeRecebido, email: emailRecebido, senha } = body;

  if (
    typeof nomeRecebido !== "string" ||
    typeof emailRecebido !== "string" ||
    typeof senha !== "string"
  ) {
    throw criarErroValidacao("Nome, email e senha são obrigatórios");
  }

  const nome = nomeRecebido.trim();
  const email = emailRecebido.trim().toLowerCase();

  if (!nome || !email || !senha) {
    throw criarErroValidacao("Nome, email e senha são obrigatórios");
  }

  if (nome.length > 120 || email.length > 255) {
    throw criarErroValidacao("Nome ou email excede o tamanho permitido");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw criarErroValidacao("Email inválido");
  }

  if (senha.length < 8) {
    throw criarErroValidacao("A senha deve possuir pelo menos 8 caracteres");
  }

  const emailExistente = await pool.query(
    "SELECT 1 FROM usuarios WHERE email = $1",
    [email],
  );

  if (emailExistente.rows.length > 0) {
    throw criarErroValidacao("Este email já está cadastrado", 409);
  }

  const hash = await bcrypt.hash(senha, 12);

  try {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, perfil, ativo)
       VALUES ($1, $2, $3, 'usuario', TRUE)
       RETURNING id, nome, email, perfil, ativo, created_at`,
      [nome, email, hash],
    );

    return resultado.rows[0];
  } catch (erro) {
    if (erro.code === "23505") {
      throw criarErroValidacao("Este email já está cadastrado", 409);
    }

    throw erro;
  }
}

module.exports = { criarUsuarioComum };
