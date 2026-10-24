// Testes da leitura da lei para a página Sobre (lib/lei.ts), com um arquivo de mentira e com o
// arquivo de verdade (para o site nunca publicar a página Sobre vazia).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lerLei } from '@/lib/lei';

const md = `# Projeto
> nota para quem mexe

**Versão 9 (01/01/2030) — teste.**

---

**Art. 1º** Fica instituído o programa.

> “Ementa
> em duas linhas.”

## Justificativa

Texto da justificativa.

---

## Histórico de versões
| 1 | segredo do histórico |
`;

describe('leitura da lei', () => {
  it('pega só o texto entre as linhas --- e a versão', () => {
    const { versao, blocos } = lerLei(md);
    expect(versao).toBe('Versão 9 (01/01/2030) — teste.');
    expect(blocos.map((b) => b.tipo)).toEqual(['paragrafo', 'citacao', 'titulo', 'paragrafo']);
    expect(JSON.stringify(blocos)).not.toContain('Histórico');
    expect(JSON.stringify(blocos)).not.toContain('nota para quem mexe');
  });
  it('separa o negrito e junta as linhas da citação', () => {
    const { blocos } = lerLei(md);
    expect(blocos[0].trechos).toEqual([
      { texto: 'Art. 1º', forte: true },
      { texto: ' Fica instituído o programa.', forte: false },
    ]);
    expect(blocos[1].trechos[0].texto).toBe('“Ementa em duas linhas.”');
  });
  it('o arquivo de verdade tem os 20 artigos', () => {
    const { versao, blocos } = lerLei(readFileSync('docs/projeto-de-lei.md', 'utf8'));
    expect(versao).toMatch(/^Versão \d+/);
    expect(blocos.filter((b) => b.trechos[0]?.forte && b.trechos[0].texto.startsWith('Art. '))).toHaveLength(20);
  });
});
