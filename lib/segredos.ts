// Segredos do servidor (regra 12 do CLAUDE.md: falha fechada). Se uma chave não estiver
// configurada, a ação é recusada, em vez de funcionar sem proteção. Só roda no servidor.
import { createHmac, timingSafeEqual } from 'node:crypto';

export class SegredoFaltando extends Error {
  constructor(nome: string) {
    super(`Variável ${nome} não configurada`);
  }
}

/** Lê uma variável obrigatória; sem ela, lança erro (e a ação mostra "fora do ar"). */
export function exigir(nome: string, ambiente: Record<string, string | undefined> = process.env): string {
  const valor = ambiente[nome]?.trim();
  if (!valor) throw new SegredoFaltando(nome);
  return valor;
}

/** O segredo do anonimato precisa ser longo; um curto seria fácil de adivinhar. */
export function exigirSegredoAnonimato(ambiente: Record<string, string | undefined> = process.env): string {
  const valor = exigir('SEGREDO_ANONIMATO', ambiente);
  if (valor.length < 32) throw new SegredoFaltando('SEGREDO_ANONIMATO (curto demais)');
  return valor;
}

/** Embaralha um valor (IP, protocolo) com o segredo. Sem o segredo, não dá para voltar atrás. */
export function embaralhar(valor: string, segredo: string): string {
  return createHmac('sha256', segredo).update(valor).digest('hex');
}

/** Compara dois segredos em tempo constante (não deixa medir quantas letras acertou). */
export function compararSeguro(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * A rotina diária só roda chamada pela Vercel, que manda "Authorization: Bearer <CRON_SECRET>".
 * Sem CRON_SECRET configurado, ninguém passa (falha fechada).
 */
export function rotinaAutorizada(cabecalho: string | null, ambiente: Record<string, string | undefined> = process.env): boolean {
  const segredo = ambiente.CRON_SECRET?.trim();
  if (!segredo || !cabecalho) return false;
  return compararSeguro(cabecalho, `Bearer ${segredo}`);
}
