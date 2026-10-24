// Testes das regras do envio (fatia 1.1): validação, protocolo, segredos, datas e antispam.
import { describe, expect, it } from 'vitest';
import { chaveDaJanela, conferirTurnstile } from '@/lib/antispam';
import { calcularPrazo, dataDoBanco, ehDemonstracao, formatarData } from '@/lib/datas';
import { ALFABETO, gerarProtocolo, normalizarProtocolo } from '@/lib/protocolo';
import { contarCaracteres, validarEnvio } from '@/lib/regras';
import { compararSeguro, embaralhar, exigir, exigirSegredoAnonimato } from '@/lib/segredos';

const valido = { categoria: 'reclamacao', tema: 'infraestrutura', segmento: 'estudante', texto: '  O bebedouro está quebrado.  ' };

describe('validação do envio', () => {
  it('aceita um envio completo, tira os espaços das pontas e nasce privada', () => {
    const r = validarEnvio(valido);
    expect(r).toEqual({ ok: true, dados: { categoria: 'reclamacao', tema: 'infraestrutura', segmento: 'estudante', texto: 'O bebedouro está quebrado.', publicacao: 'privada' } });
  });
  it('com pedido público, nasce aguardando', () => {
    const r = validarEnvio({ ...valido, publica: true });
    expect(r.ok && r.dados.publicacao).toBe('aguardando');
  });
  it('só aceita publica === true (texto "true" não vale)', () => {
    const r = validarEnvio({ ...valido, publica: 'true' });
    expect(r.ok && r.dados.publicacao).toBe('privada');
  });
  it('recusa valores fora das listas da lei', () => {
    expect(validarEnvio({ ...valido, categoria: 'xingamento' })).toEqual({ ok: false, erro: 'Falta escolher o tipo.' });
    expect(validarEnvio({ texto: 'algum texto aqui' })).toEqual({ ok: false, erro: 'Falta escolher o tipo, o assunto, quem você é.' });
  });
  it('texto de 9 letras não passa; de 10 passa; espaços não contam', () => {
    expect(validarEnvio({ ...valido, texto: '   123456789   ' }).ok).toBe(false);
    expect(validarEnvio({ ...valido, texto: '1234567890' }).ok).toBe(true);
  });
  it('limite de 3.000 caracteres, contando emoji como 1 (igual ao banco)', () => {
    expect(contarCaracteres('😀😀')).toBe(2);
    expect(validarEnvio({ ...valido, texto: 'a'.repeat(3000) }).ok).toBe(true);
    expect(validarEnvio({ ...valido, texto: 'a'.repeat(3001) })).toEqual({ ok: false, erro: 'O texto passou do limite. Tire 1 caracteres.' });
  });
  it('texto que não é texto vira vazio', () => {
    expect(validarEnvio({ ...valido, texto: 12345678901 }).ok).toBe(false);
  });
});

describe('protocolo', () => {
  it('tem o formato E14-XXXXX-XXXXX e só usa o alfabeto sem 0/O/1/I/L', () => {
    for (let i = 0; i < 200; i++) {
      const p = gerarProtocolo();
      expect(p).toMatch(/^E14-[2-9A-HJKMNP-Z]{5}-[2-9A-HJKMNP-Z]{5}$/);
    }
    expect(ALFABETO).not.toMatch(/[01OIL]/);
  });
  it('descarta bytes que puxariam a sorte para algumas letras (248 a 255)', () => {
    // Primeiro sorteio: só bytes descartados. Segundo: o byte 0, que vira a letra "2".
    let vez = 0;
    const p = gerarProtocolo((n) => new Uint8Array(n).fill(vez++ === 0 ? 250 : 0));
    expect(p).toBe('E14-22222-22222');
  });
  it('lê o que a pessoa digitou de vários jeitos', () => {
    expect(normalizarProtocolo('e14 abcde fghjk')).toBe('E14-ABCDE-FGHJK');
    expect(normalizarProtocolo('ABCDEFGHJK')).toBe('E14-ABCDE-FGHJK');
    expect(normalizarProtocolo('E14-ABCDE-FGHJ0')).toBeNull();
    expect(normalizarProtocolo('E14-ABC')).toBeNull();
  });
});

