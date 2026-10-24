// Listas fixas da lei ESCUTA 14 (arts. 5º, 8º e 16). O valor (sem acento) é o mesmo dos tipos
// do banco (supabase/migrations); o rótulo é o que aparece na tela. Mudar uma lista pede mudar a
// lei, a spec e a migration juntas (regra 14 do CLAUDE.md).

export const CATEGORIAS = [
  ['sugestao', 'Sugestão'],
  ['reclamacao', 'Reclamação'],
  ['critica', 'Crítica'],
  ['elogio', 'Elogio'],
  ['relato', 'Relato'],
  ['proposta', 'Proposta'],
  ['outra', 'Outra'],
] as const;

export const TEMAS = [
  ['infraestrutura', 'Infraestrutura'],
  ['convivencia', 'Convivência'],
  ['ensino', 'Ensino'],
  ['atendimento', 'Atendimento'],
  ['organizacao', 'Organização'],
  ['seguranca', 'Segurança'],
  ['outro', 'Outro'],
] as const;

export const SEGMENTOS = [
  ['estudante', 'Estudante'],
  ['professor', 'Professor'],
  ['funcionario', 'Funcionário'],
  ['responsavel', 'Responsável'],
] as const;

export type Categoria = (typeof CATEGORIAS)[number][0];
export type Tema = (typeof TEMAS)[number][0];
export type Segmento = (typeof SEGMENTOS)[number][0];

/** Confere se um valor que veio do navegador está mesmo na lista (nunca confiar no que chega). */
export function estaNaLista<T extends readonly (readonly [string, string])[]>(lista: T, valor: unknown): valor is T[number][0] {
  return typeof valor === 'string' && lista.some(([v]) => v === valor);
}
