// Testes da trava da rotina diária (lib/segredos.ts): só passa com o CRON_SECRET certo, e sem ele
// configurado ninguém passa (falha fechada; regra 12 do CLAUDE.md).
import { describe, expect, it } from 'vitest';
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
