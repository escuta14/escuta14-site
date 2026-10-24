-- Fase 2: "A escola ouviu" (art. 14), as providências da direção e a rotina diária.
-- A página pública lê pelo servidor (service_role), só números e providências: nunca texto de
-- manifestação, id, hora exata ou quem decidiu (spec, regra 26). Nada para anon (ADR 0001).

-- Providência: o que a escola fez a partir do que ouviu, ligada a um tema e com data.
-- Não se apaga (regra permanente 8): a direção pode só tirar da página (oculta_em).
create table public.providencias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 3 and 120 and titulo = btrim(titulo)),
  texto text not null check (char_length(texto) between 10 and 2000 and texto = btrim(texto)),
  tema public.tema not null,
  feita_em date not null,
  criada_em timestamptz not null default now(),
  oculta_em timestamptz
);
create index providencias_feita_em on public.providencias (feita_em desc);

alter table public.providencias enable row level security;
revoke all on public.providencias from anon, authenticated;
grant select on public.providencias to authenticated;
create policy equipe_le_providencias on public.providencias for select to authenticated using (public.papel_atual() is not null);

-- Publicar: só a direção (spec, permissões). A data não pode ser no futuro (horário de Brasília).
create or replace function public.painel_providencia(p_titulo text, p_texto text, p_tema public.tema, p_feita_em date) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true); v_id uuid;
begin
  if p_feita_em is null or p_feita_em > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'data_invalida' using errcode = 'P0001';
  end if;
  insert into public.providencias (titulo, texto, tema, feita_em) values (btrim(p_titulo), btrim(p_texto), p_tema, p_feita_em)
  returning id into v_id;
  perform public.anotar(null, v_usuario, 'publicou providência', null, btrim(p_titulo));
  return v_id;
end;
$$;

-- Tirar da página ou pôr de volta: só a direção; vai para o histórico (regra 27).
create or replace function public.painel_providencia_mostrar(p_id uuid, p_mostrar boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true); v_titulo text;
begin
  update public.providencias set oculta_em = case when p_mostrar then null else coalesce(oculta_em, now()) end
  where id = p_id returning titulo into v_titulo;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  perform public.anotar(null, v_usuario, case when p_mostrar then 'mostrou providência' else 'tirou providência da página' end, null, v_titulo);
end;
$$;

-- Números do ano letivo atual, já somados por mês, tema, categoria e segmento: nenhuma linha é
-- uma manifestação. Fora: demonstrações e exclusões (spec, "A escola ouviu"). O tema é o corrigido
-- pela equipe (regra 7). "No prazo" (regra 13): primeira resposta até o prazo ou a prorrogação.
-- "Com desfecho": já respondida, ou com o prazo vencido sem resposta (só essas entram no %).
-- Security invoker: o servidor (service_role) lê tudo; no painel, a RLS só deixa a equipe ativa ver.
create or replace function public.numeros_do_ano()
returns table (mes integer, tema public.tema, categoria public.categoria, segmento public.segmento,
  total integer, com_desfecho integer, no_prazo integer)
language sql stable set search_path = '' as $$
  with base as (
    select m.*, coalesce(m.prorrogada_ate, m.prazo_em) as prazo_final,
      (m.respondida_em at time zone 'America/Sao_Paulo')::date as dia_resposta
    from public.manifestacoes m
    where m.demonstracao = false and m.excluida_em is null and public.ano_atual(m.criada_em)
  )
  select extract(month from b.criada_em at time zone 'America/Sao_Paulo')::integer, b.tema, b.categoria, b.segmento,
    count(*)::integer,
    count(*) filter (where b.respondida_em is not null or (now() at time zone 'America/Sao_Paulo')::date > b.prazo_final)::integer,
    count(*) filter (where b.dia_resposta <= b.prazo_final)::integer
  from base b
  group by 1, 2, 3, 4;
$$;

-- Rotina diária (Vercel Cron, todo dia): faz o banco ter uso para o Supabase gratuito não pausar
-- (pausa com 7 dias parado) e apaga as contagens do antispam com mais de 2 dias (regra 10 do
-- CLAUDE.md). Devolve quantas apagou, só para o registro da rotina.
create or replace function public.rotina_diaria() returns integer
language plpgsql set search_path = '' as $$
declare v_apagadas integer;
begin
  delete from public.limites where inicio < now() - interval '2 days';
  get diagnostics v_apagadas = row_count;
  return v_apagadas;
end;
$$;

revoke all on function public.painel_providencia(text, text, public.tema, date), public.painel_providencia_mostrar(uuid, boolean),
  public.numeros_do_ano(), public.rotina_diaria() from public, anon, authenticated;
grant execute on function public.painel_providencia(text, text, public.tema, date), public.painel_providencia_mostrar(uuid, boolean),
  public.numeros_do_ano() to authenticated;
grant execute on function public.numeros_do_ano(), public.rotina_diaria() to service_role;
-- numeros_do_ano chama ano_atual, que só o service_role podia chamar: a equipe logada também precisa.
grant execute on function public.ano_atual(timestamptz) to authenticated;
