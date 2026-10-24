// Peças que as ações do servidor (enviar, consultar, votar) dividem: segredos com falha
// fechada, IP de quem chamou (só para o limite) e a conta do limite por hora.
import 'server-only';
import { headers } from 'next/headers';
import { chaveDaJanela, LIMITES, type Acao } from './antispam';
import { embaralhar, exigirSegredoAnonimato } from './segredos';
import { bancoDoServidor } from './supabase-servidor';

export type Servidor = { banco: ReturnType<typeof bancoDoServidor>; segredoAnonimato: string };

export const FORA_DO_AR = 'O ESCUTA 14 está fora do ar agora. Tente de novo daqui a pouco.';

/** Banco + segredo do anonimato. Se faltar configuração, devolve null (e a ação recusa). */
export function prepararServidor(): Servidor | null {
  try {
    return { banco: bancoDoServidor(), segredoAnonimato: exigirSegredoAnonimato() };
  } catch {
    console.error('servidor: configuração incompleta');
    return null;
  }
}

async function ipDaRequisicao(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
}

/** Conta mais uma tentativa da ação nesta hora. true = pode seguir; false = passou do limite; null = banco fora. */
export async function dentroDoLimite(s: Servidor, acao: Acao): Promise<boolean | null> {
  const chave = chaveDaJanela(embaralhar(await ipDaRequisicao(), s.segredoAnonimato), acao, new Date());
  const { data, error } = await s.banco.rpc('registrar_tentativa', { p_chave: chave, p_maximo: LIMITES[acao] });
  if (error) {
    console.error('limite: falha', error.code);
    return null;
  }
  return data === true;
}