describe('segredos', () => {
  it('falha fechada: sem a variável, lança erro', () => {
    expect(() => exigir('NADA', {})).toThrow();
    expect(() => exigir('NADA', { NADA: '   ' })).toThrow();
    expect(exigir('X', { X: ' abc ' })).toBe('abc');
  });
  it('segredo do anonimato precisa de 32 caracteres', () => {
    expect(() => exigirSegredoAnonimato({ SEGREDO_ANONIMATO: 'curto' })).toThrow();
    expect(exigirSegredoAnonimato({ SEGREDO_ANONIMATO: 'x'.repeat(32) })).toHaveLength(32);
  });
  it('embaralha sempre igual com o mesmo segredo e diferente com outro', () => {
    expect(embaralhar('1.2.3.4', 'a'.repeat(32))).toBe(embaralhar('1.2.3.4', 'a'.repeat(32)));
    expect(embaralhar('1.2.3.4', 'a'.repeat(32))).not.toBe(embaralhar('1.2.3.4', 'b'.repeat(32)));
    expect(embaralhar('1.2.3.4', 'a'.repeat(32))).not.toContain('1.2.3.4');
  });
  it('compara em tempo constante e recusa tamanhos diferentes', () => {
    expect(compararSeguro('abc', 'abc')).toBe(true);
    expect(compararSeguro('abc', 'abd')).toBe(false);
    expect(compararSeguro('abc', 'abcd')).toBe(false);
  });
});

describe('datas', () => {
  it('prazo de 30 dias, no dia de Brasília', () => {
    const envio = new Date('2026-10-22T23:30:00-03:00'); // 02:30 do dia 23 em Londres
    expect(dataDoBanco(calcularPrazo(envio))).toBe('2026-11-21');
    expect(formatarData(calcularPrazo(envio))).toBe('21/11/2026');
  });
  it('demonstração só no dia da mostra (padrão 10/11/2026 inteiro)', () => {
    expect(ehDemonstracao(new Date('2026-11-09T23:59:00-03:00'))).toBe(false);
    expect(ehDemonstracao(new Date('2026-11-10T00:00:00-03:00'))).toBe(true);
    expect(ehDemonstracao(new Date('2026-11-10T23:59:00-03:00'))).toBe(true);
    expect(ehDemonstracao(new Date('2026-11-11T00:00:00-03:00'))).toBe(false);
  });
  it('período configurável (vazio volta ao padrão)', () => {
    expect(ehDemonstracao(new Date('2026-10-24T12:00:00-03:00'), '2026-10-24T00:00:00-03:00', '2026-10-25T00:00:00-03:00')).toBe(true);
    expect(ehDemonstracao(new Date('2026-10-24T12:00:00-03:00'), '', '')).toBe(false);
  });
});

describe('antispam', () => {
  const resposta = (corpo: unknown, ok = true) => (async () => ({ ok, json: async () => corpo })) as unknown as typeof fetch;
  it('aceita só quando a Cloudflare diz success: true', async () => {
    expect(await conferirTurnstile('token', 's', resposta({ success: true }))).toBe(true);
    expect(await conferirTurnstile('token', 's', resposta({ success: false }))).toBe(false);
    expect(await conferirTurnstile('token', 's', resposta({ success: true }, false))).toBe(false);
  });
  it('sem token, token estranho ou rede fora: recusa', async () => {
    const quebrado = (async () => { throw new Error('sem rede'); }) as unknown as typeof fetch;
    expect(await conferirTurnstile('', 's', resposta({ success: true }))).toBe(false);
    expect(await conferirTurnstile(42, 's', resposta({ success: true }))).toBe(false);
    expect(await conferirTurnstile('token', 's', quebrado)).toBe(false);
  });
  it('a chave da janela muda de hora em hora e não contém o IP', () => {
    const ip = embaralhar('200.1.2.3', 'a'.repeat(32));
    const k1 = chaveDaJanela(ip, 'envio', new Date('2026-11-10T14:05:00Z'));
    const k2 = chaveDaJanela(ip, 'envio', new Date('2026-11-10T14:59:00Z'));
    const k3 = chaveDaJanela(ip, 'envio', new Date('2026-11-10T15:00:00Z'));
    expect(k1).toBe(k2);
    expect(k1).not.toBe(k3);
    expect(k1).not.toContain('200.1.2.3');
  });
});
