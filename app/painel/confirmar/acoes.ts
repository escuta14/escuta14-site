'use server';
// Cria a sessão do painel a partir do link do e-mail. O Supabase pode mandar o acesso de três
// jeitos, conforme o tipo de e-mail; os três terminam numa sessão em cookie httpOnly, criada aqui
// no servidor (o navegador nunca fala com o banco; ADR 0001).
import { clienteDaSessao } from '@/lib/sessao';

export type Entrada = { codigo?: string; acesso?: string; renovacao?: string; tokenHash?: string; tipo?: string };

export async function confirmarLink(e: Entrada): Promise<boolean> {
  const banco = await clienteDaSessao();
  if (typeof e.codigo === 'string' && e.codigo) {
    // "Esqueci a senha" pedido neste navegador (fluxo PKCE).
    const { error } = await banco.auth.exchangeCodeForSession(e.codigo);
    return !error;
  }
  if (typeof e.acesso === 'string' && typeof e.renovacao === 'string' && e.acesso && e.renovacao) {
    // Convite (modelo padrão do Supabase): o acesso vem depois do "#" no endereço.
    const { error } = await banco.auth.setSession({ access_token: e.acesso, refresh_token: e.renovacao });
    return !error;
  }
  if (typeof e.tokenHash === 'string' && (e.tipo === 'invite' || e.tipo === 'recovery')) {
    // Modelo de e-mail próprio (se um dia houver SMTP): ?token_hash=...&type=...
    const { error } = await banco.auth.verifyOtp({ type: e.tipo, token_hash: e.tokenHash });
    return !error;
  }
  return false;
}
