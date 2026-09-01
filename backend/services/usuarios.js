const bcrypt = require("bcryptjs");
const pool = require("../database/pool");

function criarErroValidacao(mensagem, status = 400) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function validarSenha(senha) {
  if (typeof senha !== "string" || senha.length < 8) {
    throw criarErroValidacao("A senha deve possuir pelo menos 8 caracteres");
  }

  if (Buffer.byteLength(senha, "utf8") > 72) {
    throw criarErroValidacao("A senha deve possuir no máximo 72 bytes em UTF-8");
  }
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

  validarSenha(senha);

  const emailExistente = await pool.query(
    "SELECT 1 FROM usuarios WHERE email = $1",
    [email],
  );

  if (emailExistente.rows.length > 0) {
    // Mantém custo semelhante ao cadastro válido e reduz enumeração por tempo.
    await bcrypt.hash(senha, 12);
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

async function excluirUsuarioComDados(usuarioId) {
  const id = Number(usuarioId);

  if (!Number.isInteger(id) || id <= 0) {
    throw criarErroValidacao("Usuário inválido");
  }

  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    const usuarioResultado = await cliente.query(
      `SELECT id, nome, email, perfil
         FROM usuarios
        WHERE id = $1
        FOR UPDATE`,
      [id],
    );

    if (usuarioResultado.rows.length === 0) {
      throw criarErroValidacao("Usuário não encontrado", 404);
    }

    const usuario = usuarioResultado.rows[0];

    if (usuario.perfil === "admin") {
      throw criarErroValidacao(
        "A conta do administrador principal não pode ser excluída",
        403,
      );
    }

    const exclusoes = {};

    exclusoes.vacinacoes = (
      await cliente.query(
        `DELETE FROM vacinacoes
          WHERE animal_id IN (
                  SELECT a.id
                    FROM animais a
                    JOIN propriedades p ON p.id = a.propriedade_id
                   WHERE p.usuario_id = $1
                )
             OR vacina_id IN (
                  SELECT v.id
                    FROM vacinas v
                   WHERE v.usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.producoes_leiteiras = (
      await cliente.query(
        `DELETE FROM producoes_leiteiras
          WHERE animal_id IN (
                  SELECT a.id
                    FROM animais a
                    JOIN propriedades p ON p.id = a.propriedade_id
                   WHERE p.usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.animais_lotes = (
      await cliente.query(
        `DELETE FROM animais_lotes
          WHERE animal_id IN (
                  SELECT a.id
                    FROM animais a
                    JOIN propriedades p ON p.id = a.propriedade_id
                   WHERE p.usuario_id = $1
                )
             OR lote_id IN (
                  SELECT l.id
                    FROM lotes l
                    JOIN propriedades p ON p.id = l.propriedade_id
                   WHERE p.usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.despesas = (
      await cliente.query(
        `DELETE FROM despesas
          WHERE propriedade_id IN (
                  SELECT id FROM propriedades WHERE usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.receitas = (
      await cliente.query(
        `DELETE FROM receitas
          WHERE propriedade_id IN (
                  SELECT id FROM propriedades WHERE usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.lotes = (
      await cliente.query(
        `DELETE FROM lotes
          WHERE propriedade_id IN (
                  SELECT id FROM propriedades WHERE usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.animais = (
      await cliente.query(
        `DELETE FROM animais
          WHERE propriedade_id IN (
                  SELECT id FROM propriedades WHERE usuario_id = $1
                )`,
        [id],
      )
    ).rowCount;

    exclusoes.vacinas = (
      await cliente.query("DELETE FROM vacinas WHERE usuario_id = $1", [id])
    ).rowCount;

    exclusoes.propriedades = (
      await cliente.query("DELETE FROM propriedades WHERE usuario_id = $1", [id])
    ).rowCount;

    exclusoes.sessoes_refresh = (
      await cliente.query("DELETE FROM sessoes_refresh WHERE usuario_id = $1", [id])
    ).rowCount;

    await cliente.query("DELETE FROM usuarios WHERE id = $1", [id]);
    await cliente.query("COMMIT");

    return { usuario, exclusoes };
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = { criarUsuarioComum, excluirUsuarioComDados, validarSenha };
