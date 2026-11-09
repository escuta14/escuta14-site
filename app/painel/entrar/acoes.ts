'use server';
// Entrar no painel e pedir link para trocar a senha. As mensagens não dizem se o e-mail existe
// (para ninguém descobrir quem tem conta). Cada IP tem um limite por hora (lib/antispam.ts): o
// limite do Supabase não basta, porque para ele quem chama é sempre o servidor da Vercel.
// Sem os segredos do servidor, recusa (falha fechada; regra 12).
import { redirect } from 'next/navigation';
import { clienteDaSessao } from '@/lib/sessao';
import { dentroDoLimite, FORA_DO_AR, prepararServidor } from '@/lib/servidor';
import type { Acao } from '@/lib/antispam';

/** Conta a tentativa. null = pode seguir; senão, a mensagem de erro. */
async function conferirLimite(acao: Acao): Promise<string | null> {
  const s = prepararServidor();
  if (!s) return FORA_DO_AR;
  const ok = await dentroDoLimite(s, acao);
  if (ok === null) return FORA_DO_AR;
  return ok ? null : 'Muitas tentativas deste lugar agora. Espere uma hora e tente de novo.';
}

export type Estado = { erro?: string; aviso?: string };

export async function entrar(_: Estado, dados: FormData): Promise<Estado> {
  const email = String(dados.get('email') ?? '').trim().toLowerCase();
  const senha = String(dados.get('senha') ?? '');
  if (!email || !senha) return { erro: 'Preencha o e-mail e a senha.' };
  const barrado = await conferirLimite('login');
  if (barrado) return { erro: barrado };
  const banco = await clienteDaSessao();
  const { data, error } = await banco.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { erro: 'E-mail ou senha não conferem.' };
  const { data: membro } = await banco.from('equipe').select('ativo').eq('usuario_id', data.user.id).maybeSingle();
  if (!membro?.ativo) {
    await banco.auth.signOut();
    return { erro: 'Esta conta não tem mais acesso.' };
  }
  redirect('/painel');
}

export async function esqueciSenha(_: Estado, dados: FormData): Promise<Estado> {
  const email = String(dados.get('email') ?? '').trim().toLowerCase();
  if (!email.includes('@')) return { erro: 'Escreva o seu e-mail no campo acima.' };
  const barrado = await conferirLimite('senha');
  if (barrado) return { erro: barrado };
  const banco = await clienteDaSessao();
  await banco.auth.resetPasswordForEmail(email, { redirectTo: 'https://escuta14.vercel.app/painel/confirmar' });
  return { aviso: 'Se esse e-mail tiver conta no painel, chega um link em alguns minutos. Olhe também o spam.' };
}

export async function sair() {
  const banco = await clienteDaSessao();
  await banco.auth.signOut();
  redirect('/painel/entrar');
}
