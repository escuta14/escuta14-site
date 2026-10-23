// APOSENTADO EM 22/10/2026: a versão-mestre do projeto de lei passou a ser o Google Docs da
// turma (alterações entram lá como sugestões; docs/projeto-de-lei.md espelha o texto aceito).
// Este gerador fez a v2 em Word e fica só como registro de como a formatação ABNT foi montada.
//
// Gera o projeto de lei em ABNT (NBR 14724) com as alterações controladas e o Apêndice A
// (folhas de assinatura), mais a versão em Markdown que vai para o site.
//
// Por que existe: o projeto de lei acompanha o site. Toda regra nova do site vira uma alteração
// aqui, marcada no Word para o grupo aceitar ou recusar.
//
// Entrada: turma/fonte/projeto-de-lei-v1.json (texto original, com os nomes das autoras;
// fica fora do git) e turma/fonte/logo-colegio.png.
// Saída: turma/*.docx (fora do git) e docs/projeto-de-lei.md.gerado (sem os nomes; conferir e
// copiar o corpo para docs/projeto-de-lei.md, que tem cabeçalho e histórico próprios).
//
// Como rodar (PowerShell, nesta pasta):
//   npm ci
//   node gerar.js ; python marcar.py bruto.docx ../../turma/projeto-de-lei-v2-ABNT-alteracoes-marcadas.docx
//   $env:LIMPO = '1'; node gerar.js ../../turma/projeto-de-lei-v2-ABNT-limpo.docx; Remove-Item Env:LIMPO
//   python <pasta da skill docx>/scripts/office/validate.py <arquivo.docx>   (confere o Word gerado)
//
// Próxima versão: quando o grupo aprovar a v2, a base passa a ser o texto aceito da v2. Até lá,
// alteração nova entra como mais uma troca em "Texto do projeto" abaixo.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, InsertedTextRun, DeletedTextRun, ImageRun, Header,
  PageNumber, AlignmentType, Table, TableRow, TableCell, WidthType, HeightRule, VerticalAlign,
  ShadingType, BorderStyle, NumberFormat,
} = require('docx');

const path = require('path');
const RAIZ = path.join(__dirname, '..', '..');
const LOGO = path.join(RAIZ, 'turma', 'fonte', 'logo-colegio.png');
const SAIDA_DOCX = process.argv[2] || 'bruto.docx';
const SAIDA_MD = path.join(RAIZ, 'docs', 'projeto-de-lei.md.gerado');
const original = JSON.parse(fs.readFileSync(path.join(RAIZ, 'turma', 'fonte', 'projeto-de-lei-v1.json'), 'utf-8'));

const AUTOR = 'Proposta ESCUTA 14';
const DATA = '2026-10-22T13:30:00Z';
let idRev = 1;

// ---------- Blocos: cada parágrafo vira { tipo, partes: [{texto, negrito, rev:'ins'|'del'|null}] }
const bloco = (i, tipo) => ({ tipo, partes: original[i].runs.map((r) => ({ texto: r.texto, negrito: r.negrito, rev: null })) });
const novo = (tipo, rotulo, texto) => ({
  tipo, novo: true,
  partes: [
    ...(rotulo ? [{ texto: rotulo, negrito: true, rev: 'ins' }] : []),
    { texto: (rotulo ? ' ' : '') + texto, negrito: false, rev: 'ins' },
  ],
});

// Troca um trecho que aparece exatamente uma vez no parágrafo por exclusão + inserção controladas.
function trocar(b, antigo, novoTexto) { dividir(b, antigo, [{ texto: antigo, rev: 'del' }, ...(novoTexto ? [{ texto: novoTexto, rev: 'ins' }] : [])]); }
function inserirDepois(b, ancora, texto) { dividir(b, ancora, [{ texto: ancora, rev: null }, { texto, rev: 'ins' }]); }
function dividir(b, alvo, pedacos) {
  const achados = b.partes.filter((p) => p.rev === null && p.texto.split(alvo).length === 2);
  const total = b.partes.reduce((n, p) => n + (p.texto.split(alvo).length - 1), 0);
  if (achados.length !== 1 || total !== 1) throw new Error(`Trecho não encontrado uma única vez: "${alvo}"`);
  const p = achados[0];
  const [antes, depois] = p.texto.split(alvo);
  const novas = [
    ...(antes ? [{ texto: antes, negrito: p.negrito, rev: null }] : []),
    ...pedacos.map((x) => ({ ...x, negrito: p.negrito })),
    ...(depois ? [{ texto: depois, negrito: p.negrito, rev: null }] : []),
  ];
  b.partes.splice(b.partes.indexOf(p), 1, ...novas);
}
// Renumera o rótulo do artigo ("Art. 10." -> "Art. 12.").
function renumerar(b, novoRotulo) { const p = b.partes[0]; trocar(b, p.texto.trim(), novoRotulo); }

