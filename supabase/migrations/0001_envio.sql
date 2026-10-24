-- Fatia 1.1: envio anônimo. Cria os tipos, a tabela de manifestações e a de limites (antispam).
--
-- Regras de segurança (ADR 0001 e 0002):
-- * RLS ligada em todas as tabelas e NENHUMA policy: a chave pública (anon) e usuários logados
--   não leem nem escrevem nada direto. Só o servidor do site, com a chave secreta, grava.
-- * `limites` não tem ligação com `manifestacoes`: guarda só o IP embaralhado (HMAC), por hora,
--   e é apagada em 2 dias.
-- * O protocolo nunca é guardado; só o código embaralhado dele (protocolo_hash).
-- Rodar uma vez no SQL Editor do Supabase (manual técnico, seção "Banco").

create type public.categoria as enum ('sugestao', 'reclamacao', 'critica', 'elogio', 'relato', 'proposta', 'outra');
create type public.tema as enum ('infraestrutura', 'convivencia', 'ensino', 'atendimento', 'organizacao', 'seguranca', 'outro');
create type public.segmento as enum ('estudante', 'professor', 'funcionario', 'responsavel');
create type public.publicacao as enum ('privada', 'aguardando', 'publicada', 'recusada', 'retirada', 'desistida');
create type public.andamento as enum ('nova', 'em_analise', 'respondida', 'arquivada');

create table public.manifestacoes (
  id uuid primary key default gen_random_uuid(),
  protocolo_hash text not null unique,
  categoria public.categoria not null,
  tema public.tema not null,
  segmento public.segmento not null,
  texto text not null check (char_length(texto) between 10 and 3000 and texto = btrim(texto)),
  publicacao public.publicacao not null default 'privada',
  andamento public.andamento not null default 'nova',
  resposta text check (resposta is null or char_length(resposta) between 1 and 3000),
  respondida_em timestamptz,
  prazo_em date not null,
  prorrogada_ate date,
  explicacao_prorrogacao text,
  pedido_avaliacao boolean not null default false,
  demonstracao boolean not null default false,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  excluida_em timestamptz,
  -- Arquivar só depois de responder (spec, regra de andamento).
  constraint arquivar_so_respondida check (andamento <> 'arquivada' or resposta is not null),
  -- Prorrogar exige explicação, que o autor lê.
  constraint prorrogacao_explicada check (prorrogada_ate is null or explicacao_prorrogacao is not null)
);

create index manifestacoes_criada_em on public.manifestacoes (criada_em desc);
create index manifestacoes_publicacao on public.manifestacoes (publicacao) where excluida_em is null;

create table public.limites (
  chave text primary key,            -- "<ip embaralhado>:<ação>:<hora>"
  contador integer not null default 1,
  inicio timestamptz not null default now()
);

alter table public.manifestacoes enable row level security;
alter table public.limites enable row level security;

-- Sem policy nenhuma = ninguém de fora acessa. Tira também os privilégios padrão do Supabase.
revoke all on public.manifestacoes from anon, authenticated;
revoke all on public.limites from anon, authenticated;

-- Conta uma tentativa e diz se ainda está dentro do limite da hora. Aproveita para apagar
-- contagens com mais de 2 dias (spec, regra 3). Só o servidor (service_role) pode chamar.
create or replace function public.registrar_tentativa(p_chave text, p_maximo integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_contador integer;
begin
  delete from public.limites where inicio < now() - interval '2 days';
  insert into public.limites (chave) values (p_chave)
  on conflict (chave) do update set contador = public.limites.contador + 1
  returning contador into v_contador;
  return v_contador <= p_maximo;
end;
$$;

revoke all on function public.registrar_tentativa(text, integer) from public, anon, authenticated;
grant execute on function public.registrar_tentativa(text, integer) to service_role;
