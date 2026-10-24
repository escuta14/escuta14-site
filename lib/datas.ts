// Datas do ESCUTA 14, sempre no horário de Brasília: prazo de resposta (30 dias, art. 8º) e
// período da mostra (o que chega nele nasce como demonstração; spec, regra 10).

export const PRAZO_DIAS = 30;
const FUSO = 'America/Sao_Paulo';
const MOSTRA_PADRAO = { inicio: '2026-11-10T00:00:00-03:00', fim: '2026-11-11T00:00:00-03:00' };

export function calcularPrazo(envio: Date): Date {
  return new Date(envio.getTime() + PRAZO_DIAS * 24 * 60 * 60 * 1000);
}

/** "21/11/2026", como a pessoa lê. */
export function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "2026-11-21", para a coluna de data do banco (no dia de Brasília, não no de Londres). */
export function dataDoBanco(data: Date): string {
  return data.toLocaleDateString('en-CA', { timeZone: FUSO });
}

export function ehDemonstracao(agora: Date, inicio = MOSTRA_PADRAO.inicio, fim = MOSTRA_PADRAO.fim): boolean {
  const de = Date.parse(inicio || MOSTRA_PADRAO.inicio);
  const ate = Date.parse(fim || MOSTRA_PADRAO.fim);
  return agora.getTime() >= de && agora.getTime() < ate;
}

/** Mês de hoje (1 a 12) no horário de Brasília: "A escola ouviu" mostra o mês e o ano. */
export function mesDe(data: Date): number {
  return Number(dataDoBanco(data).slice(5, 7));
}
