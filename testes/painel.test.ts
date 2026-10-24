// Testes das regras puras do painel. As permissões de verdade são testadas no banco:
// supabase/testes/painel_permissoes.sql.
import { describe, expect, it } from 'vitest';
import { abaDaLista, erroDoPainel, FUNDAMENTOS_EXCLUSAO, FUNDAMENTOS_MURAL, prazoNaLista } from '@/lib/painel';

describe('prazo na lista do painel', () => {
  const hoje = new Date('2026-11-20T12:00:00-03:00');
  it('respondida não mostra prazo', () => {
    expect(prazoNaLista('2026-10-01T10:00:00-03:00', true, hoje)).toBeNull();
  });
  it('conta os dias e destaca a partir de 25', () => {
    expect(prazoNaLista('2026-11-19T10:00:00-03:00', false, hoje)).toEqual({ texto: 'aguardando há 1 dia', urgente: false });
    expect(prazoNaLista('2026-10-27T10:00:00-03:00', false, hoje)).toEqual({ texto: 'aguardando há 24 dias', urgente: false });
    expect(prazoNaLista('2026-10-25T10:00:00-03:00', false, hoje)).toEqual({ texto: 'aguardando há 26 dias', urgente: true });
  });
});

describe('fundamentos da lei', () => {
  it('recusa e retirada só com o § 1º; exclusão só com o § 3º', () => {
    expect(FUNDAMENTOS_MURAL.every(([, r]) => r.includes('§ 1º'))).toBe(true);
    expect(FUNDAMENTOS_EXCLUSAO.every(([, r]) => r.includes('§ 3º'))).toBe(true);
    expect(FUNDAMENTOS_MURAL).toHaveLength(5);
    expect(FUNDAMENTOS_EXCLUSAO).toHaveLength(3);
  });
});

describe('erros do banco viram frases da spec', () => {
  it('traduz os conhecidos', () => {
    expect(erroDoPainel('P0001: ja_prorrogada')).toBe('O prazo desta manifestação já foi prorrogado uma vez.');
    expect(erroDoPainel('new row violates check constraint "arquivar_so_respondida"')).toBe('Responda antes de arquivar.');
    expect(erroDoPainel('so_direcao')).toBe('Só a direção pode fazer isso.');
  });
  it('nunca mostra detalhe interno', () => {
    expect(erroDoPainel('relation "public.manifestacoes" does not exist')).toBe('Não deu certo agora. Tente de novo.');
    expect(erroDoPainel(undefined)).toBe('Não deu certo agora. Tente de novo.');
  });
});

describe('abas da lista', () => {
  it('sem aba ou com valor estranho, abre a fila "Para responder"', () => {
    expect(abaDaLista(undefined)).toBe('responder');
    expect(abaDaLista('qualquer')).toBe('responder');
    expect(abaDaLista('toString')).toBe('responder');
    expect(abaDaLista('respondidas')).toBe('respondidas');
    expect(abaDaLista('todas')).toBe('todas');
  });
});
