// Testes do que o autor lê ao consultar o protocolo e do cookie do aparelho.
import { describe, expect, it } from 'vitest';
import { cookieValido } from '@/lib/aparelho';
import { dataLegivel, descreverSituacao, type DadosDoBanco } from '@/lib/situacao';

const base: DadosDoBanco = { andamento: 'nova', publicacao: 'privada', prazo_em: '2026-11-23', prorrogada_ate: null, explicacao_prorrogacao: null, resposta: null, excluida_em: null };

describe('situação da manifestação', () => {
  it('recém-enviada: prazo, sem resposta, privada, sem desistência', () => {
    expect(descreverSituacao(base, null)).toEqual({
      andamento: 'Recebida. A escola ainda vai ler.',
      prazo: 'A escola tem até 23/11/2026 para responder.',
      resposta: null,
      mural: 'Só a escola vê. Você não pediu para ir ao mural.',
      justificativa: null,
      desistencia: null,
    });
  });
  it('prorrogada mostra a nova data e a explicação', () => {
    const s = descreverSituacao({ ...base, prorrogada_ate: '2026-12-23', explicacao_prorrogacao: 'Depende do Núcleo.' }, null);
    expect(s.prazo).toBe('O prazo foi prorrogado até 23/12/2026. Explicação da direção: Depende do Núcleo.');
  });
  it('com resposta, não mostra prazo', () => {
    const s = descreverSituacao({ ...base, andamento: 'respondida', resposta: 'A peça foi pedida.' }, null);
    expect(s.prazo).toBeNull();
    expect(s.resposta).toBe('A peça foi pedida.');
  });
  it('aguardando pode cancelar; publicada pode tirar; o resto não', () => {
    expect(descreverSituacao({ ...base, publicacao: 'aguardando' }, null).desistencia).toBe('cancelar');
    expect(descreverSituacao({ ...base, publicacao: 'publicada' }, null).desistencia).toBe('tirar');
    expect(descreverSituacao({ ...base, publicacao: 'recusada' }, null).desistencia).toBeNull();
    expect(descreverSituacao({ ...base, publicacao: 'desistida' }, null).desistencia).toBeNull();
  });
  it('recusa e retirada mostram a justificativa formal; privada não', () => {
    expect(descreverSituacao({ ...base, publicacao: 'recusada' }, 'Art. 12, § 1º, III.').justificativa).toBe('Art. 12, § 1º, III.');
    expect(descreverSituacao({ ...base, publicacao: 'retirada' }, 'Art. 12, § 1º, II.').justificativa).toBe('Art. 12, § 1º, II.');
    expect(descreverSituacao(base, 'qualquer').justificativa).toBeNull();
  });
  it('excluída: só o aviso e a justificativa, sem desistência', () => {
    const s = descreverSituacao({ ...base, publicacao: 'publicada', excluida_em: '2026-10-30T10:00:00Z' }, 'Art. 12, § 3º, I.');
    expect(s).toMatchObject({ andamento: 'A direção excluiu esta manifestação.', justificativa: 'Art. 12, § 3º, I.', desistencia: null, mural: null });
  });
  it('data legível', () => {
    expect(dataLegivel('2026-01-05')).toBe('05/01/2026');
  });
});

describe('cookie do aparelho', () => {
  it('aceita só 43 caracteres base64url (32 bytes)', () => {
    expect(cookieValido('a'.repeat(43))).toBe(true);
    expect(cookieValido('a'.repeat(42))).toBe(false);
    expect(cookieValido('a'.repeat(42) + '!')).toBe(false);
    expect(cookieValido(undefined)).toBe(false);
  });
});
