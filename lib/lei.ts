// Lê o texto da lei ESCUTA 14 de docs/projeto-de-lei.md para a página Sobre. Assim o texto tem
// uma fonte só: mudou a lei, muda o arquivo (regra 20 do CLAUDE.md) e o site acompanha no
// próximo deploy. Entende só o pouco de Markdown que o arquivo usa: "## título", "> citação",
// parágrafos e **negrito**. Testado em testes/lei.test.ts.

export type Trecho = { texto: string; forte: boolean };
export type Bloco = {
  tipo: 'titulo' | 'citacao' | 'paragrafo';
  trechos: Trecho[];
};

/** "a **b** c" → [a, b (negrito), c]. */
function trechos(linha: string): Trecho[] {
  return linha
    .split('**')
    .map((texto, i) => ({ texto, forte: i % 2 === 1 }))
    .filter((t) => t.texto !== '');
}

/**
 * O texto da lei fica entre as duas linhas "---" do arquivo (antes vem a nota para quem mexe no
 * repositório; depois, o histórico de versões). A versão vem da linha "**Versão ...**".
 */
export function lerLei(md: string): { versao: string; blocos: Bloco[] } {
  const versao = md.match(/^\*\*(Versão [^*]+)\*\*/m)?.[1]?.trim() ?? '';
  const partes = md.replace(/\r\n/g, '\n').split(/^---$/m);
  const corpo = partes.length >= 3 ? partes[1] : '';
  const blocos = corpo
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p): Bloco => {
      if (p.startsWith('## ')) return { tipo: 'titulo', trechos: trechos(p.slice(3)) };
      if (p.startsWith('> '))
        return {
          tipo: 'citacao',
          trechos: trechos(p.replace(/^> ?/gm, '').replace(/\n/g, ' ')),
        };
      return { tipo: 'paragrafo', trechos: trechos(p.replace(/\n/g, ' ')) };
    });
  return { versao, blocos };
}
