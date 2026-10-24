-- Teste das permissões do painel (fatia 1.2). Rodar no SQL Editor do Supabase depois de cada
-- mudança nas migrations do painel. Tudo acontece dentro de uma transação desfeita no fim
-- (rollback): as contas e a manifestação de mentira somem, não sobra dado nenhum.
-- Resultado: o teste termina com um ERRO de propósito, que mostra o resumo ("RESULTADO: 18 de
-- 18 ok") e desfaz tudo. Se aparecer "FALHOU:", a lista diz qual permissão está errada.
begin;

create temp table resultado (teste text, ok boolean) on commit drop;

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000d1', 'direcao@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000a1', 'atendimento@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000b1', 'sem-papel@teste.invalid'),
  ('00000000-0000-4000-8000-0000000000c1', 'desativada@teste.invalid');
insert into public.equipe (usuario_id, nome, papel, ativo) values
  ('00000000-0000-4000-8000-0000000000d1', 'Direção de teste', 'direcao', true),
  ('00000000-0000-4000-8000-0000000000a1', 'Atendimento de teste', 'atendimento', true),
  ('00000000-0000-4000-8000-0000000000c1', 'Desativada de teste', 'atendimento', false);
insert into public.manifestacoes (id, protocolo_hash, categoria, tema, segmento, texto, publicacao, prazo_em, demonstracao) values
  ('00000000-0000-4000-8000-00000000f001', 'hash-de-teste', 'reclamacao', 'infraestrutura', 'estudante', 'Texto de teste do painel.', 'aguardando', current_date + 30, true);

-- "Entra" como um usuário: papel authenticated e o id dele no token.
create function pg_temp.como(p_usuario uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_usuario, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p_usuario::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;
create function pg_temp.volta() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
end;
$$;
-- Roda uma chamada e devolve o erro ('' = deu certo).
create function pg_temp.tenta(p_sql text) returns text language plpgsql as $$
begin
  execute p_sql;
  return '';
exception when others then
  return sqlerrm;
end;
$$;

do $$
declare n integer; e text; m uuid := '00000000-0000-4000-8000-00000000f001';
begin
  -- Sem papel e desativada: não leem nada.
  perform pg_temp.como('00000000-0000-4000-8000-0000000000b1');
  select count(*) into n from public.manifestacoes where id = m;
  perform pg_temp.volta(); insert into resultado values ('sem papel não lê', n = 0);

  perform pg_temp.como('00000000-0000-4000-8000-0000000000c1');
  select count(*) into n from public.manifestacoes where id = m;
  e := pg_temp.tenta($q$select public.painel_responder('00000000-0000-4000-8000-00000000f001', 'Resposta qualquer.')$q$);
  perform pg_temp.volta(); insert into resultado values ('desativada não lê nem responde', n = 0 and e like '%sem_acesso%');

  -- Atendimento: lê, responde, pede avaliação; não modera, não exclui, não prorroga.
  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  select count(*) into n from public.manifestacoes where id = m;
  e := pg_temp.tenta($q$select public.painel_responder('00000000-0000-4000-8000-00000000f001', 'Resposta de teste do atendimento.')$q$);
  perform pg_temp.volta(); insert into resultado values ('atendimento lê e responde', n = 1 and e = '');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  e := pg_temp.tenta($q$select public.painel_moderar('00000000-0000-4000-8000-00000000f001', 'aprovar', null, null)$q$);
  perform pg_temp.volta(); insert into resultado values ('atendimento não modera', e like '%so_direcao%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  e := pg_temp.tenta($q$select public.painel_excluir('00000000-0000-4000-8000-00000000f001', 'repetida', 'Explicação com mais de vinte letras.')$q$);
  perform pg_temp.volta(); insert into resultado values ('atendimento não exclui', e like '%so_direcao%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  e := pg_temp.tenta($q$select public.painel_avaliacao('00000000-0000-4000-8000-00000000f001', true)$q$);
  perform pg_temp.volta(); insert into resultado values ('atendimento pede avaliação', e = '');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  e := pg_temp.tenta($q$update public.manifestacoes set texto = 'mudado pelo atendimento' where id = '00000000-0000-4000-8000-00000000f001'$q$);
  perform pg_temp.volta(); insert into resultado values ('ninguém edita o texto direto', e like '%permission denied%');

  -- Direção: recusa sem fundamento é barrada; com fundamento, grava a justificativa formal.
  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_moderar('00000000-0000-4000-8000-00000000f001', 'recusar', null, 'Explicação com mais de vinte letras.')$q$);
  perform pg_temp.volta(); insert into resultado values ('recusa sem fundamento barrada', e like '%falta_fundamento%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_moderar('00000000-0000-4000-8000-00000000f001', 'recusar', 'repetida', 'Explicação com mais de vinte letras.')$q$);
  perform pg_temp.volta(); insert into resultado values ('recusa com fundamento do § 3º barrada', e like '%falta_fundamento%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_moderar('00000000-0000-4000-8000-00000000f001', 'recusar', 'linguagem_desrespeitosa', 'O texto usa palavrões contra colegas da turma.')$q$);
  perform pg_temp.volta();
  insert into resultado select 'direção recusa com fundamento e grava o texto formal',
    e = '' and exists (select 1 from public.justificativas j where j.manifestacao_id = m and j.texto_formal like 'Manifestação não aprovada para o mural pela direção com base no art. 12, § 1º, inciso III%');

  e := pg_temp.tenta($q$update public.justificativas set explicacao = 'mudada' where manifestacao_id = '00000000-0000-4000-8000-00000000f001'$q$);
  insert into resultado values ('justificativa não se edita (nem pelo servidor)', e like '%não se edita%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_prorrogar('00000000-0000-4000-8000-00000000f001', 'Depende de compra pelo Núcleo.')$q$);
  perform pg_temp.volta(); insert into resultado values ('direção prorroga uma vez', e = '');
  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_prorrogar('00000000-0000-4000-8000-00000000f001', 'Segunda tentativa de prorrogar.')$q$);
  perform pg_temp.volta(); insert into resultado values ('segunda prorrogação barrada', e like '%ja_prorrogada%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_equipe('00000000-0000-4000-8000-0000000000d1', 'direcao', false)$q$);
  perform pg_temp.volta(); insert into resultado values ('direção não se desativa', e like '%nao_a_si_mesmo%');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000d1');
  e := pg_temp.tenta($q$select public.painel_equipe('00000000-0000-4000-8000-0000000000a1', 'atendimento', false)$q$);
  perform pg_temp.volta(); insert into resultado values ('direção desativa o atendimento', e = '');

  perform pg_temp.como('00000000-0000-4000-8000-0000000000a1');
  select count(*) into n from public.manifestacoes where id = m;
  perform pg_temp.volta(); insert into resultado values ('desativado perde o acesso na hora', n = 0);

  select count(*) into n from public.historico where manifestacao_id = m;
  insert into resultado values ('tudo foi para o histórico', n >= 4);

  -- Chave pública (anon): nada.
  perform set_config('role', 'anon', true);
  e := pg_temp.tenta($q$select count(*) from public.manifestacoes$q$);
  perform pg_temp.volta(); insert into resultado values ('chave pública não lê', e like '%permission denied%');
end;
$$;

-- O erro abaixo é de propósito: mostra o resultado e desfaz tudo (nada fica gravado).
do $$
declare v_ok integer; v_total integer; v_falhas text;
begin
  select count(*) filter (where ok), count(*), string_agg(teste, '; ') filter (where not ok) into v_ok, v_total, v_falhas from resultado;
  raise exception 'RESULTADO: % de % ok%', v_ok, v_total, coalesce(' | FALHOU: ' || v_falhas, '');
end;
$$;
rollback;
