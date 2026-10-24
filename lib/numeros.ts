// Contas de "A escola ouviu" (art. 14, § 3º) e de /painel/numeros, testadas em
// testes/numeros.test.ts. O banco já manda tudo somado (numeros_do_ano, migration 0004): cada linha
// é um grupo de mês + tema + categoria + segmento, nunca uma manifestação. Aqui só se junta.
import { CATEGORIAS, SEGMENTOS, TEMAS } from './opcoes';

export type LinhaNumeros = {
  mes: number;
  tema: string;
  categoria: string;
  segmento: string;
  total: number;
  com_desfecho: number;
  no_prazo: number;
};

/** [rótulo, quantidade], na ordem da lista da lei; quem tem zero também aparece. */
export type Contagem = [string, number][];

export type Resumo = {
  total: number;
  porTema: Contagem;
  porCategoria: Contagem;
  porSegmento: Contagem;
  /** Respondidas no prazo sobre as que já têm desfecho (respondidas ou com prazo vencido). */
  noPrazo: number;
  comDesfecho: number;
  /** 0 a 100, arredondado; null enquanto nenhuma tem desfecho (não dá para dizer nada ainda). */
  percentualNoPrazo: number | null;
};

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const nomeDoMes = (mes: number) => MESES[mes - 1] ?? '';

function contar(linhas: LinhaNumeros[], lista: readonly (readonly [string, string])[], campo: 'tema' | 'categoria' | 'segmento'): Contagem {
  return lista.map(([valor, rotulo]) => [rotulo, linhas.filter((l) => l[campo] === valor).reduce((s, l) => s + l.total, 0)]);
}

/** Junta as linhas (todas ou só as de um mês). */
export function resumir(linhas: LinhaNumeros[], mes?: number): Resumo {
  const doRecorte = mes === undefined ? linhas : linhas.filter((l) => l.mes === mes);
  const soma = (campo: 'total' | 'com_desfecho' | 'no_prazo') => doRecorte.reduce((s, l) => s + l[campo], 0);
  const comDesfecho = soma('com_desfecho');
  const noPrazo = soma('no_prazo');
  return {
    total: soma('total'),
    porTema: contar(doRecorte, TEMAS, 'tema'),
    porCategoria: contar(doRecorte, CATEGORIAS, 'categoria'),
    porSegmento: contar(doRecorte, SEGMENTOS, 'segmento'),
    noPrazo,
    comDesfecho,
    percentualNoPrazo: comDesfecho === 0 ? null : Math.round((noPrazo / comDesfecho) * 100),
  };
}

/** Total de cada mês que já teve manifestação, do mais antigo ao mais novo (painel). */
export function porMes(linhas: LinhaNumeros[]): Contagem {
  const meses = [...new Set(linhas.map((l) => l.mes))].sort((a, b) => a - b);
  return meses.map((m) => [nomeDoMes(m), linhas.filter((l) => l.mes === m).reduce((s, l) => s + l.total, 0)]);
}
