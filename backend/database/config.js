const fs = require("fs");
const path = require("path");

const PARAMETROS_SSL_URL = ["sslmode", "sslcert", "sslkey", "sslrootcert"];

function inteiroPositivo(valor, nome) {
  if (valor === undefined || valor === "") {
    return undefined;
  }

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new Error(`${nome} deve ser um numero inteiro positivo`);
  }

  return numero;
}

function analisarUrl(conexao) {
  try {
    return new URL(conexao);
  } catch {
    throw new Error("A URL de conexao do PostgreSQL e invalida");
  }
}

function configurarSsl(conexao, modoRecebido, caminhoCaRecebido) {
  const url = conexao ? analisarUrl(conexao) : null;
  const possuiSslNaUrl = url
    ? PARAMETROS_SSL_URL.some((parametro) => url.searchParams.has(parametro))
    : false;
  const modo = modoRecebido?.trim().toLowerCase();
  const caminhoCa = caminhoCaRecebido?.trim();

  if (possuiSslNaUrl && (modo || caminhoCa)) {
    throw new Error(
      "Configure o SSL na URL ou em DB_SSL/DB_SSL_CA_PATH, nao nos dois locais",
    );
  }

  if (possuiSslNaUrl) {
    return undefined;
  }

  if (modo === "disable" || modo === "false") {
    return false;
  }

  if (modo === "verify-full") {
    if (!caminhoCa) {
      throw new Error("DB_SSL_CA_PATH e obrigatorio quando DB_SSL=verify-full");
    }

    const caminhoAbsoluto = path.resolve(caminhoCa);

    if (!fs.existsSync(caminhoAbsoluto)) {
      throw new Error(`Certificado SSL nao encontrado em ${caminhoAbsoluto}`);
    }

    return {
      ca: fs.readFileSync(caminhoAbsoluto, "utf8"),
      rejectUnauthorized: true,
    };
  }

  if (modo === "require" || modo === "true") {
    return { rejectUnauthorized: false };
  }

  if (modo) {
    throw new Error("DB_SSL deve ser disable, require ou verify-full");
  }

  if (
    url?.hostname.endsWith(".supabase.co") ||
    url?.hostname.endsWith(".supabase.com")
  ) {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

function criarConfiguracaoPorUrl(conexao, opcoes = {}) {
  if (typeof conexao !== "string" || !conexao.trim()) {
    throw new Error("A URL de conexao do PostgreSQL nao foi configurada");
  }

  const connectionString = conexao.trim();
  const configuracao = { connectionString };
  const ssl = configurarSsl(
    connectionString,
    opcoes.sslMode,
    opcoes.sslCaPath,
  );

  if (ssl !== undefined) {
    configuracao.ssl = ssl;
  }

  return configuracao;
}

function criarConfiguracaoLegada(ambiente = process.env) {
  const campos = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];
  const ausentes = campos.filter(
    (campo) => typeof ambiente[campo] !== "string" || !ambiente[campo].trim(),
  );

  if (ausentes.length > 0) {
    throw new Error(
      `Configure DATABASE_URL ou as variaveis ${ausentes.join(", ")}`,
    );
  }

  const configuracao = {
    user: ambiente.DB_USER,
    host: ambiente.DB_HOST,
    database: ambiente.DB_NAME,
    password: ambiente.DB_PASSWORD,
    port: inteiroPositivo(ambiente.DB_PORT, "DB_PORT"),
  };
  const ssl = configurarSsl(
    null,
    ambiente.DB_SSL,
    ambiente.DB_SSL_CA_PATH,
  );

  if (ssl !== undefined) {
    configuracao.ssl = ssl;
  }

  return configuracao;
}

function criarConfiguracaoBanco(ambiente = process.env) {
  const configuracao = ambiente.DATABASE_URL
    ? criarConfiguracaoPorUrl(ambiente.DATABASE_URL, {
        sslMode: ambiente.DB_SSL,
        sslCaPath: ambiente.DB_SSL_CA_PATH,
      })
    : criarConfiguracaoLegada(ambiente);
  const max = inteiroPositivo(ambiente.DB_POOL_MAX, "DB_POOL_MAX");
  const connectionTimeoutMillis = inteiroPositivo(
    ambiente.DB_CONNECTION_TIMEOUT_MS,
    "DB_CONNECTION_TIMEOUT_MS",
  );

  if (max !== undefined) {
    configuracao.max = max;
  }

  if (connectionTimeoutMillis !== undefined) {
    configuracao.connectionTimeoutMillis = connectionTimeoutMillis;
  }

  return configuracao;
}

module.exports = {
  criarConfiguracaoBanco,
  criarConfiguracaoLegada,
  criarConfiguracaoPorUrl,
};
