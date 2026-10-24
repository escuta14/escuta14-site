# Design do ESCUTA 14 (Aurora)

O sistema visual do site: cores, fontes, espaço, movimento e componentes. Quem for construir
uma tela nova começa por aqui. Escolhido pela turma em 23/10/2026 (fatia 0.1).

- **Página de referência:** [design/prototipos.fonte.html](design/prototipos.fonte.html),
  montada por [design/montar.py](design/montar.py). Quando este documento e o protótipo
  discordarem, vale este documento.
- **Referência de origem:** [Stocketa, no Refero](https://styles.refero.design/style/c1f7749f-319b-491b-8243-22050e85994f)
  (névoa clara, luz de aurora no alto, título em degradê, vidro fosco, botões em pílula). A
  história das escolhas está em [referencias.md](referencias.md).

## Princípios

1. **Claro, sempre.** Fundo cinza-névoa, nunca branco puro nem escuro. Não há tema escuro (pedido
   da Mariane): o site ignora o modo escuro do aparelho.
2. **Cada cor tem um papel.** Verde e azul fazem a luz, o anel e o brilho do botão; o verde
   escuro é a ação; o azul é informação. Amarelo e laranja ficam no logo, e o laranja escuro só
   em urgência (emergência, prazo vencendo).
3. **O brilho fica nos objetos, não no texto.** Vidro, reflexo e halo em cartão e botão; texto
   sempre em cor sólida e legível (o título em degradê é a única exceção, e passa AA nas duas
   pontas).
4. **Qualquer pessoa usa** (regra 17 do CLAUDE.md): contraste AA, alvo de toque de 44 px, tudo
   pelo teclado, rótulo em todo campo, **texto de 16 px para cima**, funcionando em celular
   simples. Testar em 375, 768 e 1280 px; nenhuma tela rola para o lado.
5. **Nada de fora no navegador.** Fontes e imagens saem do próprio site. Nenhum pedido a
   servidor de terceiros, a não ser o antispam (regra 10 e ADR 0002).

## Cores

Os nomes são os que vão para o código (CSS e Tailwind). Contraste medido pela fórmula da WCAG.

### Paleta do colégio (do logo antigo; decisão de 22/10/2026)

| Token | Hex | Papel |
|---|---|---|
| `verde` | `#00A858` | Luz do fundo, anel do disco, brilho do botão, ícone de "ok". Nunca em texto (2,75:1 na névoa) |
| `azul` | `#2858C0` | Luz do fundo, anel, botão secundário, foco do teclado, links |
| `laranja` | `#F04008` | Só no logo e no fundo claro do aviso de urgência |
| `amarelo` | `#E8E828` | Só no logo e numa bolinha de segmento. Nunca em texto |
| `cinza` | `#707070` | Só numa bolinha de segmento |

As cores medidas no logo horizontal (verde `#037032`, amarelo `#CDCB02`...) ficam só nas imagens
do logo; a interface usa a tabela acima.

### Tons da interface

| Token | Valor | Papel | Contraste |
|---|---|---|---|
| `nevoa` | `#EEF1F4` | Fundo de todas as telas | — |
| `tinta` | `#14202B` | Texto principal, menu ativo | 14,6:1 na névoa |
| `tinta-2` | `#4A5566` | Texto de apoio, rótulo, contador | 6,7:1 na névoa; 7,3:1 no vidro |
| `verde-escuro` | `#007F40` | Botão principal (topo do degradê), início do título | 5,1:1 com branco; 4,5:1 na névoa |
| `verde-fundo` | `#006233` | Botão principal (base do degradê) | 7,5:1 com branco |
| `azul-escuro` | `#1D3F8F` | Fim do título, opção escolhida, título da resposta da escola | 8,6:1 na névoa |
| `verde-tag` | `#005A2C` | Texto da etiqueta de categoria e de "respondida" | 7,1:1 no verde 12% |
| `laranja-escuro` | `#B83206` | Texto e ícone de urgência | 5,1:1 no laranja 12% |
| `erro` | `#B00020` | Mensagem de erro e borda de campo com erro | 7,1:1 no vidro |
| `vidro` | branco 72% | Cartões | — |
| `vidro-forte` | branco 92% | Opções, campo de texto, botão secundário | — |
| `linha` | `#2A3A6B` a 12% | Borda fina de campo e opção, divisória | — |
| `trilho` | `#2A3A6B` a 10% | Fundo da barra de progresso, botão desligado | — |

### Fundos derivados (sempre com texto da mesma família)

| Fundo | Texto | Uso |
|---|---|---|
| azul 10% | `azul-escuro` (8,4:1) | Opção escolhida, etiqueta "nova", "aguardando" |
| azul 8% | `azul-escuro` (8,7:1) | Caixa "Resposta da escola" |
| verde-escuro 12% | `verde-tag` (7,1:1) | Etiqueta de categoria, "respondida", "publicada" |
| laranja 12% | `laranja-escuro` (5,1:1) | Aviso de emergência, "prazo vencendo", "recusada", "retirada" |
| `#2A3A6B` 7% | `tinta` | Etiqueta neutra (tema, segmento, "em análise", "arquivada", "desistida") |

**Degradês:** título `linear-gradient(95deg, verde-escuro 0%, azul-escuro 90%)`; botão principal
`linear-gradient(180deg, verde-escuro, verde-fundo)`; barra de progresso `verde → azul`.

## Fontes

| Papel | Família | Pesos | Onde |
|---|---|---|---|
| Títulos | **Schibsted Grotesk** | 800 | Títulos de tela e de seção, pergunta de cada passo do envio, números grandes, protocolo, nome "ESCUTA 14" no cabeçalho, número dos passos |
| Texto | **Manrope** | 400, 600, 700, 800 | Todo o resto |

As duas têm licença aberta (OFL) e entram pelo `next/font/google`. O Next.js baixa os arquivos
na hora de montar o site e serve de dentro dele, então quem visita não faz pedido ao Google.

A Cabinet Grotesk, dos protótipos antigos, **não** vai para o site. A licença dela (ITF FFL 2.0)
permite usar no próprio site, mas proíbe pôr os arquivos num repositório público. A Mariane
escolheu a substituta em 23/10/2026, numa comparação com cinco fontes abertas.

### Escala

Títulos sempre em MAIÚSCULAS, com `text-wrap: balance`.

| Nome | Tamanho | Altura de linha | Espaçamento | Peso |
|---|---|---|---|---|
| Título de tela (`h1`) | `clamp(2.5rem, 6.2vw, 4.875rem)` (40–78 px) | 0,96 | 0,005em | 800, em degradê |
| Título de seção (`h2`) | `clamp(1.625rem, 3.4vw, 2.5rem)` (26–40 px) | 1,02 | 0,015em | 800 |
| Pergunta do envio | `clamp(1.5rem, 4vw, 2rem)` (24–32 px) | 1,05 | 0,015em | 800 |
| Número grande | `clamp(2.75rem, 5.6vw, 4rem)` (44–64 px) | 1 | 0 | 800, em degradê, `tabular-nums` |
| Protocolo | `clamp(1.375rem, 5.6vw, 2.25rem)` | 1,2 | 0,1em | 800, nunca quebra no meio do código |
| Texto de abertura | 1,1875rem (19 px) | 1,55 | — | 400, `tinta-2`, até 34 caracteres por linha |
| Texto do mural | 1,125rem (18 px) | 1,55 | — | 400 |
| Texto | 1rem (16 px) | 1,5 | — | 400 |
| Botão, opção, etiqueta | 1rem (16 px) | — | 0,01em | 700 |
| Rótulo em maiúsculas | 1rem (16 px) | — | 0,12em | 700, `tinta-2` |

**Mínimo de 16 px.** No protótipo algumas etiquetas, o menu, as etapas do envio e o contador têm
11–14 px. No site, tudo vai a 16 px, e o desenho se ajusta (menos palavras, quebra de linha).

## Espaço e forma

| Item | Valor |
|---|---|
| Largura máxima | página 1180 px; envio 720 px; mural 800 px |
| Margem lateral | `max(16px, env(safe-area-inset-left))` dos dois lados |
| Espaço entre itens | múltiplos de 2: 6, 8, 10, 12, 14, 16, 22, 24, 26 px |
| Seções | 44 px em cima e embaixo; topo da página 28/64 px no celular e 48/96 px no computador |
| Raio | cartão 22 px; opção e campo 18 px; caixa de ícone 15 px; caixa de resposta 14 px; botão e etiqueta em pílula (100 px) |
| Alvo de toque | 44 px no mínimo; botões principais 54 px; voto 46 px |
| Quebras | 480 px (menu esconde "Início"), 560 px (botões e passos em coluna), 760 px (grades de 3 e 4), 900 px (topo em duas colunas) |

**Sombras.** Vidro: `0 12px 32px rgba(40,88,192,.12)`, reflexo branco de 1 px no alto e borda
interna `#2A3A6B` a 8%, com `backdrop-filter: blur(18px) saturate(1.4)`. Botão principal: reflexo
no alto, sombra embaixo e sombra verde `0 10px 24px rgba(0,127,64,.3)`. Opção escolhida: borda
de 2 px em `azul` e anel azul a 10%.

## Movimento

| O quê | Como | Tempo |
|---|---|---|
| Luz do fundo | Duas manchas (verde à esquerda, azul à direita) que andam e crescem | 30 s e 36 s, vai e volta |
| Anel do disco | Gira | 28 s por volta |
| Figuras do logo | Flutuam 8 px e giram 2° | 6 s |
| Brilho do botão principal | Desliza verde → azul → verde | 12 s |
| Números do voto | Sobem ao mudar | 0,35 s |
| Mural ao reordenar | Cada cartão desliza até o lugar novo (FLIP) | 0,38 s |
| Toque em botão | Desce 1 px | 0,12 s |

Com "reduzir movimento" ligado no aparelho, **tudo para**. A página tem que fazer sentido parada.

## Componentes

### Cabeçalho

Ícone do logo (44 px, cartão branco) + "ESCUTA 14" em Schibsted 800; à direita, o menu em pílula
de vidro (Início, Enviar, Mural...), com a tela atual em `tinta` e texto branco
(`aria-current="page"`). Abaixo de 480 px, "Início" sai do menu (o logo leva para o início).

### Topo da página Início

- **Logo do colégio** completo (altura de 58–74 px).
- **Título**.
- **Texto de abertura**.
- **Botões:** "Enviar manifestação" (principal) e "Ver o mural" (secundário).
- **Passo a passo:** num cartão de vidro, com número, ação e detalhe:
  1. **Você escreve:** sem nome e sem login.
  2. **A escola responde:** em até 30 dias.
  3. **Você acompanha:** pelo código de protocolo.

  Os passos ficam lado a lado a partir de 560 px. É a sugestão da turma: entender o caminho antes
  de rolar a página.
- **Arte**, à direita no computador e embaixo no celular: as figuras do logo num disco de vidro
  com o anel verde e azul, e dois cartões flutuando (protocolo e "Nova resposta da escola"),
  retos. Tudo é decorativo (`aria-hidden`), e os cartões nunca cobrem mais de 15% das figuras.

### Botões

| Tipo | Aparência | Uso |
|---|---|---|
| Principal | Pílula em degradê verde, texto branco 700, halo verde/azul embaixo | Uma ação por tela: enviar, continuar, copiar, salvar |
| Secundário | Pílula de vidro forte, texto `azul`, borda fina | Voltar, ver o mural, enviar outra |
| Desligado | Fundo `trilho`, texto `tinta-2`, sem halo | Continuar antes de escolher |

Texto do botão diz o que acontece ("Enviar manifestação", "Copiar código"). Nunca só ícone.

### Cartão de vidro

Fundo `vidro`, raio 22 px, sombra do vidro. É a superfície de passos, segmentos, números, item
do mural, formulário de envio e sucesso. Não empilhar vidro dentro de vidro: dentro de um
cartão, usar `vidro-forte` ou os fundos derivados.

### Envio em 4 passos

- **Progresso:** barra de 12 px (trilho + degradê), "1 de 4" ao lado (`aria-live`) e os nomes
  das etapas embaixo: Tipo, Assunto, Você, Texto. A atual fica em `tinta` 800
  (`aria-current="step"`), as feitas em `tinta`, as próximas em `tinta-2`.
- **Opções:** botões de rádio escondidos, desenhados como cartões de 76 px (com ícone de traço,
  para o tipo) ou 62 px (assunto e segmento), em grade que se ajusta (`minmax(128px, 1fr)`). A
  escolhida fica com fundo azul 10%, texto `azul-escuro` e borda azul de 2 px. O foco do
  teclado aparece na opção.
- **Texto:** campo de 200 px de altura, 18 px, rótulo visível em cima ("Agora conta pra gente"),
  contador embaixo ("Faltam 7 letras." / "152 de 3.000 caracteres."), que fica `erro` quando
  passa do limite.
- **Caixa "Quero que apareça no mural"**, com a explicação na própria frase.
- **Lugar do antispam**, com borda tracejada enquanto carrega.
- **Barra de baixo:** Voltar (secundário, some no passo 1) e Continuar ou Enviar (principal).

### Protocolo (sucesso do envio)

Círculo verde com ✓; "A escola recebeu"; o código em Schibsted 800 grande, numa caixa
`vidro-forte`; a data limite em negrito; o aviso "Guarde o código: ninguém consegue recuperá-lo
para você"; botões "Copiar código" (principal) e "Enviar outra" (secundário). Se copiar não
funcionar, o código fica selecionado e a mensagem explica como copiar.

### Item do mural

Etiquetas (categoria em verde; tema e "segmento · dia" neutras), texto em 18 px, a caixa
"Resposta da escola" (azul 8%, título com ícone ✓), os botões **Apoio** e **Contesto** em
pílula, com seta e número. Apoio marcado fica no degradê verde; Contesto marcado, em azul. O
número sobe ao mudar. Manifestação retirada vira um cartão só com "Retirada · dia" e o texto
fixo com o fundamento da lei, em `tinta-2`.

Acima da lista: "Mais apoiadas / Mais recentes" (grupo em pílula, `aria-pressed`) e o filtro de
categoria, com o texto fixo "Os números são um termômetro, não uma votação oficial."

### Etiquetas de situação (Acompanhar e painel)

Sempre texto **e** cor, nunca cor sozinha.

| Situação | Etiqueta |
|---|---|
| Nova, aguardando publicação | azul 10% / `azul-escuro` |
| Em análise, arquivada, privada, desistida | neutra |
| Respondida, publicada | verde 12% / `verde-tag` |
| Prazo vencendo ("aguardando há 26 dias"), recusada, retirada | laranja 12% / `laranja-escuro` |

### Aviso de emergência

Cartão de vidro com o ícone de telefone numa caixa laranja 12% e o texto: "É uma emergência? O
ESCUTA 14 é anônimo e não consegue socorrer ninguém. Ligue 190 (Polícia Militar), 100 (Disque
Direitos Humanos) ou 188 (CVV), ou procure o Conselho Tutelar." Aparece no Início e no Enviar.

### Números ("A escola ouviu")

Cartões de vidro com o número grande em degradê e a legenda em `tinta-2` 600. Enquanto forem de
exemplo, escrever "Números de exemplo." embaixo. Contagem por tema, categoria, segmento ou mês:
lista "rótulo · barra · número", barra de 12 px como a de progresso (trilho + degradê verde →
azul), sempre com o número escrito ao lado (a barra é enfeite: `aria-hidden`).

### Segmentos

Quatro cartões (Estudantes, Professores, Funcionários, Responsáveis) com uma bolinha brilhante
de 22 px na cor do logo. Duas colunas no celular, quatro a partir de 760 px.

### Formulários do painel

Os mesmos campos, opções e botões do envio. Recusa, retirada e exclusão abrem um formulário com
o **fundamento da lei** (opções do art. 12) e a **explicação** (campo de texto obrigatório); o
botão diz exatamente o que faz ("Recusar a publicação"). Erro em `erro`, com a frase da spec
("Escolha o fundamento da lei e explique o caso.").

### Mensagens de erro

Texto `erro` 700, logo abaixo do que falhou, com `role="alert"`. Frases da spec (Casos de erro),
sem detalhe interno. O campo com erro ganha borda de 2 px em `erro`.

### Rodapé

Borda fina em cima, o logo completo do colégio (64 px de altura) e "Colégio Estadual 14 de
Dezembro · Peabiru (PR) · Canal criado pela lei ESCUTA 14, da turma do 3º ano B de 2026."

## Foco e teclado

Todo elemento que recebe foco mostra um contorno de 3 px em `azul`, 3 px afastado. A ordem do
teclado segue a da tela. Opções do envio são rádios de verdade (setas trocam a escolha).

## Imagens do logo

| Arquivo | Uso | Texto alternativo |
|---|---|---|
| `referencias/logo-colegio-web.webp` | Logo completo no topo e no rodapé | "Colégio Estadual 14 de Dezembro" |
| `referencias/logo-figuras-web.webp` | Ícone do cabeçalho e disco do topo | vazio (decorativo) |

As duas saem do logo horizontal que a Mariane mandou, limpo por
[design/logo_escola.py](design/logo_escola.py). O favicon sai das figuras (fatia 1.1).

## Para o código (Tailwind)

Na fatia 1.1, os tokens viram variáveis no CSS global do Next. Com Tailwind 4:

```css
@theme {
  --color-nevoa: #EEF1F4;
  --color-tinta: #14202B;
  --color-tinta-2: #4A5566;
  --color-verde: #00A858;
  --color-verde-escuro: #007F40;
  --color-verde-fundo: #006233;
  --color-verde-tag: #005A2C;
  --color-azul: #2858C0;
  --color-azul-escuro: #1D3F8F;
  --color-laranja: #F04008;
  --color-laranja-escuro: #B83206;
  --color-amarelo: #E8E828;
  --color-cinza: #707070;
  --color-erro: #B00020;
  --radius-cartao: 22px;
  --radius-opcao: 18px;
  --radius-pilula: 100px;
  --font-titulo: var(--fonte-schibsted), "Arial Narrow", Arial, sans-serif;
  --font-texto: var(--fonte-manrope), system-ui, sans-serif;
}
```

`--fonte-schibsted` e `--fonte-manrope` são as variáveis que o `next/font/google` cria.

## O que não fazer

- Fundo escuro, modo escuro ou branco puro como fundo da tela.
- Amarelo ou o verde claro do logo em texto.
- Texto menor que 16 px, ou botão menor que 44 px.
- Fonte, imagem, ícone ou script carregado de outro site.
- Cor sozinha para dizer situação (sempre com texto).
- Vidro dentro de vidro, ou degradê em texto que não seja título ou número grande.
- Animação que não para com "reduzir movimento".
