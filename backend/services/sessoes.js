const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const COOKIE_REFRESH = "bovitrack_refresh";
const COOKIE_REFRESH_LEGADO = "agrocontrol_refresh";
const DURACAO_REFRESH_PADRAO = "7d";

function duracaoEmMilissegundos(valor) {
  const partes = /^(\d+)\s*([smhd])$/i.exec(String(valor || "").trim());

  if (!partes) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN deve usar segundos (s), minutos (m), horas (h) ou dias (d)",
    );
  }

  const multiplicadores = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return Number(partes[1]) * multiplicadores[partes[2].toLowerCase()];
}

function criarTokenAcesso(usuario) {
  return jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
  );
}

function gerarRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function lerRefreshToken(req) {
  const cookies = String(req.headers.cookie || "").split(";");
  let tokenLegado = null;

  for (const cookie of cookies) {
    const separador = cookie.indexOf("=");

    if (separador === -1) continue;

    const nome = cookie.slice(0, separador).trim();

    if (nome === COOKIE_REFRESH) {
      return decodeURIComponent(cookie.slice(separador + 1).trim());
    }

    if (nome === COOKIE_REFRESH_LEGADO) {
      tokenLegado = decodeURIComponent(cookie.slice(separador + 1).trim());
    }
  }

  return tokenLegado;
}

function opcoesCookie(expires) {
  const sameSiteRecebido = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  const sameSitePermitidos = new Set(["lax", "strict", "none"]);
  const sameSite = sameSitePermitidos.has(sameSiteRecebido)
    ? sameSiteRecebido
    : "lax";
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production");

  return {
    httpOnly: true,
    secure: sameSite === "none" ? true : secure,
    sameSite,
    path: "/auth",
    ...(expires ? { expires: new Date(expires) } : {}),
  };
}

function definirCookieRefresh(res, token, expiresAt) {
  res.clearCookie(COOKIE_REFRESH_LEGADO, opcoesCookie());
  res.cookie(COOKIE_REFRESH, token, opcoesCookie(expiresAt));
}

function limparCookieRefresh(res) {
  res.clearCookie(COOKIE_REFRESH, opcoesCookie());
  res.clearCookie(COOKIE_REFRESH_LEGADO, opcoesCookie());
}

async function criarSessaoRefresh(pool, usuarioId) {
  const token = gerarRefreshToken();
  const tokenHash = hashToken(token);
  const duracao = duracaoEmMilissegundos(
    process.env.JWT_REFRESH_EXPIRES_IN || DURACAO_REFRESH_PADRAO,
  );
  const expiresAt = new Date(Date.now() + duracao);
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    await cliente.query(
      "DELETE FROM sessoes_refresh WHERE expires_at <= CURRENT_TIMESTAMP",
    );
    await cliente.query(
      `INSERT INTO sessoes_refresh (usuario_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [usuarioId, tokenHash, expiresAt],
    );
    await cliente.query(
      `DELETE FROM sessoes_refresh
        WHERE usuario_id = $1
          AND id NOT IN (
            SELECT id
              FROM sessoes_refresh
             WHERE usuario_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT 10
          )`,
      [usuarioId],
    );
    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }

  return { token, expiresAt };
}

async function renovarSessaoRefresh(pool, tokenAtual) {
  if (typeof tokenAtual !== "string" || tokenAtual.length < 32) {
    return null;
  }

  const novoToken = gerarRefreshToken();
  const resultado = await pool.query(
    `UPDATE sessoes_refresh AS sr
        SET token_hash = $1
       FROM usuarios AS u
      WHERE sr.token_hash = $2
        AND sr.usuario_id = u.id
        AND sr.expires_at > CURRENT_TIMESTAMP
        AND u.ativo = TRUE
      RETURNING u.id,
                u.nome,
                u.email,
                u.perfil,
                u.ativo,
                sr.expires_at`,
    [hashToken(novoToken), hashToken(tokenAtual)],
  );

  if (resultado.rows.length === 0) {
    return null;
  }

  return {
    token: novoToken,
    expiresAt: resultado.rows[0].expires_at,
    usuario: resultado.rows[0],
  };
}

async function encerrarSessaoRefresh(pool, token) {
  if (typeof token !== "string" || !token) return;

  await pool.query("DELETE FROM sessoes_refresh WHERE token_hash = $1", [
    hashToken(token),
  ]);
}

module.exports = {
  COOKIE_REFRESH,
  criarSessaoRefresh,
  criarTokenAcesso,
  definirCookieRefresh,
  encerrarSessaoRefresh,
  lerRefreshToken,
  limparCookieRefresh,
  renovarSessaoRefresh,
};
