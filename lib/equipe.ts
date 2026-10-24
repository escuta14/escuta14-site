// Quem está usando o painel: lê a sessão e a linha em `equipe` (com ativo = true). Sem sessão ou
// sem papel ativo, manda para o login. Usado no molde do painel e em toda ação do painel.
import 'server-only';
import { redirect } from 'next/navigation';
import { clienteDaSessao } from './sessao';
import type { Papel } from './painel';

export type Membro = { banco: Awaited<ReturnType<typeof clienteDaSessao>>; usuarioId: string; nome: string; papel: Papel };

export async function exigirEquipe(soDirecao = false): Promise<Membro> {
  const banco = await clienteDaSessao();
  const {
    data: { user },
  } = await banco.auth.getUser();
  if (!user) redirect('/painel/entrar');
  const { data } = await banco.from('equipe').select('nome, papel, ativo').eq('usuario_id', user.id).maybeSingle();
  if (!data || !data.ativo) {
    await banco.auth.signOut();
    redirect('/painel/entrar?motivo=sem-acesso');
  }
  if (soDirecao && data.papel !== 'direcao') redirect('/painel');
  return { banco, usuarioId: user.id, nome: data.nome, papel: data.papel as Papel };
}
