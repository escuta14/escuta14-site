// Antispam (spec, regras 3, 8 e 9). Duas camadas:
// 1. Turnstile da Cloudflare: confirma que quem envia é uma pessoa. O IP de quem envia NÃO é
//    mandado para a Cloudflare na conferência (o campo é opcional e fica de fora).
// 2. Limite por hora: conta tentativas por "IP embaralhado + ação + hora". A tabela `limites`
//    não tem ligação nenhuma com manifestações ou votos e é apagada em 2 dias.

export const LIMITES = { envio: 60, voto: 1000, consulta: 120 } as const;
export type Acao = keyof typeof LIMITES;

const ENDERECO_TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Pergunta à Cloudflare se o token do widget é válido. Qualquer falha conta como "não". */
export async function conferirTurnstile(token: unknown, segredo: string, buscar: typeof fetch = fetch): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;
  try {
    const resposta = await buscar(ENDERECO_TURNSTILE, { method: 'POST', body: new URLSearchParams({ secret: segredo, response: token }) });
    if (!resposta.ok) return false;
    const corpo = (await resposta.json()) as { success?: boolean };
    return corpo.success === true;
  } catch {
    return false;
  }
}

/** Chave da janela de uma hora: "<ip embaralhado>:<ação>:2026-11-10T14". */
export function chaveDaJanela(ipEmbaralhado: string, acao: Acao, agora: Date): string {
  return `${ipEmbaralhado}:${acao}:${agora.toISOString().slice(0, 13)}`;
}
