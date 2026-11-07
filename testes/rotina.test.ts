// Testes da trava da rotina diária (lib/segredos.ts): só passa com o CRON_SECRET certo, e sem ele
// configurado ninguém passa (falha fechada; regra 12 do CLAUDE.md).
import { describe, expect, it } from 'vitest';
import { situacaoDaRotina } from '@/lib/rotina';
import { rotinaAutorizada } from '@/lib/segredos';

const ambiente = { CRON_SECRET: 'segredo-de-teste-da-rotina' };

describe('trava da rotina diária', () => {
  it('passa só com o segredo certo', () => {
    expect(rotinaAutorizada('Bearer segredo-de-teste-da-rotina', ambiente)).toBe(true);
    expect(rotinaAutorizada('Bearer segredo-de-teste-da-rotinA', ambiente)).toBe(false);
    expect(rotinaAutorizada('segredo-de-teste-da-rotina', ambiente)).toBe(false);
    expect(rotinaAutorizada(null, ambiente)).toBe(false);
  });
  it('sem CRON_SECRET configurado, ninguém passa', () => {
    expect(rotinaAutorizada('Bearer ', {})).toBe(false);
    expect(rotinaAutorizada('Bearer undefined', {})).toBe(false);
    expect(rotinaAutorizada('Bearer ', { CRON_SECRET: '  ' })).toBe(false);
  });
});

describe('última execução da rotina (painel, Equipe)', () => {
  const agora = new Date('2026-10-26T12:00:00-03:00');
  it('mostra a data e a hora de Brasília', () => {
    expect(situacaoDaRotina('2026-10-26T09:00:30Z', agora)).toEqual({ texto: 'Rodou pela última vez em 26/10/2026 às 06:00.', alerta: false });
  });
  it('avisa quando passa de 26 horas sem rodar, ou se nunca rodou', () => {
    expect(situacaoDaRotina('2026-10-25T18:00:00Z', agora).alerta).toBe(false); // 21 h antes
    expect(situacaoDaRotina('2026-10-25T09:00:00Z', agora).alerta).toBe(true); // 30 h antes
    expect(situacaoDaRotina(null, agora)).toEqual({ texto: 'A rotina ainda não anotou nenhuma execução.', alerta: true });
  });
});
