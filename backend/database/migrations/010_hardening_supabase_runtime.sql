-- Execute com a credencial administrativa de migration, nunca com a role runtime.
-- A role de grupo nao possui LOGIN nem senha; crie o login separadamente no painel.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bovitrack_runtime') THEN
    CREATE ROLE bovitrack_runtime
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO bovitrack_runtime', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO bovitrack_runtime;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.usuarios,
  public.sessoes_refresh,
  public.sessoes_refresh_usados,
  public.limites_requisicao,
  public.propriedades,
  public.animais,
  public.producoes_leiteiras,
  public.pesagens,
  public.desmamas,
  public.lotes,
  public.animais_lotes,
  public.vacinas,
  public.vacinacoes,
  public.despesas
TO bovitrack_runtime;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bovitrack_runtime;

REVOKE ALL PRIVILEGES ON TABLE
  public.usuarios,
  public.sessoes_refresh,
  public.sessoes_refresh_usados,
  public.limites_requisicao,
  public.propriedades,
  public.animais,
  public.producoes_leiteiras,
  public.pesagens,
  public.desmamas,
  public.lotes,
  public.animais_lotes,
  public.vacinas,
  public.vacinacoes,
  public.despesas
FROM anon, authenticated;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

DO $$
DECLARE funcao REGPROCEDURE;
BEGIN
  FOREACH funcao IN ARRAY ARRAY[
    to_regprocedure('public.validar_movimentacao_lote()'),
    to_regprocedure('public.validar_parentesco_animais()'),
    to_regprocedure('public.validar_referencias_desmama()'),
    to_regprocedure('public.validar_referencias_pesagem()'),
    to_regprocedure('public.validar_referencias_manejo()')
  ]
  LOOP
    IF funcao IS NOT NULL THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, anon, authenticated', funcao);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE funcao_oid OID := to_regprocedure('public.validar_referencias_manejo()');
BEGIN
  IF funcao_oid IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_trigger
        WHERE tgfoid = funcao_oid AND NOT tgisinternal
     ) THEN
    DROP FUNCTION public.validar_referencias_manejo();
  END IF;
END $$;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bovitrack_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO bovitrack_runtime;

-- Projetos Supabase antigos tambem podem possuir defaults de supabase_admin.
-- A migration continua caso a role que executa nao possa alterar esses defaults.
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Revogue os default privileges de supabase_admin pelo painel/administrador do Supabase';
  END;
END $$;

COMMIT;
