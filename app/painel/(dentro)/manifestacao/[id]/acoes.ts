'use server';
// Ações do detalhe da manifestação. Cada uma chama a função do banco com a sessão de quem
// entrou; o banco confere o papel, valida e anota no histórico (supabase/migrations/0003).
// O resultado volta pela URL como um código curto (?feito=... ou ?erro=...), sem dado nenhum.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirEquipe } from '@/lib/equipe';
import { codigoDoErro } from '@/lib/painel';

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function chamar(dados: FormData, funcao: string, parametros: (d: FormData) => Record<string, unknown>, feito: string) {
  const id = String(dados.get('id') ?? '');
  if (!ID.test(id)) redirect('/painel');
  const { banco } = await exigirEquipe();
  const { error } = await banco.rpc(funcao, { p_id: id, ...parametros(dados) });
  revalidatePath(`/painel/manifestacao/${id}`);
  revalidatePath('/painel');
  const codigo = error ? `erro=${codigoDoErro(error.message)}` : `feito=${feito}`;
  redirect(`/painel/manifestacao/${id}?${codigo}`);
}

const texto = (d: FormData, campo: string) => String(d.get(campo) ?? '').trim();
const ouNulo = (d: FormData, campo: string) => texto(d, campo) || null;

export async function responder(d: FormData) {
  await chamar(d, 'painel_responder', (x) => ({ p_resposta: texto(x, 'resposta') }), 'resposta');
}
export async function mudarAndamento(d: FormData) {
  await chamar(d, 'painel_andamento', (x) => ({ p_andamento: texto(x, 'andamento') }), 'andamento');
}
export async function corrigirTema(d: FormData) {
  await chamar(d, 'painel_tema', (x) => ({ p_tema: texto(x, 'tema') }), 'tema');
}
export async function avaliacao(d: FormData) {
  await chamar(d, 'painel_avaliacao', (x) => ({ p_pedir: texto(x, 'pedir') === 'sim' }), 'avaliacao');
}
export async function moderar(d: FormData) {
  await chamar(d, 'painel_moderar', (x) => ({ p_acao: texto(x, 'acao'), p_fundamento: ouNulo(x, 'fundamento'), p_explicacao: ouNulo(x, 'explicacao') }), 'mural');
}
export async function prorrogar(d: FormData) {
  await chamar(d, 'painel_prorrogar', (x) => ({ p_explicacao: texto(x, 'explicacao') }), 'prorrogar');
}
export async function excluir(d: FormData) {
  await chamar(d, 'painel_excluir', (x) => ({ p_fundamento: ouNulo(x, 'fundamento'), p_explicacao: texto(x, 'explicacao') }), 'excluir');
}
