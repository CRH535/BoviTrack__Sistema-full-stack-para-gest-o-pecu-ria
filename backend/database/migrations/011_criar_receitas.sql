-- Receitas da atividade pecuaria. Execute com a credencial de migrations.
BEGIN;

CREATE TABLE IF NOT EXISTS public.receitas (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor NUMERIC(14, 2) NOT NULL,
  data DATE NOT NULL,
  propriedade_id INTEGER NOT NULL,
  forma_recebimento VARCHAR(100),
  observacao VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receitas_propriedade_id_fkey
    FOREIGN KEY (propriedade_id) REFERENCES public.propriedades(id) ON DELETE CASCADE,
  CONSTRAINT receitas_valor_check CHECK (valor > 0)
);

CREATE INDEX IF NOT EXISTS receitas_propriedade_data_idx
  ON public.receitas (propriedade_id, data DESC, id DESC);
CREATE INDEX IF NOT EXISTS receitas_categoria_idx
  ON public.receitas (categoria);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bovitrack_runtime') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.receitas TO bovitrack_runtime';
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.receitas_id_seq TO bovitrack_runtime';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.receitas FROM anon';
    EXECUTE 'REVOKE ALL PRIVILEGES ON SEQUENCE public.receitas_id_seq FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.receitas FROM authenticated';
    EXECUTE 'REVOKE ALL PRIVILEGES ON SEQUENCE public.receitas_id_seq FROM authenticated';
  END IF;
END $$;

COMMIT;
