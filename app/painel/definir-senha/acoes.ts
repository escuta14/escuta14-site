'use server';
// Grava a senha nova de quem abriu o link do e-mail.
import { redirect } from 'next/navigation';
import { clienteDaSessao } from '@/lib/sessao';

export type EstadoSenha = { erro?: string };

export async function definirSenha(_: EstadoSenha, dados: FormData): Promise<EstadoSenha> {
  const senha = String(dados.get('senha') ?? '');
  if (senha.length < 10) return { erro: 'A senha precisa de pelo menos 10 caracteres.' };
  if (senha !== String(dados.get('repetir') ?? '')) return { erro: 'As duas senhas não são iguais.' };
  const banco = await clienteDaSessao();
  const { error } = await banco.auth.updateUser({ password: senha });
  if (error) return { erro: error.code === 'same_password' ? 'Use uma senha diferente da anterior.' : 'Não deu certo. Abra o link do e-mail de novo.' };
  redirect('/painel');
}