// ---------- Texto do projeto, na ordem do original (0–3, 6, 10, 13, 54 e 63 são cabeçalho, vazios e linha)
const corpo = [];
const add = (b) => { corpo.push(b); return b; };
add(bloco(4, 'titulo')); add(bloco(5, 'titulo'));
add(bloco(7, 'ementa'));
add(bloco(8, 'centro')); add(bloco(9, 'centro'));
add(bloco(11, 'ementa'));
add(bloco(12, 'par')); add(bloco(14, 'par'));
for (let i = 15; i <= 53; i++) {
  const b = add(bloco(i, 'par'));
  if (i === 16) { inserirDepois(b, 'gratuita', ', denominada ESCUTA 14,'); trocar(b, 'dos estudantes', 'da comunidade escolar'); }
  if (i === 24) inserirDepois(b, 'pelos estudantes', ' e pelos demais integrantes da comunidade escolar');
  if (i === 26) add(novo('par', '§ 3º', 'O canal deverá seguir padrões de acessibilidade digital, de modo que qualquer pessoa, inclusive pessoas com deficiência, consiga utilizá-lo.'));
  if (i === 27) trocar(b, 'O estudante', 'Qualquer integrante da comunidade escolar — estudante, professor, funcionário ou responsável —');
  if (i === 34) add(novo('par', 'Parágrafo único.', 'Ao enviar a manifestação, o autor indicará a categoria, entre as previstas neste artigo, o tema a que se refere e o segmento da comunidade escolar a que pertence, sem precisar se identificar.'));
  if (i === 36) trocar(b, 'do estudante', 'do autor');
  if (i === 37) {
    add(novo('par', '§ 3º', 'O canal não exigirá cadastro, nome, e-mail ou telefone e não registrará dados que permitam identificar o autor da manifestação.'));
    add(novo('par', '§ 4º', 'Cada manifestação receberá um código de protocolo, com o qual o autor poderá acompanhar, sem se identificar, o andamento e a resposta da escola.'));
  }
  if (i === 38) inserirDepois(b, 'gestão do Programa', ', formada pela direção e pela secretaria da escola, que as consultará por meio de um painel de administração restrito à equipe');
  if (i === 40) inserirDepois(b, 'agrupadas por', ' categoria, por segmento da comunidade escolar e por');
  if (i === 43) {
    add(novo('par', 'Art. 10.', 'O autor poderá pedir que sua manifestação seja publicada em um mural público do canal.'));
    add(novo('par', '§ 1º', 'A publicação somente ocorrerá após a aprovação da direção da escola, que poderá recusá-la ou retirá-la do mural a qualquer tempo, informando o motivo ao autor por meio do protocolo.'));
    add(novo('par', '§ 2º', 'Não será publicada manifestação que identifique, exponha ou ofenda qualquer pessoa, em respeito ao art. 9º.'));
    add(novo('par', '§ 3º', 'As manifestações publicadas poderão receber, de forma anônima, o apoio ou a contestação dos demais usuários, apresentados apenas em números.'));
    add(novo('par', 'Art. 11.', 'O canal não substitui o atendimento de situações de urgência, de violência ou de risco e deverá orientar os usuários a procurar os serviços adequados, como a Polícia Militar (190), o Disque Direitos Humanos (Disque 100), o Centro de Valorização da Vida (188) e o Conselho Tutelar.'));
  }
  // Os arts. 10 a 17 do original passam a 12 a 19, porque entram dois artigos novos (10 e 11).
  if ([44, 45, 48, 49, 50, 51, 52, 53].includes(i)) renumerar(b, `Art. ${Number(b.partes[0].texto.match(/\d+/)[0]) + 2}.`);
  if (i === 47) add(novo('par', '§ 3º', 'O canal manterá uma página pública com o número de manifestações recebidas por tema e por categoria e com as providências adotadas pela escola.'));
  if (i === 48) add(novo('par', 'Parágrafo único.', 'As contas e os acessos necessários ao funcionamento da plataforma ficarão sob a responsabilidade da direção da escola, para garantir que o canal continue funcionando nos anos seguintes.'));
  if (i === 49) inserirDepois(b, 'matriculados na instituição', ', bem como aos seus responsáveis, aos professores e aos funcionários da escola');
  if (i === 53) add(novo('par', 'Parágrafo único.', 'A aprovação pela comunidade escolar será registrada na lista de assinaturas de apoio e aprovação que constitui o Apêndice A deste projeto.'));
}
add(bloco(55, 'secao'));
for (let i = 56; i <= 62; i++) {
  const b = add(bloco(i, 'par'));
  if (i === 57) inserirDepois(b, 'integração com a comunidade', ' (BRASIL, 1996)');
  if (i === 60) {
    add(novo('par', null, 'Embora o foco do Programa seja a participação estudantil, o canal também recebe manifestações de professores, funcionários e responsáveis. A própria pesquisa com os funcionários mostrou que o diálogo precisa envolver todos os integrantes da comunidade escolar, e cada manifestação informa apenas o segmento de quem a enviou, sem identificar ninguém.'));
    add(novo('par', null, 'Para colocar o Programa em prática, a turma desenvolveu a plataforma ESCUTA 14, gratuita e acessível pelo celular, pelo tablet e pelo computador. Nela, cada manifestação recebe um código de protocolo para acompanhamento; as que o autor deseja tornar públicas só aparecem no mural depois da aprovação da direção, o que impede a exposição de pessoas; e uma página pública apresenta os números do que foi recebido e as providências adotadas, cumprindo o dever de informar a comunidade escolar.'));
  }
}
add(bloco(64, 'local')); add(bloco(65, 'local'));

