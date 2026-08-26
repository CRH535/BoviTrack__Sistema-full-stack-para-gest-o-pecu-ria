BEGIN;

CREATE TABLE IF NOT EXISTS public.sessoes_refresh (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT sessoes_refresh_usuario_id_fkey
    FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessoes_refresh_usuario_id_idx
  ON public.sessoes_refresh (usuario_id);

CREATE INDEX IF NOT EXISTS sessoes_refresh_expires_at_idx
  ON public.sessoes_refresh (expires_at);

COMMIT;
