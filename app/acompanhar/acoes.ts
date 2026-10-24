'use server';
// Consulta pelo protocolo e desistência do autor (spec, tela Acompanhar; fatia 1.3). O protocolo
// chega no corpo da chamada, nunca na URL, e não vai para o log. Passa pelo antispam e pelo
// limite de 120 consultas por hora (spec, regras 8 e 9).
import { conferirTurnstile } from '@/lib/antispam';
import { normalizarProtocolo } from '@/lib/protocolo';
import { embaralhar } from '@/lib/segredos';
import { dentroDoLimite, FORA_DO_AR, prepararServidor, type Servidor } from '@/lib/servidor';
import { descreverSituacao, type DadosDoBanco, type Situacao } from '@/lib/situacao';

export type ResultadoConsulta = { ok: true; situacao: Situacao } | { ok: false; erro: string };
type Entrada = { protocolo?: unknown; token?: unknown };

const NAO_ACHEI = 'Não achamos esse protocolo. Confira as letras e os números.';

/** Antispam + limite + protocolo válido. Devolve o servidor e o código embaralhado, ou o erro. */
async function abrir(entrada: Entrada): Promise<{ s: Servidor; hash: string } | { erro: string }> {
  const protocolo = normalizarProtocolo(typeof entrada.protocolo === 'string' ? entrada.protocolo : '');
  if (!protocolo) return { erro: NAO_ACHEI };
  const s = prepararServidor();
  const segredoTurnstile = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!s || !segredoTurnstile) return { erro: FORA_DO_AR };
  if (!(await conferirTurnstile(entrada.token, segredoTurnstile))) return { erro: 'Não conseguimos confirmar que você é uma pessoa. Tente de novo.' };
  const limite = await dentroDoLimite(s, 'consulta');
  if (limite === null) return { erro: FORA_DO_AR };
  if (!limite) return { erro: 'Muitas consultas deste lugar agora. Tente daqui a pouco.' };
  return { s, hash: embaralhar(protocolo, s.segredoAnonimato) };
}

async function ler(s: Servidor, hash: string): Promise<ResultadoConsulta> {
  const { data: m, error } = await s.banco
    .from('manifestacoes')
    .select('id, andamento, publicacao, prazo_em, prorrogada_ate, explicacao_prorrogacao, resposta, excluida_em')
    .eq('protocolo_hash', hash)
    .maybeSingle();
  if (error) return { ok: false, erro: FORA_DO_AR };
  if (!m) return { ok: false, erro: NAO_ACHEI };
  // A justificativa que vale é a da ação que levou ao estado atual (exclusão, recusa ou retirada).
  const acao = m.excluida_em ? 'exclusao' : m.publicacao === 'recusada' ? 'recusa' : m.publicacao === 'retirada' ? 'retirada' : null;
  let justificativa: string | null = null;
  if (acao) {
    const { data: j } = await s.banco.from('justificativas').select('texto_formal').eq('manifestacao_id', m.id).eq('acao', acao).order('criada_em', { ascending: false }).limit(1).maybeSingle();
    justificativa = j?.texto_formal ?? null;
  }
  return { ok: true, situacao: descreverSituacao(m as DadosDoBanco, justificativa) };
}

export async function consultarProtocolo(entrada: Entrada): Promise<ResultadoConsulta> {
  const aberto = await abrir(entrada ?? {});
  if ('erro' in aberto) return { ok: false, erro: aberto.erro };
  return ler(aberto.s, aberto.hash);
}

/** Desistência: cancela o pedido de mural ou tira do mural. Não pede justificativa (regra 20). */
export async function desistir(entrada: Entrada): Promise<ResultadoConsulta> {
  const aberto = await abrir(entrada ?? {});
  if ('erro' in aberto) return { ok: false, erro: aberto.erro };
  const { error } = await aberto.s.banco
    .from('manifestacoes')
    .update({ publicacao: 'desistida', atualizada_em: new Date().toISOString() })
    .eq('protocolo_hash', aberto.hash)
    .in('publicacao', ['aguardando', 'publicada'])
    .is('excluida_em', null);
  if (error) return { ok: false, erro: FORA_DO_AR };
  return ler(aberto.s, aberto.hash);
}
