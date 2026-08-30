BEGIN;

ALTER TABLE public.sessoes_refresh
  ADD COLUMN IF NOT EXISTS session_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS family_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoke_reason VARCHAR(40),
  ADD COLUMN IF NOT EXISTS rotated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_authenticated_at TIMESTAMPTZ;

UPDATE public.sessoes_refresh
   SET session_id = COALESCE(
         session_id,
         md5(random()::text || clock_timestamp()::text || id::text) ||
         md5(id::text || random()::text || clock_timestamp()::text)
       ),
       family_id = COALESCE(
         family_id,
         md5(random()::text || id::text || clock_timestamp()::text) ||
         md5(clock_timestamp()::text || random()::text || id::text)
       ),
       last_authenticated_at = COALESCE(last_authenticated_at, created_at)
 WHERE session_id IS NULL
    OR family_id IS NULL
    OR last_authenticated_at IS NULL;

ALTER TABLE public.sessoes_refresh
  ALTER COLUMN session_id SET NOT NULL,
  ALTER COLUMN family_id SET NOT NULL,
  ALTER COLUMN last_authenticated_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS sessoes_refresh_session_id_uidx
  ON public.sessoes_refresh (session_id);
CREATE INDEX IF NOT EXISTS sessoes_refresh_family_id_idx
  ON public.sessoes_refresh (family_id);
CREATE INDEX IF NOT EXISTS sessoes_refresh_ativa_idx
  ON public.sessoes_refresh (usuario_id, session_id)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.sessoes_refresh_usados (
  token_hash CHAR(64) PRIMARY KEY,
  sessao_id BIGINT NOT NULL,
  family_id VARCHAR(64) NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT sessoes_refresh_usados_sessao_id_fkey
    FOREIGN KEY (sessao_id)
    REFERENCES public.sessoes_refresh(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessoes_refresh_usados_expira_idx
  ON public.sessoes_refresh_usados (expires_at);
CREATE INDEX IF NOT EXISTS sessoes_refresh_usados_family_idx
  ON public.sessoes_refresh_usados (family_id);

CREATE TABLE IF NOT EXISTS public.limites_requisicao (
  escopo VARCHAR(40) NOT NULL,
  chave_hash CHAR(64) NOT NULL,
  janela_inicio TIMESTAMPTZ NOT NULL,
  janela_fim TIMESTAMPTZ NOT NULL,
  contador INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (escopo, chave_hash, janela_inicio),
  CONSTRAINT limites_requisicao_contador_check CHECK (contador > 0),
  CONSTRAINT limites_requisicao_janela_check CHECK (janela_fim > janela_inicio)
);

CREATE INDEX IF NOT EXISTS limites_requisicao_expira_idx
  ON public.limites_requisicao (janela_fim);

COMMIT;
