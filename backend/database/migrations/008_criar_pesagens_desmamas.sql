BEGIN;

ALTER TABLE animais
  ADD COLUMN IF NOT EXISTS mae_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'animais_mae_id_fkey'
  ) THEN
    ALTER TABLE animais
      ADD CONSTRAINT animais_mae_id_fkey
      FOREIGN KEY (mae_id) REFERENCES animais(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS animais_mae_id_idx ON animais (mae_id);

CREATE TABLE IF NOT EXISTS pesagens (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL,
  data_pesagem DATE NOT NULL,
  peso_kg NUMERIC(10, 2) NOT NULL,
  tipo_pesagem VARCHAR(20) NOT NULL,
  metodo VARCHAR(20),
  lote_id INTEGER,
  observacao VARCHAR(500),
  registrado_por INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pesagens_animal_id_fkey
    FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  CONSTRAINT pesagens_lote_id_fkey
    FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE SET NULL,
  CONSTRAINT pesagens_registrado_por_fkey
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT pesagens_peso_check CHECK (peso_kg > 0),
  CONSTRAINT pesagens_tipo_check CHECK (
    tipo_pesagem IN (
      'NASCIMENTO', 'ROTINA', 'PRE_DESMAMA', 'DESMAMA',
      'POS_DESMAMA', 'SOBREANO', 'OUTRA'
    )
  ),
  CONSTRAINT pesagens_metodo_check CHECK (
    metodo IS NULL OR metodo IN ('BALANCA', 'FITA', 'ESTIMATIVA', 'OUTRO')
  )
);

CREATE INDEX IF NOT EXISTS pesagens_animal_data_idx
  ON pesagens (animal_id, data_pesagem DESC, id DESC);
CREATE INDEX IF NOT EXISTS pesagens_lote_id_idx ON pesagens (lote_id);
CREATE INDEX IF NOT EXISTS pesagens_tipo_idx ON pesagens (tipo_pesagem);

CREATE TABLE IF NOT EXISTS desmamas (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL,
  mae_id INTEGER,
  data_planejada DATE NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  data_desmama DATE,
  tipo_desmama VARCHAR(24) NOT NULL,
  peso_desmama_id INTEGER UNIQUE,
  lote_destino_id INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANEJADA',
  suplementacao VARCHAR(500),
  observacao VARCHAR(1000),
  registrado_por INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT desmamas_animal_id_fkey
    FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  CONSTRAINT desmamas_mae_id_fkey
    FOREIGN KEY (mae_id) REFERENCES animais(id) ON DELETE SET NULL,
  CONSTRAINT desmamas_peso_desmama_id_fkey
    FOREIGN KEY (peso_desmama_id) REFERENCES pesagens(id) ON DELETE SET NULL,
  CONSTRAINT desmamas_lote_destino_id_fkey
    FOREIGN KEY (lote_destino_id) REFERENCES lotes(id) ON DELETE SET NULL,
  CONSTRAINT desmamas_registrado_por_fkey
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT desmamas_status_check CHECK (
    status IN ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')
  ),
  CONSTRAINT desmamas_tipo_check CHECK (
    tipo_desmama IN (
      'CONVENCIONAL', 'LADO_A_LADO', 'ABRUPTA', 'PRECOCE',
      'TEMPORARIA', 'CONTROLADA', 'OUTRA'
    )
  ),
  CONSTRAINT desmamas_periodo_check CHECK (
    data_fim IS NULL OR (data_inicio IS NOT NULL AND data_fim >= data_inicio)
  ),
  CONSTRAINT desmamas_conclusao_check CHECK (
    status <> 'CONCLUIDA'
    OR (tipo_desmama = 'TEMPORARIA' AND data_inicio IS NOT NULL AND data_fim IS NOT NULL)
    OR (tipo_desmama <> 'TEMPORARIA' AND data_desmama IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS desmamas_animal_data_idx
  ON desmamas (animal_id, data_planejada DESC, id DESC);
CREATE INDEX IF NOT EXISTS desmamas_status_data_idx
  ON desmamas (status, data_planejada);
CREATE INDEX IF NOT EXISTS desmamas_lote_destino_id_idx
  ON desmamas (lote_destino_id);
CREATE UNIQUE INDEX IF NOT EXISTS desmamas_definitiva_unica_idx
  ON desmamas (animal_id)
  WHERE tipo_desmama <> 'TEMPORARIA' AND status <> 'CANCELADA';

CREATE OR REPLACE FUNCTION validar_parentesco_animais()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE mae_propriedade INTEGER; mae_sexo CHAR(1);
BEGIN
  IF NEW.mae_id IS NOT NULL THEN
    IF NEW.mae_id = NEW.id THEN
      RAISE EXCEPTION 'Um animal nao pode ser sua propria mae';
    END IF;
    SELECT propriedade_id, sexo INTO mae_propriedade, mae_sexo
      FROM animais WHERE id = NEW.mae_id;
    IF mae_propriedade IS NULL OR mae_propriedade <> NEW.propriedade_id OR mae_sexo <> 'F' THEN
      RAISE EXCEPTION 'A mae deve ser uma femea da mesma propriedade';
    END IF;
  END IF;
  IF EXISTS (
    SELECT 1 FROM animais filho
     WHERE filho.mae_id = NEW.id AND filho.propriedade_id <> NEW.propriedade_id
  ) THEN
    RAISE EXCEPTION 'A propriedade da mae e dos filhos deve permanecer igual';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pesagens pe JOIN lotes l ON l.id = pe.lote_id
     WHERE pe.animal_id = NEW.id AND l.propriedade_id <> NEW.propriedade_id
  ) OR EXISTS (
    SELECT 1 FROM desmamas de
      LEFT JOIN animais m ON m.id = de.mae_id
      LEFT JOIN lotes l ON l.id = de.lote_destino_id
     WHERE de.animal_id = NEW.id
       AND (m.propriedade_id <> NEW.propriedade_id OR l.propriedade_id <> NEW.propriedade_id)
  ) THEN
    RAISE EXCEPTION 'O animal possui historico de manejo incompativel com a nova propriedade';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS animais_parentesco_consistente_trg ON animais;
CREATE TRIGGER animais_parentesco_consistente_trg
BEFORE INSERT OR UPDATE OF mae_id, propriedade_id ON animais
FOR EACH ROW EXECUTE FUNCTION validar_parentesco_animais();

DROP TRIGGER IF EXISTS pesagens_referencias_consistentes_trg ON pesagens;
CREATE OR REPLACE FUNCTION validar_referencias_pesagem()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE propriedade_animal INTEGER; propriedade_lote INTEGER;
BEGIN
  SELECT propriedade_id INTO propriedade_animal FROM animais WHERE id = NEW.animal_id;
  IF NEW.lote_id IS NOT NULL THEN
    SELECT propriedade_id INTO propriedade_lote FROM lotes WHERE id = NEW.lote_id;
    IF propriedade_lote <> propriedade_animal THEN
      RAISE EXCEPTION 'O lote da pesagem deve pertencer a propriedade do animal';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER pesagens_referencias_consistentes_trg
BEFORE INSERT OR UPDATE OF animal_id, lote_id ON pesagens
FOR EACH ROW EXECUTE FUNCTION validar_referencias_pesagem();

DROP TRIGGER IF EXISTS desmamas_referencias_consistentes_trg ON desmamas;
CREATE OR REPLACE FUNCTION validar_referencias_desmama()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE propriedade_animal INTEGER; propriedade_lote INTEGER; animal_pesagem INTEGER;
BEGIN
  SELECT propriedade_id INTO propriedade_animal FROM animais WHERE id = NEW.animal_id;
  IF NEW.mae_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM animais m WHERE m.id = NEW.mae_id
      AND m.propriedade_id = propriedade_animal AND m.sexo = 'F' AND m.id <> NEW.animal_id
  ) THEN
    RAISE EXCEPTION 'A mae da desmama deve ser uma femea da mesma propriedade';
  END IF;
  IF NEW.lote_destino_id IS NOT NULL THEN
    SELECT propriedade_id INTO propriedade_lote FROM lotes WHERE id = NEW.lote_destino_id;
    IF propriedade_lote <> propriedade_animal THEN
      RAISE EXCEPTION 'O lote de destino deve pertencer a propriedade do animal';
    END IF;
  END IF;
  IF NEW.peso_desmama_id IS NOT NULL THEN
    SELECT animal_id INTO animal_pesagem FROM pesagens WHERE id = NEW.peso_desmama_id;
    IF animal_pesagem <> NEW.animal_id THEN
      RAISE EXCEPTION 'A pesagem de desmama deve pertencer ao mesmo animal';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER desmamas_referencias_consistentes_trg
BEFORE INSERT OR UPDATE OF animal_id, mae_id, lote_destino_id, peso_desmama_id ON desmamas
FOR EACH ROW EXECUTE FUNCTION validar_referencias_desmama();

CREATE OR REPLACE FUNCTION validar_movimentacao_lote()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM animais_lotes al JOIN animais a ON a.id = al.animal_id
     WHERE al.lote_id = NEW.id AND a.propriedade_id <> NEW.propriedade_id
  ) OR EXISTS (
    SELECT 1 FROM pesagens pe JOIN animais a ON a.id = pe.animal_id
     WHERE pe.lote_id = NEW.id AND a.propriedade_id <> NEW.propriedade_id
  ) OR EXISTS (
    SELECT 1 FROM desmamas de JOIN animais a ON a.id = de.animal_id
     WHERE de.lote_destino_id = NEW.id AND a.propriedade_id <> NEW.propriedade_id
  ) THEN
    RAISE EXCEPTION 'O lote possui historico incompativel com a nova propriedade';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS lotes_movimentacao_consistente_trg ON lotes;
CREATE TRIGGER lotes_movimentacao_consistente_trg
BEFORE UPDATE OF propriedade_id ON lotes
FOR EACH ROW EXECUTE FUNCTION validar_movimentacao_lote();

COMMIT;
