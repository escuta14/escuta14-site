'use server';
// Providências (spec, /painel/providencias): só a direção publica ou tira da página. O que chega
// do formulário é conferido aqui e de novo no banco, que confere o papel e anota no histórico.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirEquipe } from '@/lib/equipe';
import { codigoDoErro, validarProvidencia } from '@/lib/painel';

export async function publicar(d: FormData) {
  const { banco } = await exigirEquipe(true);
  const titulo = String(d.get('titulo') ?? '').trim();
  const texto = String(d.get('texto') ?? '').trim();
  const tema = String(d.get('tema') ?? '');
  const data = String(d.get('data') ?? '');
  const invalida = validarProvidencia(titulo, texto, tema, data);
  if (invalida) redirect(`/painel/providencias?erro=${invalida}`);
  const { error } = await banco.rpc('painel_providencia', { p_titulo: titulo, p_texto: texto, p_tema: tema, p_feita_em: data });
  revalidatePath('/a-escola-ouviu');
  redirect(error ? `/painel/providencias?erro=${codigoDoErro(error.message)}` : '/painel/providencias?feito=providencia');
}

export async function mostrar(d: FormData) {
  const { banco } = await exigirEquipe(true);
  const { error } = await banco.rpc('painel_providencia_mostrar', { p_id: String(d.get('id') ?? ''), p_mostrar: d.get('mostrar') === 'sim' });
  revalidatePath('/a-escola-ouviu');
  redirect(error ? `/painel/providencias?erro=${codigoDoErro(error.message)}` : '/painel/providencias?feito=providencia_mudou');
}
