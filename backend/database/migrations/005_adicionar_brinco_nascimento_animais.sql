BEGIN;

ALTER TABLE animais
  ADD COLUMN IF NOT EXISTS numero_brinco VARCHAR(50);

ALTER TABLE animais
  ADD COLUMN IF NOT EXISTS data_nascimento DATE;

UPDATE animais
   SET numero_brinco = NULLIF(BTRIM(numero_brinco), '')
 WHERE numero_brinco IS DISTINCT FROM NULLIF(BTRIM(numero_brinco), '');

CREATE UNIQUE INDEX IF NOT EXISTS animais_propriedade_numero_brinco_uidx
  ON animais (propriedade_id, numero_brinco)
  WHERE numero_brinco IS NOT NULL;

COMMIT;
