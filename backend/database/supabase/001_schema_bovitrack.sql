-- Schema do BoviTrack obtido do PostgreSQL local em 25/08/2026.
-- Execute em um projeto Supabase sem as tabelas do BoviTrack.
-- Os IDs continuam INTEGER/SERIAL; o sistema de autenticacao permanece no backend.

BEGIN;

CREATE TABLE public.usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT usuarios_perfil_check CHECK (perfil IN ('admin', 'usuario'))
);

CREATE UNIQUE INDEX usuarios_admin_unico_idx
  ON public.usuarios (perfil)
  WHERE perfil = 'admin';

CREATE TABLE public.propriedades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  area NUMERIC(10, 2) NOT NULL,
  usuario_id INTEGER NOT NULL,
  CONSTRAINT propriedades_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE INDEX propriedades_usuario_id_idx
  ON public.propriedades (usuario_id);

CREATE TABLE public.animais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raca VARCHAR(50),
  sexo CHAR(1),
  peso NUMERIC(10, 2),
  propriedade_id INTEGER NOT NULL,
  numero_brinco VARCHAR(50),
  data_nascimento DATE,
  CONSTRAINT animais_propriedade_id_fkey
    FOREIGN KEY (propriedade_id) REFERENCES public.propriedades(id)
);

CREATE UNIQUE INDEX animais_propriedade_numero_brinco_uidx
  ON public.animais (propriedade_id, numero_brinco)
  WHERE numero_brinco IS NOT NULL;

CREATE TABLE public.lotes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  propriedade_id INTEGER NOT NULL,
  CONSTRAINT lotes_propriedade_id_fkey
    FOREIGN KEY (propriedade_id) REFERENCES public.propriedades(id)
);

CREATE TABLE public.vacinas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  fabricante VARCHAR(100),
  descricao VARCHAR(255),
  usuario_id INTEGER NOT NULL,
  CONSTRAINT vacinas_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE INDEX vacinas_usuario_id_idx
  ON public.vacinas (usuario_id);

CREATE TABLE public.vacinacoes (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL,
  vacina_id INTEGER NOT NULL,
  data_aplicacao DATE NOT NULL,
  proxima_dose DATE,
  observacao VARCHAR(255),
  CONSTRAINT vacinacoes_animal_id_fkey
    FOREIGN KEY (animal_id) REFERENCES public.animais(id),
  CONSTRAINT vacinacoes_vacina_id_fkey
    FOREIGN KEY (vacina_id) REFERENCES public.vacinas(id)
);

CREATE TABLE public.despesas (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  data DATE NOT NULL,
  propriedade_id INTEGER NOT NULL,
  forma_pagamento VARCHAR(100),
  CONSTRAINT despesas_propriedade_id_fkey
    FOREIGN KEY (propriedade_id) REFERENCES public.propriedades(id)
);

CREATE TABLE public.receitas (
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

CREATE INDEX receitas_propriedade_data_idx
  ON public.receitas (propriedade_id, data DESC, id DESC);
CREATE INDEX receitas_categoria_idx ON public.receitas (categoria);

CREATE TABLE public.animais_lotes (
  animal_id INTEGER NOT NULL,
  lote_id INTEGER NOT NULL,
  PRIMARY KEY (animal_id, lote_id),
  CONSTRAINT animais_lotes_animal_id_fkey
    FOREIGN KEY (animal_id) REFERENCES public.animais(id) ON DELETE CASCADE,
  CONSTRAINT animais_lotes_lote_id_fkey
    FOREIGN KEY (lote_id) REFERENCES public.lotes(id) ON DELETE CASCADE
);

COMMIT;
