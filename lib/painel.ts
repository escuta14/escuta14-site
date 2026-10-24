// Regras puras do painel (testadas em testes/painel.test.ts): prazo e urgência, fundamentos da
// lei por ação, e a tradução dos erros do banco para as frases da spec ("Casos de erro").

export const PAPEIS = { direcao: 'Direção', atendimento: 'Atendimento' } as const;
export type Papel = keyof typeof PAPEIS;

export const ANDAMENTOS = { nova: 'Nova', em_analise: 'Em análise', respondida: 'Respondida', arquivada: 'Arquivada' } as const;
export const PUBLICACOES = {
  privada: 'Privada',
  aguardando: 'Pediu o mural',
  publicada: 'No mural',
  recusada: 'Mural recusado',
  retirada: 'Retirada do mural',
  desistida: 'Autor desistiu do mural',
} as const;

/** Fundamentos do art. 12 (ADR 0003). Recusa e retirada: § 1º. Exclusão: § 3º. */
export const FUNDAMENTOS_MURAL = [
  ['identifica_pessoa', 'Identifica o autor ou outra pessoa (§ 1º, I)'],
  ['expoe_ou_constrange', 'Expõe ou constrange alguém (§ 1º, II)'],
  ['linguagem_desrespeitosa', 'Linguagem desrespeitosa, ofensiva ou discriminatória (§ 1º, III)'],
  ['dado_pessoal', 'Contém dado pessoal (§ 1º, IV)'],
  ['sem_relacao', 'Sem relação com a comunidade escolar (§ 1º, V)'],
] as const;
export const FUNDAMENTOS_EXCLUSAO = [
  ['propaganda_ou_spam', 'Propaganda, spam ou texto sem sentido (§ 3º, I)'],
  ['repetida', 'Repete manifestação já enviada (§ 3º, II)'],
  ['apenas_ofensas', 'Apenas ofensas, sem nada aproveitável (§ 3º, III)'],
] as const;

const DIA = 24 * 60 * 60 * 1000;
/** A partir de quantos dias sem resposta a lista destaca a manifestação (prazo de 30). */
export const AVISO_PRAZO_DIAS = 25;

/** "aguardando há 26 dias", com destaque quando chega perto do prazo (spec, tela /painel). */
export function prazoNaLista(criadaEm: string, temResposta: boolean, hoje = new Date()): { texto: string; urgente: boolean } | null {
  if (temResposta) return null;
  const dias = Math.max(0, Math.floor((hoje.getTime() - new Date(criadaEm).getTime()) / DIA));
  return { texto: dias === 1 ? 'aguardando há 1 dia' : `aguardando há ${dias} dias`, urgente: dias >= AVISO_PRAZO_DIAS };
}

const ERROS: Record<string, string> = {
  sem_acesso: 'Esta conta não tem mais acesso.',
  so_direcao: 'Só a direção pode fazer isso.',
  nao_encontrada: 'Não achamos essa manifestação.',
  falta_fundamento: 'Escolha o fundamento da lei e explique o caso (pelo menos 20 letras).',
  falta_explicacao: 'Escreva a explicação que o autor vai ler.',
  ja_prorrogada: 'O prazo desta manifestação já foi prorrogado uma vez.',
  acao_invalida: 'Essa ação não vale para a situação atual da manifestação.',
  andamento_invalido: 'Esse andamento não pode ser escolhido aqui.',
  arquivar_so_respondida: 'Responda antes de arquivar.',
  nao_a_si_mesmo: 'Você não pode tirar o seu próprio acesso de direção. Peça para outra pessoa da direção.',
};

/** Código curto e conhecido do erro do banco (vai na URL), ou "falhou". Nunca a mensagem inteira. */
export function codigoDoErro(mensagem: string | undefined): string {
  return Object.keys(ERROS).find((k) => mensagem?.includes(k)) ?? 'falhou';
}

/** Erro do banco → frase da spec. Nunca devolve detalhe interno (nome de tabela, SQL). */
export function erroDoPainel(mensagem: string | undefined): string {
  const chave = Object.keys(ERROS).find((k) => mensagem?.includes(k));
  return chave ? ERROS[chave] : 'Não deu certo agora. Tente de novo.';
}
