BEGIN;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT usuarios_perfil_check CHECK (perfil IN ('admin', 'usuario'))
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_admin_unico_idx
  ON usuarios (perfil)
  WHERE perfil = 'admin';

ALTER TABLE propriedades
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

ALTER TABLE vacinas
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

COMMIT;
