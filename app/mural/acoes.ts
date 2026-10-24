'use server';
// Voto no mural: apoiar, contestar, trocar ou desfazer (spec, regra 23). "Aparelho" é um código
// aleatório num cookie protegido de 1 ano; o banco recebe só a versão embaralhada. Sem login e
// sem antispam visual: o limite é de 1.000 votos por hora por lugar (regra 9).
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { embaralhar } from '@/lib/segredos';
import { dentroDoLimite, FORA_DO_AR, prepararServidor } from '@/lib/servidor';
import { COOKIE_APARELHO, cookieValido } from '@/lib/aparelho';

export type ResultadoVoto = { ok: true; apoios: number; contestacoes: number; meuVoto: 'apoio' | 'contestacao' | null } | { ok: false; erro: string };

const CODIGO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function votar(codigo: unknown, tipo: unknown): Promise<ResultadoVoto> {
  if (typeof codigo !== 'string' || !CODIGO.test(codigo)) return { ok: false, erro: 'Esta manifestação não recebe mais apoios.' };
  if (tipo !== 'apoio' && tipo !== 'contestacao' && tipo !== null) return { ok: false, erro: 'Escolha apoiar ou contestar.' };

  const s = prepararServidor();
  if (!s) return { ok: false, erro: FORA_DO_AR };
  const limite = await dentroDoLimite(s, 'voto');
  if (limite === null) return { ok: false, erro: FORA_DO_AR };
  if (!limite) return { ok: false, erro: 'Muitos votos deste lugar agora. Tente daqui a pouco.' };

  const pote = await cookies();
  let aparelho = pote.get(COOKIE_APARELHO)?.value;
  if (!cookieValido(aparelho)) {
    aparelho = randomBytes(32).toString('base64url');
    pote.set(COOKIE_APARELHO, aparelho, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
  }

  const { data, error } = await s.banco.rpc('votar', { p_codigo: codigo, p_votante: embaralhar(`aparelho:${aparelho}`, s.segredoAnonimato), p_tipo: tipo });
  if (error) {
    if (error.message?.includes('nao_recebe_votos')) return { ok: false, erro: 'Esta manifestação não recebe mais apoios.' };
    console.error('voto: falha', error.code);
    return { ok: false, erro: FORA_DO_AR };
  }
  const linha = Array.isArray(data) ? data[0] : data;
  return { ok: true, apoios: linha?.total_apoios ?? 0, contestacoes: linha?.total_contestacoes ?? 0, meuVoto: linha?.voto_atual ?? null };
}
