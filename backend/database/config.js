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

function configurarSsl(
  conexao,
  modoRecebido,
  caminhoCaRecebido,
  caBase64Recebida,
  producao = false,
) {
  const url = conexao ? analisarUrl(conexao) : null;
  const possuiSslNaUrl = url
    ? PARAMETROS_SSL_URL.some((parametro) => url.searchParams.has(parametro))
    : false;
  const modo = modoRecebido?.trim().toLowerCase();
  const caminhoCa = caminhoCaRecebido?.trim();
  const caBase64 = caBase64Recebida?.trim();

  if (possuiSslNaUrl && (modo || caminhoCa || caBase64)) {
    throw new Error(
      "Configure o SSL na URL ou em DB_SSL/DB_SSL_CA_PATH, nao nos dois locais",
    );
  }

  if (possuiSslNaUrl) {
    if (producao && url.searchParams.get("sslmode") !== "verify-full") {
      throw new Error("DATABASE_URL deve usar sslmode=verify-full em producao");
    }
    return undefined;
  }

  if (modo === "disable" || modo === "false") {
    if (producao) throw new Error("DB_SSL nao pode ser desabilitado em producao");
    return false;
  }

  if (modo === "verify-full") {
    if (!caminhoCa && !caBase64) {
      throw new Error("DB_SSL_CA_PATH ou DB_SSL_CA_BASE64 e obrigatorio com verify-full");
    }
    let ca;
    if (caBase64) {
      ca = Buffer.from(caBase64, "base64").toString("utf8");
      if (!ca.includes("BEGIN CERTIFICATE")) {
        throw new Error("DB_SSL_CA_BASE64 nao contem um certificado PEM");
      }
    } else {
      const caminhoAbsoluto = path.resolve(caminhoCa);
      if (!fs.existsSync(caminhoAbsoluto)) {
        throw new Error(`Certificado SSL nao encontrado em ${caminhoAbsoluto}`);
      }
      ca = fs.readFileSync(caminhoAbsoluto, "utf8");
    }

    return { ca, rejectUnauthorized: true };
  }

  if (modo === "require" || modo === "true") {
    if (producao) {
      throw new Error(
        "DB_SSL=require nao valida o certificado; use verify-full em producao",
      );
    }
    return { rejectUnauthorized: false };
  }

  if (modo) {
    throw new Error("DB_SSL deve ser disable, require ou verify-full");
  }

  if (
    url?.hostname.endsWith(".supabase.co") ||
    url?.hostname.endsWith(".supabase.com")
  ) {
    if (producao) {
      throw new Error("Configure DB_SSL=verify-full para o Supabase em producao");
    }
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
    opcoes.sslCaBase64,
    opcoes.producao,
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
    ambiente.DB_SSL_CA_BASE64,
    ambiente.NODE_ENV === "production",
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
        sslCaBase64: ambiente.DB_SSL_CA_BASE64,
        producao: ambiente.NODE_ENV === "production",
      })
    : criarConfiguracaoLegada(ambiente);
  const max = inteiroPositivo(ambiente.DB_POOL_MAX, "DB_POOL_MAX");
  const connectionTimeoutMillis = inteiroPositivo(
    ambiente.DB_CONNECTION_TIMEOUT_MS,
    "DB_CONNECTION_TIMEOUT_MS",
  );
  const idleTimeoutMillis = inteiroPositivo(
    ambiente.DB_IDLE_TIMEOUT_MS,
    "DB_IDLE_TIMEOUT_MS",
  );
  const query_timeout = inteiroPositivo(
    ambiente.DB_QUERY_TIMEOUT_MS,
    "DB_QUERY_TIMEOUT_MS",
  );
  const statement_timeout = inteiroPositivo(
    ambiente.DB_STATEMENT_TIMEOUT_MS,
    "DB_STATEMENT_TIMEOUT_MS",
  );

  configuracao.max = max ?? (ambiente.VERCEL ? 2 : 10);
  configuracao.connectionTimeoutMillis = connectionTimeoutMillis ?? 5000;
  configuracao.idleTimeoutMillis = idleTimeoutMillis ?? 10000;
  configuracao.query_timeout = query_timeout ?? 15000;
  configuracao.statement_timeout = statement_timeout ?? 15000;
  configuracao.allowExitOnIdle = true;

  return configuracao;
}

module.exports = {
  criarConfiguracaoBanco,
  criarConfiguracaoLegada,
  criarConfiguracaoPorUrl,
};
