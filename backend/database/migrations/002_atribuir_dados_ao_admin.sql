DO $$
DECLARE
  admin_id INTEGER;
BEGIN
  SELECT id
    INTO admin_id
    FROM usuarios
   WHERE perfil = 'admin';

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Crie o administrador antes de finalizar a migracao';
  END IF;

  UPDATE propriedades
     SET usuario_id = admin_id
   WHERE usuario_id IS NULL;

  UPDATE vacinas
     SET usuario_id = admin_id
   WHERE usuario_id IS NULL;

  ALTER TABLE propriedades
    ALTER COLUMN usuario_id SET NOT NULL;

  ALTER TABLE vacinas
    ALTER COLUMN usuario_id SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'propriedades_usuario_id_fkey'
  ) THEN
    ALTER TABLE propriedades
      ADD CONSTRAINT propriedades_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'vacinas_usuario_id_fkey'
  ) THEN
    ALTER TABLE vacinas
      ADD CONSTRAINT vacinas_usuario_id_fkey
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS propriedades_usuario_id_idx
  ON propriedades (usuario_id);

CREATE INDEX IF NOT EXISTS vacinas_usuario_id_idx
  ON vacinas (usuario_id);
