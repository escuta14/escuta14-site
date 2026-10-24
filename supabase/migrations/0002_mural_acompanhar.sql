-- Mural (com votos) e consulta pelo protocolo. Mesmas regras da 0001: RLS ligada, nenhuma
-- policy, nada para anon/authenticated; só o servidor do site (service_role) usa.

-- O mural precisa apontar para uma manifestação sem mostrar o id interno (spec, regra 26):
-- cada uma ganha um código público aleatório, sem ligação com o protocolo.
alter table public.manifestacoes add column codigo_publico uuid not null default gen_random_uuid() unique;

-- Justificativa formal de recusa, retirada e exclusão (art. 12; ADR 0003). Não se edita nem
-- se apaga: um gatilho barra até o servidor.
create type public.acao_justificativa as enum ('recusa', 'retirada', 'exclusao');
create type public.fundamento as enum (
  'identifica_pessoa', 'expoe_ou_constrange', 'linguagem_desrespeitosa', 'dado_pessoal', 'sem_relacao',
  'propaganda_ou_spam', 'repetida', 'apenas_ofensas'
);
create table public.justificativas (
  id uuid primary key default gen_random_uuid(),
  manifestacao_id uuid not null references public.manifestacoes (id),
  acao public.acao_justificativa not null,
  fundamento public.fundamento not null,
  explicacao text not null check (char_length(explicacao) between 20 and 1000),
  texto_formal text not null,
  usuario_id uuid,
  criada_em timestamptz not null default now()
);
create index justificativas_manifestacao on public.justificativas (manifestacao_id, criada_em desc);

create or replace function public.justificativa_imutavel() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'A justificativa formal não se edita nem se apaga';
end;
$$;
create trigger justificativas_sem_mudanca before update or delete on public.justificativas
  for each row execute function public.justificativa_imutavel();

-- Votos: um por aparelho em cada manifestação (spec, regra 23). votante_hash é o cookie do
-- aparelho embaralhado com o SEGREDO_ANONIMATO; o cookie em si nunca chega ao banco.
create type public.tipo_voto as enum ('apoio', 'contestacao');
create table public.votos (
  manifestacao_id uuid not null references public.manifestacoes (id),
  votante_hash text not null,
  tipo public.tipo_voto not null,
  criado_em timestamptz not null default now(),
  primary key (manifestacao_id, votante_hash)
);

alter table public.justificativas enable row level security;
alter table public.votos enable row level security;
revoke all on public.justificativas from anon, authenticated;
revoke all on public.votos from anon, authenticated;

-- "Ano letivo atual" = o ano corrente no horário de Brasília (spec, regra 25).
create or replace function public.ano_atual(p_data timestamptz) returns boolean
language sql stable set search_path = '' as $$
  select extract(year from p_data at time zone 'America/Sao_Paulo') = extract(year from now() at time zone 'America/Sao_Paulo');
$$;

-- Lista do mural: só publicadas e retiradas (estas viram aviso, sem o texto), do ano atual,
-- sem id interno, andamento, hora ou quem decidiu (spec, regra 26).
create or replace function public.mural_listar(p_votante text)
returns table (
  codigo uuid, categoria public.categoria, tema public.tema, segmento public.segmento, dia date,
  texto text, resposta text, aviso text, apoios integer, contestacoes integer, meu_voto public.tipo_voto
)
language sql stable set search_path = '' as $$
  select
    m.codigo_publico,
    m.categoria, m.tema, m.segmento,
    (m.criada_em at time zone 'America/Sao_Paulo')::date,
    case when m.publicacao = 'publicada' then m.texto end,
    case when m.publicacao = 'publicada' then m.resposta end,
    case when m.publicacao = 'retirada' then (
      select j.texto_formal from public.justificativas j
      where j.manifestacao_id = m.id and j.acao = 'retirada' order by j.criada_em desc limit 1
    ) end,
    (select count(*)::integer from public.votos v where v.manifestacao_id = m.id and v.tipo = 'apoio'),
    (select count(*)::integer from public.votos v where v.manifestacao_id = m.id and v.tipo = 'contestacao'),
    (select v.tipo from public.votos v where v.manifestacao_id = m.id and v.votante_hash = p_votante)
  from public.manifestacoes m
  where m.excluida_em is null and m.publicacao in ('publicada', 'retirada') and public.ano_atual(m.criada_em);
$$;

-- Vota, troca ou desfaz (p_tipo nulo) e devolve a contagem nova. Só manifestação publicada do
-- ano atual recebe voto; retirada e desistida guardam os votos sem mostrar (spec, votos).
create or replace function public.votar(p_codigo uuid, p_votante text, p_tipo public.tipo_voto)
returns table (total_apoios integer, total_contestacoes integer, voto_atual public.tipo_voto)
language plpgsql set search_path = '' as $$
declare
  v_id uuid;
begin
  select m.id into v_id from public.manifestacoes m
  where m.codigo_publico = p_codigo and m.publicacao = 'publicada' and m.excluida_em is null and public.ano_atual(m.criada_em);
  if v_id is null then
    raise exception 'nao_recebe_votos' using errcode = 'P0001';
  end if;
  if p_tipo is null then
    delete from public.votos v where v.manifestacao_id = v_id and v.votante_hash = p_votante;
  else
    insert into public.votos as v (manifestacao_id, votante_hash, tipo) values (v_id, p_votante, p_tipo)
    on conflict (manifestacao_id, votante_hash) do update set tipo = excluded.tipo, criado_em = now();
  end if;
  return query select
    (select count(*)::integer from public.votos v where v.manifestacao_id = v_id and v.tipo = 'apoio'),
    (select count(*)::integer from public.votos v where v.manifestacao_id = v_id and v.tipo = 'contestacao'),
    (select v.tipo from public.votos v where v.manifestacao_id = v_id and v.votante_hash = p_votante);
end;
$$;

revoke all on function public.justificativa_imutavel() from public, anon, authenticated;
revoke all on function public.ano_atual(timestamptz) from public, anon, authenticated;
revoke all on function public.mural_listar(text) from public, anon, authenticated;
revoke all on function public.votar(uuid, text, public.tipo_voto) from public, anon, authenticated;
grant execute on function public.ano_atual(timestamptz) to service_role;
grant execute on function public.mural_listar(text) to service_role;
grant execute on function public.votar(uuid, text, public.tipo_voto) to service_role;
