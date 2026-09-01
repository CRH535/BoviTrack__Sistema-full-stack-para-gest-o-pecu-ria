-- Pode ser executado apos a copia dos dados.
-- Reposiciona as sequences sem alterar IDs ou registros existentes.

BEGIN;

SELECT setval(
  pg_get_serial_sequence('public.usuarios', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.usuarios;

SELECT setval(
  pg_get_serial_sequence('public.propriedades', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.propriedades;

SELECT setval(
  pg_get_serial_sequence('public.animais', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.animais;

SELECT setval(
  pg_get_serial_sequence('public.lotes', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.lotes;

SELECT setval(
  pg_get_serial_sequence('public.vacinas', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.vacinas;

SELECT setval(
  pg_get_serial_sequence('public.vacinacoes', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.vacinacoes;

SELECT setval(
  pg_get_serial_sequence('public.despesas', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.despesas;

SELECT setval(
  pg_get_serial_sequence('public.receitas', 'id'),
  COALESCE(MAX(id), 1),
  COUNT(*) > 0
) FROM public.receitas;

COMMIT;

-- Contagem das tabelas migradas.
SELECT 'usuarios' AS tabela, COUNT(*) AS registros FROM public.usuarios
UNION ALL SELECT 'propriedades', COUNT(*) FROM public.propriedades
UNION ALL SELECT 'animais', COUNT(*) FROM public.animais
UNION ALL SELECT 'lotes', COUNT(*) FROM public.lotes
UNION ALL SELECT 'animais_lotes', COUNT(*) FROM public.animais_lotes
UNION ALL SELECT 'vacinas', COUNT(*) FROM public.vacinas
UNION ALL SELECT 'vacinacoes', COUNT(*) FROM public.vacinacoes
UNION ALL SELECT 'despesas', COUNT(*) FROM public.despesas
UNION ALL SELECT 'receitas', COUNT(*) FROM public.receitas
ORDER BY tabela;

-- O resultado deve ser zero em todas as linhas.
SELECT 'propriedades.usuario_id' AS relacionamento, COUNT(*) AS orfaos
  FROM public.propriedades p
  LEFT JOIN public.usuarios u ON u.id = p.usuario_id
 WHERE u.id IS NULL
UNION ALL
SELECT 'animais.propriedade_id', COUNT(*)
  FROM public.animais a
  LEFT JOIN public.propriedades p ON p.id = a.propriedade_id
 WHERE p.id IS NULL
UNION ALL
SELECT 'lotes.propriedade_id', COUNT(*)
  FROM public.lotes l
  LEFT JOIN public.propriedades p ON p.id = l.propriedade_id
 WHERE p.id IS NULL
UNION ALL
SELECT 'despesas.propriedade_id', COUNT(*)
  FROM public.despesas d
  LEFT JOIN public.propriedades p ON p.id = d.propriedade_id
 WHERE p.id IS NULL
UNION ALL
SELECT 'receitas.propriedade_id', COUNT(*)
  FROM public.receitas r
  LEFT JOIN public.propriedades p ON p.id = r.propriedade_id
 WHERE p.id IS NULL
UNION ALL
SELECT 'vacinas.usuario_id', COUNT(*)
  FROM public.vacinas v
  LEFT JOIN public.usuarios u ON u.id = v.usuario_id
 WHERE u.id IS NULL
UNION ALL
SELECT 'vacinacoes.animal_id', COUNT(*)
  FROM public.vacinacoes vc
  LEFT JOIN public.animais a ON a.id = vc.animal_id
 WHERE a.id IS NULL
UNION ALL
SELECT 'vacinacoes.vacina_id', COUNT(*)
  FROM public.vacinacoes vc
  LEFT JOIN public.vacinas v ON v.id = vc.vacina_id
 WHERE v.id IS NULL
UNION ALL
SELECT 'animais_lotes.animal_id', COUNT(*)
  FROM public.animais_lotes al
  LEFT JOIN public.animais a ON a.id = al.animal_id
 WHERE a.id IS NULL
UNION ALL
SELECT 'animais_lotes.lote_id', COUNT(*)
  FROM public.animais_lotes al
  LEFT JOIN public.lotes l ON l.id = al.lote_id
 WHERE l.id IS NULL;
