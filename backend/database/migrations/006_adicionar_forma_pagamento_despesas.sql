BEGIN;

ALTER TABLE despesas
  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(100);

UPDATE despesas
   SET forma_pagamento = NULLIF(BTRIM(forma_pagamento), '')
 WHERE forma_pagamento IS DISTINCT FROM NULLIF(BTRIM(forma_pagamento), '');

COMMIT;