// ---------- Saída em Word (ABNT: A4, margens 3/3/2/2 cm, Arial 12, 1,5, recuo 1,25 cm)
const FONTE = 'Arial';
const LIMPO = process.env.LIMPO === '1';
const run = (p, extra = {}) => {
  if (LIMPO && p.rev === 'del') return null;
  if (LIMPO) p = { ...p, rev: null };
  const base = { text: p.texto, bold: p.negrito || extra.bold, font: FONTE, size: extra.size || 24, allCaps: extra.caps };
  if (p.rev === 'ins') return new InsertedTextRun({ ...base, id: idRev++, author: AUTOR, date: DATA });
  if (p.rev === 'del') return new DeletedTextRun({ ...base, id: idRev++, author: AUTOR, date: DATA });
  return new TextRun(base);
};
const linha = { line: 360, before: 0, after: 120 };
function paragrafoWord(b) {
  switch (b.tipo) {
    case 'titulo': return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360, before: 0, after: 0 }, children: b.partes.map((p) => run(p, { bold: true })).filter(Boolean) });
    case 'ementa': return new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { left: 3402 }, spacing: { line: 240, before: 360, after: 360 }, children: b.partes.map((p) => run(p)).filter(Boolean) });
    case 'centro': return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360, before: 0, after: 0 }, children: b.partes.map((p) => run(p)).filter(Boolean) });
    case 'secao': return new Paragraph({ alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { line: 360, before: 0, after: 360 }, children: b.partes.map((p) => run(p, { bold: true })).filter(Boolean) });
    case 'local': return new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 360, before: 240, after: 0 }, children: b.partes.map((p) => run(p)).filter(Boolean) });
    default: return new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 709 }, spacing: linha, children: b.partes.map((p) => run(p)).filter(Boolean) });
  }
}
const centro = (texto, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { line: opts.line || 360, before: opts.before || 0, after: 0 },
  children: [new TextRun({ text: texto, font: FONTE, size: 24, bold: !!opts.bold })],
});
const AUTORAS = original[8].runs.map((r) => r.texto).join('').split(',').map((s) => s.trim());
const TITULO = 'PROJETO DE LEI ESCUTA 14:';
const SUBTITULO = 'Programa de Participação e Escuta Estudantil – Nossa Voz, Nossa Escola';
const pagina = { size: { width: 11906, height: 16838 }, margin: { top: 1701, left: 1701, bottom: 1134, right: 1134, header: 1134, footer: 709 } };
const semCabecalho = { default: new Header({ children: [new Paragraph({ children: [] })] }) };

