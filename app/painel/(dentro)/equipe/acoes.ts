'use server';
// Equipe do painel (spec, /painel/equipe): só a direção. Convidar manda um e-mail do Supabase
// para a pessoa criar a própria senha (ninguém da escola vê a senha). Mudar papel, desativar e
// reativar passam pela função do banco, que confere a direção e anota no histórico.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirEquipe } from '@/lib/equipe';
import { codigoDoErro, PAPEIS } from '@/lib/painel';
import { bancoDoServidor } from '@/lib/supabase-servidor';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Para onde o link do e-mail leva (liberado no Supabase, em URL Configuration).
const ENDERECO_CONFIRMAR = 'https://escuta14.vercel.app/painel/confirmar';

export async function convidar(d: FormData) {
  await exigirEquipe(true);
  const nome = String(d.get('nome') ?? '').trim();
  const email = String(d.get('email') ?? '').trim().toLowerCase();
  const papel = String(d.get('papel') ?? '');
  if (nome.length < 2 || !EMAIL.test(email) || !(papel in PAPEIS)) redirect('/painel/equipe?erro=dados');

  // Convite: precisa da chave secreta (criar conta é coisa do servidor, nunca do navegador).
  const admin = bancoDoServidor();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: ENDERECO_CONFIRMAR });
  if (error || !data.user) redirect(`/painel/equipe?erro=${error?.code === 'email_exists' ? 'existe' : 'convite'}`);
  const { error: e2 } = await admin.from('equipe').insert({ usuario_id: data.user.id, nome, papel });
  if (e2) redirect('/painel/equipe?erro=convite');
  revalidatePath('/painel/equipe');
  redirect('/painel/equipe?feito=convite');
}

export async function mudar(d: FormData) {
  const { banco } = await exigirEquipe(true);
  const { error } = await banco.rpc('painel_equipe', {
    p_usuario: String(d.get('usuario') ?? ''),
    p_papel: String(d.get('papel') ?? ''),
    p_ativo: String(d.get('ativo') ?? '') === 'sim',
  });
  revalidatePath('/painel/equipe');
  redirect(error ? `/painel/equipe?erro=${codigoDoErro(error.message)}` : '/painel/equipe?feito=equipe');
}
