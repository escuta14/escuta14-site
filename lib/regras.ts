// Regras do envio de manifestação (spec, regras 5 e 6). Função pura: recebe o que veio do
// navegador e devolve os dados limpos ou a mensagem de erro que a pessoa vai ler.
import { CATEGORIAS, SEGMENTOS, TEMAS, estaNaLista, type Categoria, type Segmento, type Tema } from './opcoes';

export const TEXTO_MINIMO = 10;
export const TEXTO_MAXIMO = 3000;

export type EntradaEnvio = {
  categoria?: unknown;
  tema?: unknown;
  segmento?: unknown;
  texto?: unknown;
  publica?: unknown;
  token?: unknown;
};

export type EnvioValido = {
  categoria: Categoria;
  tema: Tema;
  segmento: Segmento;
  texto: string;
  publicacao: 'aguardando' | 'privada';
};

/** Conta letras como o banco conta (char_length): emoji e acento valem 1. */
export function contarCaracteres(texto: string): number {
  return Array.from(texto).length;
}

export function validarEnvio(entrada: EntradaEnvio): { ok: true; dados: EnvioValido } | { ok: false; erro: string } {
  const falta: string[] = [];
  if (!estaNaLista(CATEGORIAS, entrada.categoria)) falta.push('o tipo');
  if (!estaNaLista(TEMAS, entrada.tema)) falta.push('o assunto');
  if (!estaNaLista(SEGMENTOS, entrada.segmento)) falta.push('quem você é');
  if (falta.length) return { ok: false, erro: `Falta escolher ${falta.join(', ')}.` };

  // Regra 5: de 10 a 3.000 caracteres depois de tirar os espaços das pontas.
  const texto = typeof entrada.texto === 'string' ? entrada.texto.trim() : '';
  const tamanho = contarCaracteres(texto);
  if (tamanho < TEXTO_MINIMO) return { ok: false, erro: `Escreva pelo menos ${TEXTO_MINIMO} letras. Faltam ${TEXTO_MINIMO - tamanho}.` };
  if (tamanho > TEXTO_MAXIMO) return { ok: false, erro: `O texto passou do limite. Tire ${tamanho - TEXTO_MAXIMO} caracteres.` };

  return {
    ok: true,
    dados: {
      categoria: entrada.categoria as Categoria,
      tema: entrada.tema as Tema,
      segmento: entrada.segmento as Segmento,
      texto,
      // Regra 6: com pedido público nasce "aguardando" (a direção aprova antes); sem pedido, "privada".
      publicacao: entrada.publica === true ? 'aguardando' : 'privada',
    },
  };
}
