// Traduz o estado de uma manifestação (como está no banco) para o que o autor lê ao consultar
// o protocolo (spec, tela Acompanhar). Função pura, testada em testes/situacao.test.ts.

export type DadosDoBanco = {
  andamento: 'nova' | 'em_analise' | 'respondida' | 'arquivada';
  publicacao: 'privada' | 'aguardando' | 'publicada' | 'recusada' | 'retirada' | 'desistida';
  prazo_em: string;
  prorrogada_ate: string | null;
  explicacao_prorrogacao: string | null;
  resposta: string | null;
  excluida_em: string | null;
};

export type Situacao = {
  andamento: string;
  prazo: string | null;
  resposta: string | null;
  mural: string | null;
  justificativa: string | null;
  /** O que o autor pode fazer sozinho (desistência, sem justificativa; spec, regra 20). */
  desistencia: 'cancelar' | 'tirar' | null;
};

const ANDAMENTO = {
  nova: 'Recebida. A escola ainda vai ler.',
  em_analise: 'A escola está analisando.',
  respondida: 'Respondida.',
  arquivada: 'Respondida e encerrada.',
} as const;

const MURAL = {
  privada: 'Só a escola vê. Você não pediu para ir ao mural.',
  aguardando: 'Esperando a direção aprovar para o mural.',
  publicada: 'Publicada no mural.',
  recusada: 'A direção não aprovou para o mural.',
  retirada: 'A direção tirou do mural.',
  desistida: 'Você tirou do mural.',
} as const;

/** "2026-11-23" → "23/11/2026". */
export function dataLegivel(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function descreverSituacao(m: DadosDoBanco, justificativa: string | null): Situacao {
  if (m.excluida_em) {
    return { andamento: 'A direção excluiu esta manifestação.', prazo: null, resposta: null, mural: null, justificativa, desistencia: null };
  }
  let prazo: string | null = null;
  if (!m.resposta) {
    prazo = m.prorrogada_ate
      ? `O prazo foi prorrogado até ${dataLegivel(m.prorrogada_ate)}. Explicação da direção: ${m.explicacao_prorrogacao ?? ''}`
      : `A escola tem até ${dataLegivel(m.prazo_em)} para responder.`;
  }
  return {
    andamento: ANDAMENTO[m.andamento],
    prazo,
    resposta: m.resposta,
    mural: MURAL[m.publicacao],
    justificativa: m.publicacao === 'recusada' || m.publicacao === 'retirada' ? justificativa : null,
    desistencia: m.publicacao === 'aguardando' ? 'cancelar' : m.publicacao === 'publicada' ? 'tirar' : null,
  };
}
