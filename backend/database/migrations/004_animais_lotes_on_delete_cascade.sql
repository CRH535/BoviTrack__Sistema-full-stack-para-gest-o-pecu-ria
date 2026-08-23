BEGIN;

ALTER TABLE animais_lotes
  DROP CONSTRAINT IF EXISTS animais_lotes_animal_id_fkey;

ALTER TABLE animais_lotes
  ADD CONSTRAINT animais_lotes_animal_id_fkey
  FOREIGN KEY (animal_id)
  REFERENCES animais(id)
  ON DELETE CASCADE;

ALTER TABLE animais_lotes
  DROP CONSTRAINT IF EXISTS animais_lotes_lote_id_fkey;

ALTER TABLE animais_lotes
  ADD CONSTRAINT animais_lotes_lote_id_fkey
  FOREIGN KEY (lote_id)
  REFERENCES lotes(id)
  ON DELETE CASCADE;

COMMIT;