const capa = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(LOGO), transformation: { width: 132, height: 132 }, altText: { title: 'Logo', description: 'Logo do Colégio Estadual 14 de Dezembro', name: 'logo' } })] }),
  centro('COLÉGIO ESTADUAL 14 DE DEZEMBRO EFM', { bold: true }),
  ...AUTORAS.map((n, k) => centro(n, { bold: true, before: k === 0 ? 2268 : 0 })),
  centro(TITULO, { bold: true, before: 2835 }),
  centro(SUBTITULO),
  centro('PEABIRU', { bold: true, before: 3118 }),
  centro('2026', { bold: true }),
];
const folhaDeRosto = [
  ...AUTORAS.map((n) => centro(n, { bold: true })),
  centro(TITULO, { bold: true, before: 2268 }),
  centro(SUBTITULO),
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { left: 4536 }, spacing: { line: 240, before: 1134, after: 0 }, children: [new TextRun({ font: FONTE, size: 24, text: 'Projeto de lei apresentado à Mostra Interdisciplinar do Colégio Estadual 14 de Dezembro, nas disciplinas de Mídias Digitais e Sociologia, pela turma do 3º ano B, como proposta de criação do Programa de Participação e Escuta Estudantil e de seu canal digital, o ESCUTA 14.' })] }),
  new Paragraph({ alignment: AlignmentType.LEFT, indent: { left: 4536 }, spacing: { line: 240, before: 240, after: 0 }, children: [new TextRun({ font: FONTE, size: 24, text: 'Orientador: Prof. Michel' })] }),
  centro('PEABIRU', { bold: true, before: 4252 }),
  centro('2026', { bold: true }),
];

// Referências (NBR 6023): alinhadas à esquerda, espaço simples.
const referencias = [
  new Paragraph({ alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { line: 360, after: 360 }, children: [new TextRun({ text: 'REFERÊNCIAS', bold: true, font: FONTE, size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 240, after: 240 }, children: [
    new TextRun({ text: 'BRASIL. ', font: FONTE, size: 24 }),
    new TextRun({ text: 'Lei nº 9.394, de 20 de dezembro de 1996', font: FONTE, size: 24, bold: true }),
    new TextRun({ text: '. Estabelece as diretrizes e bases da educação nacional. Brasília, DF: Presidência da República, [1996]. Disponível em: https://www.planalto.gov.br/ccivil_03/leis/l9394.htm. Acesso em: 22 out. 2026.', font: FONTE, size: 24 }),
  ] }),
];

// Apêndice A: lista de assinaturas (cabeçalho da tabela repete em cada página).
const COLUNAS = [['Nº', 567], ['Nome completo', 3402], ['Segmento', 1418], ['Turma', 1134], ['Assinatura', 2550]];
const borda = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
const celula = (texto, largura, opts = {}) => new TableCell({
  width: { size: largura, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: bordas,
  shading: opts.cabecalho ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' } : undefined,
  children: [new Paragraph({ alignment: opts.alinhar || AlignmentType.CENTER, spacing: { line: 240, before: 0, after: 0 }, children: [new TextRun({ text: texto, font: FONTE, size: 20, bold: !!opts.cabecalho })] })],
});
// Quatro folhas, cada uma com tabela própria: as folhas circulam soltas pelas salas, então
// cada uma diz o que se assina e qual folha é. Linhas por folha calculadas para caber numa
// página A4 com margens ABNT (14.003 twips úteis) com sobra, para nada escorregar para outra página.
const FOLHAS = 4;
const LINHAS_PRIMEIRA = 18; // a primeira folha tem o título do apêndice e a declaração completa
const LINHAS_DEMAIS = 22;
const tabela = (inicio, quantidade) => new Table({
  width: { size: 9071, type: WidthType.DXA }, columnWidths: COLUNAS.map((c) => c[1]),
  rows: [
    new TableRow({ tableHeader: true, height: { value: 567, rule: HeightRule.EXACT }, children: COLUNAS.map(([t, w]) => celula(t, w, { cabecalho: true })) }),
    ...Array.from({ length: quantidade }, (_, k) => new TableRow({ cantSplit: true, height: { value: 510, rule: HeightRule.EXACT }, children: COLUNAS.map(([, w], c) => celula(c === 0 ? String(inicio + k) : '', w)) })),
  ],
});
const texto10 = (text, opts = {}) => new Paragraph({ alignment: opts.alinhar || AlignmentType.JUSTIFIED, pageBreakBefore: !!opts.quebra, spacing: { line: 240, before: 0, after: opts.depois ?? 200 }, children: [new TextRun({ font: FONTE, size: opts.tamanho || 20, bold: !!opts.negrito, text })] });
const apendice = [
  new Paragraph({ alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { line: 360, after: 240 }, children: [new TextRun({ text: 'APÊNDICE A – LISTA DE ASSINATURAS DE APOIO E APROVAÇÃO', bold: true, font: FONTE, size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 709 }, spacing: { line: 360, after: 120 }, children: [new TextRun({ font: FONTE, size: 24, text: 'Nós, abaixo assinados, integrantes da comunidade escolar do Colégio Estadual 14 de Dezembro, de Peabiru (PR), declaramos apoio e aprovação ao Projeto de Lei que institui o Programa de Participação e Escuta Estudantil – Nossa Voz, Nossa Escola e o canal digital ESCUTA 14, nos termos do art. 19.' })] }),
  texto10(`Folha 1 de ${FOLHAS}. Segmento: E – estudante; P – professor; F – funcionário; R – responsável. Turma: só para estudantes (ex.: 3º B). Os nomes desta lista servem apenas para registrar o apoio ao projeto e não serão publicados no site ESCUTA 14 nem usados para outro fim.`, { depois: 240 }),
  tabela(1, LINHAS_PRIMEIRA),
];
for (let f = 2, n = LINHAS_PRIMEIRA + 1; f <= FOLHAS; f++, n += LINHAS_DEMAIS) {
  apendice.push(
    texto10(`LISTA DE ASSINATURAS – PROJETO DE LEI ESCUTA 14 – FOLHA ${f} DE ${FOLHAS}`, { quebra: true, alinhar: AlignmentType.CENTER, negrito: true, tamanho: 22, depois: 60 }),
    texto10('Os abaixo assinados, integrantes da comunidade escolar do Colégio Estadual 14 de Dezembro, apoiam e aprovam o Projeto de Lei que institui o Programa Nossa Voz, Nossa Escola e o canal ESCUTA 14 (texto completo nas páginas anteriores). Segmento: E, P, F ou R.'),
    tabela(n, LINHAS_DEMAIS),
  );
}

const doc = new Document({
  creator: 'Turma do 3º ano B – Colégio Estadual 14 de Dezembro',
  title: 'Projeto de Lei ESCUTA 14 – Nossa Voz, Nossa Escola',
  features: { trackRevisions: !LIMPO },
  styles: { default: { document: { run: { font: FONTE, size: 24 }, paragraph: { spacing: { line: 360 } } } } },
  sections: [
    { properties: { page: pagina }, headers: semCabecalho, children: capa },
    { properties: { page: pagina }, headers: semCabecalho, children: folhaDeRosto },
    {
      properties: { page: { ...pagina, pageNumbers: { start: 2, formatType: NumberFormat.DECIMAL } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONTE, size: 20 })] })] }) },
      children: [...corpo.map(paragrafoWord), ...referencias, ...apendice],
    },
  ],
});

