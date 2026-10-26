-- A rotina diária passa a anotar quando rodou. O plano Hobby da Vercel guarda o registro (log)
-- só por 1 hora, então não dá para saber pelo log se a rotina rodou ontem. Com a anotação, a
-- direção vê no painel (Equipe) a última execução, e quem cuida do site confere com um SELECT.
-- Uma linha só (id = 1), trocada a cada execução. Nada de dado pessoal. Nada para anon (ADR 0001).

create table public.rotina (
  id smallint primary key default 1 check (id = 1),
  ultima_execucao timestamptz not null,
  antispam_apagado integer not null default 0
);

alter table public.rotina enable row level security;
revoke all on public.rotina from anon, authenticated;
grant select on public.rotina to authenticated;
create policy equipe_le_rotina on public.rotina for select to authenticated using (public.papel_atual() is not null);

-- Mesma rotina de antes (migration 0004), agora anotando a hora e quantas contagens apagou.
create or replace function public.rotina_diaria() returns integer
language plpgsql set search_path = '' as $$
declare v_apagadas integer;
begin
  delete from public.limites where inicio < now() - interval '2 days';
  get diagnostics v_apagadas = row_count;
  insert into public.rotina (id, ultima_execucao, antispam_apagado) values (1, now(), v_apagadas)
  on conflict (id) do update set ultima_execucao = excluded.ultima_execucao, antispam_apagado = excluded.antispam_apagado;
  return v_apagadas;
end;
$$;

revoke all on function public.rotina_diaria() from public, anon, authenticated;
grant execute on function public.rotina_diaria() to service_role;
