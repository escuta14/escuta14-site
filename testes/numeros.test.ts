// Testes das contas de "A escola ouviu" (lib/numeros.ts). As linhas imitam o que o banco manda:
// grupos já somados, nunca uma manifestação sozinha.
import { describe, expect, it } from 'vitest';
import { porMes, resumir, type LinhaNumeros } from '@/lib/numeros';
import { validarProvidencia } from '@/lib/painel';

const linhas: LinhaNumeros[] = [
  {
    mes: 9,
    tema: 'infraestrutura',
    categoria: 'reclamacao',
    segmento: 'estudante',
    total: 5,
    com_desfecho: 4,
    no_prazo: 3,
  },
  {
    mes: 10,
    tema: 'infraestrutura',
    categoria: 'sugestao',
    segmento: 'professor',
    total: 2,
    com_desfecho: 1,
    no_prazo: 1,
  },
  {
    mes: 10,
    tema: 'convivencia',
    categoria: 'reclamacao',
    segmento: 'estudante',
    total: 3,
    com_desfecho: 0,
    no_prazo: 0,
  },
];

describe('resumo do ano e do mês', () => {
  it('soma por tema, categoria e segmento, com quem tem zero na lista', () => {
    const r = resumir(linhas);
    expect(r.total).toBe(10);
    expect(r.porTema).toContainEqual(['Infraestrutura', 7]);
    expect(r.porTema).toContainEqual(['Segurança', 0]);
    expect(r.porTema).toHaveLength(7);
    expect(r.porCategoria).toContainEqual(['Reclamação', 8]);
    expect(r.porSegmento).toContainEqual(['Professor', 2]);
  });
  it('percentual no prazo só conta quem já tem desfecho', () => {
    expect(resumir(linhas).percentualNoPrazo).toBe(80); // 4 de 5
    expect(resumir(linhas, 10).percentualNoPrazo).toBe(100); // 1 de 1; as 3 sem desfecho não contam
  });
  it('sem desfecho nenhum, não inventa percentual', () => {
    expect(resumir([]).percentualNoPrazo).toBeNull();
    expect(resumir(linhas, 11).total).toBe(0);
  });
  it('total por mês, do mais antigo ao mais novo', () => {
    expect(porMes(linhas)).toEqual([
      ['setembro', 5],
      ['outubro', 5],
    ]);
  });
});

describe('providência', () => {
  const hoje = new Date('2026-10-24T12:00:00-03:00');
  it('aceita título, texto, tema e data até hoje', () => {
    expect(validarProvidencia('Bebedouro novo', 'Trocamos o bebedouro do pátio.', 'infraestrutura', '2026-10-24', hoje)).toBeNull();
  });
  it('recusa campo faltando, tema fora da lista e data no futuro', () => {
    expect(validarProvidencia('Oi', 'Trocamos o bebedouro do pátio.', 'infraestrutura', '2026-10-24', hoje)).toBe('providencia_invalida');
    expect(validarProvidencia('Bebedouro novo', 'Trocamos o bebedouro.', 'cantina', '2026-10-24', hoje)).toBe('providencia_invalida');
    expect(validarProvidencia('Bebedouro novo', 'Trocamos o bebedouro.', 'infraestrutura', '2026-10-25', hoje)).toBe('data_invalida');
    expect(validarProvidencia('Bebedouro novo', 'Trocamos o bebedouro.', 'infraestrutura', 'ontem', hoje)).toBe('data_invalida');
  });
});
