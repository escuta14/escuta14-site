-- Fatia 1.2: painel da equipe. Login pelo Supabase Auth; o papel (direção ou atendimento) fica
-- na tabela `equipe`. O painel lê com a sessão de quem entrou e a RLS confere o papel com
-- ativo = true (ADR 0001). Toda mudança passa por uma função que confere o papel e anota no
-- histórico (spec, regra 27). Nada para anon.

create type public.papel as enum ('direcao', 'atendimento');

create table public.equipe (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  papel public.papel not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.historico (
  id bigint generated always as identity primary key,
  manifestacao_id uuid references public.manifestacoes (id),
  usuario_id uuid not null,
  acao text not null,
  valor_anterior text,
  valor_novo text,
  criado_em timestamptz not null default now()
);
create index historico_manifestacao on public.historico (manifestacao_id, criado_em desc);

-- O histórico também não se edita nem se apaga.
create or replace function public.historico_imutavel() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'O histórico não se edita nem se apaga';
end;
$$;
revoke all on function public.historico_imutavel() from public, anon, authenticated;
create trigger historico_sem_mudanca before update or delete on public.historico
  for each row execute function public.historico_imutavel();

alter table public.equipe enable row level security;
alter table public.historico enable row level security;
revoke all on public.equipe from anon, authenticated;
revoke all on public.historico from anon, authenticated;

-- Papel de quem está logado, só se a conta estiver ativa (desativada perde o acesso na hora).
create or replace function public.papel_atual() returns public.papel
language sql stable security definer set search_path = '' as $$
  select e.papel from public.equipe e where e.usuario_id = auth.uid() and e.ativo;
$$;
revoke all on function public.papel_atual() from public, anon;
grant execute on function public.papel_atual() to authenticated, service_role;

-- Leitura pelo painel. Excluída só a direção vê (soft delete, regra 22).
grant select on public.manifestacoes, public.justificativas, public.historico, public.equipe to authenticated;
create policy equipe_le_manifestacoes on public.manifestacoes for select to authenticated
  using (public.papel_atual() is not null and (excluida_em is null or public.papel_atual() = 'direcao'));
create policy equipe_le_justificativas on public.justificativas for select to authenticated using (public.papel_atual() is not null);
create policy equipe_le_historico on public.historico for select to authenticated using (public.papel_atual() is not null);
create policy equipe_le_equipe on public.equipe for select to authenticated using (public.papel_atual() is not null);

-- Texto formal da justificativa (art. 12; ADR 0003): artigo, inciso, motivo, explicação e data.
create or replace function public.texto_formal(p_acao public.acao_justificativa, p_fundamento public.fundamento, p_explicacao text)
returns text language sql immutable set search_path = '' as $$
  select format('Manifestação %s pela direção com base no art. 12, %s, da lei ESCUTA 14 (%s). Explicação: %s (%s)',
    case p_acao when 'recusa' then 'não aprovada para o mural' when 'retirada' then 'retirada do mural' else 'excluída' end,
    case p_fundamento
      when 'identifica_pessoa' then '§ 1º, inciso I' when 'expoe_ou_constrange' then '§ 1º, inciso II'
      when 'linguagem_desrespeitosa' then '§ 1º, inciso III' when 'dado_pessoal' then '§ 1º, inciso IV'
      when 'sem_relacao' then '§ 1º, inciso V' when 'propaganda_ou_spam' then '§ 3º, inciso I'
      when 'repetida' then '§ 3º, inciso II' else '§ 3º, inciso III' end,
    case p_fundamento
      when 'identifica_pessoa' then 'identifica o autor ou outra pessoa' when 'expoe_ou_constrange' then 'expõe ou constrange alguém'
      when 'linguagem_desrespeitosa' then 'linguagem desrespeitosa, ofensiva ou discriminatória' when 'dado_pessoal' then 'contém dado pessoal'
      when 'sem_relacao' then 'sem relação com a comunidade escolar' when 'propaganda_ou_spam' then 'propaganda, spam ou texto sem sentido'
      when 'repetida' then 'repete manifestação já enviada' else 'apenas ofensas, sem nada aproveitável' end,
    btrim(p_explicacao),
    to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY'));
$$;

-- Confere o papel e devolve quem é; sem papel ativo, recusa.
create or replace function public.exigir_papel(p_so_direcao boolean) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_papel public.papel := public.papel_atual();
begin
  if v_papel is null then raise exception 'sem_acesso' using errcode = 'P0001'; end if;
  if p_so_direcao and v_papel <> 'direcao' then raise exception 'so_direcao' using errcode = 'P0001'; end if;
  return auth.uid();
end;
$$;

create or replace function public.anotar(p_id uuid, p_usuario uuid, p_acao text, p_antes text, p_depois text) returns void
language sql security definer set search_path = '' as $$
  insert into public.historico (manifestacao_id, usuario_id, acao, valor_anterior, valor_novo) values (p_id, p_usuario, p_acao, p_antes, p_depois);
$$;

-- Resposta (uma só; correção vai para o histórico; regra 11). Atendimento e direção.
create or replace function public.painel_responder(p_id uuid, p_resposta text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(false); v_antes text;
begin
  select m.resposta into v_antes from public.manifestacoes m where m.id = p_id and m.excluida_em is null for update;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  update public.manifestacoes m set resposta = btrim(p_resposta), respondida_em = coalesce(m.respondida_em, now()),
    andamento = case when m.andamento = 'arquivada' then m.andamento else 'respondida' end, atualizada_em = now()
  where m.id = p_id;
  perform public.anotar(p_id, v_usuario, case when v_antes is null then 'respondeu' else 'corrigiu a resposta' end, v_antes, btrim(p_resposta));
end;
$$;

-- Andamento: em análise ou arquivada (arquivar exige resposta; regra 14).
create or replace function public.painel_andamento(p_id uuid, p_andamento public.andamento) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(false); v_antes public.andamento;
begin
  if p_andamento not in ('em_analise', 'arquivada') then raise exception 'andamento_invalido' using errcode = 'P0001'; end if;
  select m.andamento into v_antes from public.manifestacoes m where m.id = p_id and m.excluida_em is null for update;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  update public.manifestacoes set andamento = p_andamento, atualizada_em = now() where id = p_id;
  perform public.anotar(p_id, v_usuario, 'mudou o andamento', v_antes::text, p_andamento::text);
end;
$$;

-- Corrigir o tema (os números usam o corrigido; regra 7).
create or replace function public.painel_tema(p_id uuid, p_tema public.tema) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(false); v_antes public.tema;
begin
  select m.tema into v_antes from public.manifestacoes m where m.id = p_id and m.excluida_em is null for update;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  update public.manifestacoes set tema = p_tema, atualizada_em = now() where id = p_id;
  perform public.anotar(p_id, v_usuario, 'corrigiu o tema', v_antes::text, p_tema::text);
end;
$$;

-- O atendimento não diz não: pede avaliação da direção (regra 18). A direção pode marcar como avaliada.
create or replace function public.painel_avaliacao(p_id uuid, p_pedir boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(not p_pedir);
begin
  update public.manifestacoes set pedido_avaliacao = p_pedir, atualizada_em = now() where id = p_id and excluida_em is null;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  perform public.anotar(p_id, v_usuario, case when p_pedir then 'pediu avaliação da direção' else 'marcou como avaliada' end, null, null);
end;
$$;

-- Mural: aprovar, recusar ou retirar. Só a direção; recusa e retirada exigem fundamento do § 1º
-- e explicação, e a justificativa formal fica gravada para sempre (regras 16, 17 e 20).
create or replace function public.painel_moderar(p_id uuid, p_acao text, p_fundamento public.fundamento, p_explicacao text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true); v_pub public.publicacao; v_novo public.publicacao; v_tipo public.acao_justificativa;
begin
  select m.publicacao into v_pub from public.manifestacoes m where m.id = p_id and m.excluida_em is null for update;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  if p_acao = 'aprovar' and v_pub = 'aguardando' then v_novo := 'publicada';
  elsif p_acao = 'recusar' and v_pub = 'aguardando' then v_novo := 'recusada'; v_tipo := 'recusa';
  elsif p_acao = 'retirar' and v_pub = 'publicada' then v_novo := 'retirada'; v_tipo := 'retirada';
  else raise exception 'acao_invalida' using errcode = 'P0001'; end if;
  if v_tipo is not null then
    if p_fundamento is null or p_fundamento not in ('identifica_pessoa', 'expoe_ou_constrange', 'linguagem_desrespeitosa', 'dado_pessoal', 'sem_relacao')
      or char_length(btrim(coalesce(p_explicacao, ''))) < 20 then
      raise exception 'falta_fundamento' using errcode = 'P0001';
    end if;
    insert into public.justificativas (manifestacao_id, acao, fundamento, explicacao, texto_formal, usuario_id)
      values (p_id, v_tipo, p_fundamento, btrim(p_explicacao), public.texto_formal(v_tipo, p_fundamento, p_explicacao), v_usuario);
  end if;
  update public.manifestacoes set publicacao = v_novo, atualizada_em = now() where id = p_id;
  perform public.anotar(p_id, v_usuario, 'mural: ' || p_acao, v_pub::text, v_novo::text);
end;
$$;

-- Prorrogar: só a direção, uma vez, por mais 30 dias, com explicação que o autor lê (regra 12).
create or replace function public.painel_prorrogar(p_id uuid, p_explicacao text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true); v_prazo date; v_antes date;
begin
  if char_length(btrim(coalesce(p_explicacao, ''))) < 10 then raise exception 'falta_explicacao' using errcode = 'P0001'; end if;
  select m.prazo_em, m.prorrogada_ate into v_prazo, v_antes from public.manifestacoes m where m.id = p_id and m.excluida_em is null for update;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  if v_antes is not null then raise exception 'ja_prorrogada' using errcode = 'P0001'; end if;
  update public.manifestacoes set prorrogada_ate = v_prazo + 30, explicacao_prorrogacao = btrim(p_explicacao), atualizada_em = now() where id = p_id;
  perform public.anotar(p_id, v_usuario, 'prorrogou o prazo', v_prazo::text, (v_prazo + 30)::text);
end;
$$;

-- Excluir: só a direção, com fundamento do § 3º e explicação; nunca apaga de verdade (regra 22).
create or replace function public.painel_excluir(p_id uuid, p_fundamento public.fundamento, p_explicacao text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true);
begin
  if p_fundamento is null or p_fundamento not in ('propaganda_ou_spam', 'repetida', 'apenas_ofensas') or char_length(btrim(coalesce(p_explicacao, ''))) < 20 then
    raise exception 'falta_fundamento' using errcode = 'P0001';
  end if;
  update public.manifestacoes set excluida_em = now(), atualizada_em = now() where id = p_id and excluida_em is null;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  insert into public.justificativas (manifestacao_id, acao, fundamento, explicacao, texto_formal, usuario_id)
    values (p_id, 'exclusao', p_fundamento, btrim(p_explicacao), public.texto_formal('exclusao', p_fundamento, p_explicacao), v_usuario);
  perform public.anotar(p_id, v_usuario, 'excluiu', null, null);
end;
$$;

-- Equipe: só a direção muda papel ou desativa; ninguém desativa a si mesmo (para a escola nunca
-- ficar sem direção no painel).
create or replace function public.painel_equipe(p_usuario uuid, p_papel public.papel, p_ativo boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := public.exigir_papel(true);
begin
  if p_usuario = v_usuario and (p_ativo = false or p_papel <> 'direcao') then raise exception 'nao_a_si_mesmo' using errcode = 'P0001'; end if;
  update public.equipe set papel = p_papel, ativo = p_ativo where usuario_id = p_usuario;
  if not found then raise exception 'nao_encontrada' using errcode = 'P0001'; end if;
  perform public.anotar(null, v_usuario, 'mudou a equipe', p_usuario::text, p_papel::text || case when p_ativo then '' else ' (desativada)' end);
end;
$$;

-- Funções internas: ninguém de fora chama. As do painel: só quem está logado (e elas conferem o papel).
revoke all on function public.texto_formal(public.acao_justificativa, public.fundamento, text), public.exigir_papel(boolean),
  public.anotar(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.painel_responder(uuid, text), public.painel_andamento(uuid, public.andamento), public.painel_tema(uuid, public.tema),
  public.painel_avaliacao(uuid, boolean), public.painel_moderar(uuid, text, public.fundamento, text), public.painel_prorrogar(uuid, text),
  public.painel_excluir(uuid, public.fundamento, text), public.painel_equipe(uuid, public.papel, boolean) from public, anon;
grant execute on function public.painel_responder(uuid, text), public.painel_andamento(uuid, public.andamento), public.painel_tema(uuid, public.tema),
  public.painel_avaliacao(uuid, boolean), public.painel_moderar(uuid, text, public.fundamento, text), public.painel_prorrogar(uuid, text),
  public.painel_excluir(uuid, public.fundamento, text), public.painel_equipe(uuid, public.papel, boolean) to authenticated;
