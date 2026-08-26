BEGIN;

CREATE TABLE IF NOT EXISTS public.producoes_leiteiras (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL,
  data DATE NOT NULL,
  turno VARCHAR(20) NOT NULL,
  quantidade_litros NUMERIC(10, 2) NOT NULL,
  observacao VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT producoes_leiteiras_animal_id_fkey
    FOREIGN KEY (animal_id)
    REFERENCES public.animais(id)
    ON DELETE CASCADE,

  CONSTRAINT producoes_leiteiras_turno_check
    CHECK (turno IN ('manha', 'tarde', 'noite', 'ordenha_unica')),

  CONSTRAINT producoes_leiteiras_quantidade_check
    CHECK (quantidade_litros > 0)
);

CREATE INDEX IF NOT EXISTS producoes_leiteiras_animal_data_idx
  ON public.producoes_leiteiras (animal_id, data DESC);

COMMIT;