// ---------- Saída em Markdown (texto com as alterações aceitas, sem os nomes das autoras)
const aceito = (b) => b.partes.filter((p) => p.rev !== 'del').map((p) => p.texto).join('').trim();
const md = [];
for (const b of corpo) {
  if (b === corpo[3]) continue; // nomes das autoras (menores de idade) não vão para o repositório
  const t = aceito(b);
  const rot = b.partes[0].negrito && b.tipo === 'par' ? b.partes.filter((p) => p.negrito && p.rev !== 'del').map((p) => p.texto).join('').trim() : null;
  if (b.tipo === 'titulo') md.push(`**${t}**`);
  else if (b.tipo === 'ementa') md.push(`> ${t}`);
  else if (b.tipo === 'secao') md.push(`## ${t.charAt(0) + t.slice(1).toLowerCase()}`);
  else if (rot) md.push(`**${rot}** ${t.slice(t.indexOf(rot) + rot.length).trim()}`);
  else md.push(t);
}
md.push('## Referências', 'BRASIL. **Lei nº 9.394, de 20 de dezembro de 1996**. Estabelece as diretrizes e bases da educação nacional. Brasília, DF: Presidência da República, [1996]. Disponível em: https://www.planalto.gov.br/ccivil_03/leis/l9394.htm. Acesso em: 22 out. 2026.');

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(SAIDA_DOCX, buf);
  fs.writeFileSync(SAIDA_MD, md.join('\n\n') + '\n', 'utf-8');
  console.log('ok', SAIDA_DOCX, 'revisões:', idRev - 1, 'blocos:', corpo.length);
});
