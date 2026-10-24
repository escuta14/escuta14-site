// Leitura de "A escola ouviu" no servidor (o navegador nunca fala com o banco; ADR 0001): os
// números do ano já somados e as providências que a direção deixou na página. Só colunas que
// podem ser públicas: nunca id, hora exata nem quem publicou (spec, regra 26).
import 'server-only';
import type { LinhaNumeros } from './numeros';
import { prepararServidor } from './servidor';

export type Providencia = {
  titulo: string;
  texto: string;
  tema: string;
  feita_em: string;
};

export async function lerEscolaOuviu(): Promise<{
  linhas: LinhaNumeros[];
  providencias: Providencia[];
} | null> {
  const s = prepararServidor();
  if (!s) return null;
  const [numeros, providencias] = await Promise.all([
    s.banco.rpc('numeros_do_ano'),
    s.banco.from('providencias').select('titulo, texto, tema, feita_em').is('oculta_em', null).order('feita_em', { ascending: false }).limit(100),
  ]);
  if (numeros.error || providencias.error) {
    console.error('escola ouviu: falha', numeros.error?.code ?? providencias.error?.code);
    return null;
  }
  return {
    linhas: (numeros.data ?? []) as LinhaNumeros[],
    providencias: (providencias.data ?? []) as Providencia[],
  };
}
