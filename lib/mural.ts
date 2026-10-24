// Lista do mural, lida no servidor (o navegador nunca fala com o banco; ADR 0001). Usa o cookie
// do aparelho, se existir, só para marcar em qual botão a pessoa já votou.
import 'server-only';
import { cookies } from 'next/headers';
import { COOKIE_APARELHO, cookieValido } from './aparelho';
import { embaralhar } from './segredos';
import { prepararServidor } from './servidor';

export type ItemMural = {
  codigo: string;
  categoria: string;
  tema: string;
  segmento: string;
  dia: string;
  texto: string | null;
  resposta: string | null;
  aviso: string | null;
  apoios: number;
  contestacoes: number;
  meu_voto: 'apoio' | 'contestacao' | null;
};

export async function listarMural(): Promise<ItemMural[] | null> {
  const s = prepararServidor();
  if (!s) return null;
  const aparelho = (await cookies()).get(COOKIE_APARELHO)?.value;
  const votante = cookieValido(aparelho) ? embaralhar(`aparelho:${aparelho}`, s.segredoAnonimato) : '';
  const { data, error } = await s.banco.rpc('mural_listar', { p_votante: votante });
  if (error) {
    console.error('mural: falha', error.code);
    return null;
  }
  return (data ?? []) as ItemMural[];
}
