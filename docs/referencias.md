# Referências — ESCUTA 14

Última atualização: 22/10/2026

## Identidade do colégio

- Logo: [referencias/logo-colegio.png](referencias/logo-colegio.png): quatro figuras (azul,
  cinza, laranja, amarelo) formando uma estrela ou um abraço; "14 DE DEZEMBRO" em verde
  condensado e "COLÉGIO ESTADUAL" em cinza espaçado.
- Cores medidas no logo (aproximadas; refinar na fatia 0.2):

  | Cor | Hex | Observação |
  |---|---|---|
  | Verde | `#00A858` | Contraste baixo no branco para texto pequeno (~3:1); escurecer para texto |
  | Azul | `#2858C0` | Passa AA no branco |
  | Laranja | `#F04008` | Texto grande só; bom para destaque |
  | Amarelo | `#E8E828` | Nunca texto no branco; só área de cor |
  | Cinza | `#707070` | Texto secundário |

- **Logo horizontal (22/10/2026)**, mandado pela Mariane em alta resolução:
  [referencias/logo-colegio-horizontal.png](referencias/logo-colegio-horizontal.png) (original,
  1774 × 887). É o logo usado no site a partir da versão 4 dos designs. O
  [design/logo_escola.py](design/logo_escola.py) gera a partir dele o logo limpo, a versão para a
  web e as figuras sozinhas. Cores medidas nele, diferentes das medidas no logo antigo:

  | Parte | Hex |
  |---|---|
  | Verde ("14 DE DEZEMBRO") | `#037032` |
  | Azul | `#014BB5` |
  | Laranja | `#F74301` |
  | Amarelo | `#CDCB02` |
  | Cinza da figura | `#535459` |
  | Cinza ("COLÉGIO ESTADUAL") | `#47494B` |

  As imagens do logo na página usam essas cores. **A paleta da interface (`--co-*`) continua com
  as cores da tabela acima** (decisão da Mariane, 22/10/2026: as cores do Aurora foram o que
  chamou atenção na votação).
- Instagram oficial: [@colegioest.14de](https://www.instagram.com/colegioest.14de/), "Colégio
  Estadual 14 de Dezembro EFM", Peabiru (PR).
- Nome do programa e da lei: **ESCUTA 14** ("Nossa Voz, Nossa Escola" foi o nome anterior à
  votação da turma; não usar).

## Fonte dos títulos: Schibsted Grotesk (23/10/2026)

Ao escrever o [design.md](design.md), a licença da Cabinet Grotesk barrou o uso no site. Ela usa a
ITF Free Font License 2.0, lida na página de licenças da Fontshare em 23/10. A licença permite usar
a fonte no próprio site, mas proíbe distribuir os arquivos, citando "repositório" e "servidores de
acesso público". Como o repositório é público, os arquivos não podem ficar nele. Carregar a fonte
pelo servidor da Fontshare a cada visita mandaria o endereço de quem visita para fora, o que vai
contra a ADR 0002; além disso, o servidor estava fora do ar nesse dia.

A Mariane comparou cinco fontes de licença aberta (OFL, do Google Fonts) no peso 800, com o título
real do Aurora: Bricolage Grotesque, Archivo, **Schibsted Grotesk**, Hanken Grotesk e Manrope.
Escolheu a **Schibsted Grotesk**. O texto continua na Manrope. No site, as duas entram pelo
`next/font/google`, que serve os arquivos de dentro do próprio site.

## Design escolhido: Aurora (23/10/2026)

A turma escolheu o **Aurora**. Estúdio e Escultura foram descartados, e ficou só o Aurora no
código:
- [design/prototipos.fonte.html](design/prototipos.fonte.html), montado por
  [design/montar.py](design/montar.py);
- as rodadas antigas e o gerador da peça 3D foram para [design/arquivo/](design/arquivo/).

A página também deixou de guardar qualquer coisa no aparelho (antes ela lembrava o último
acabamento visto).

**Passo a passo logo no começo** (sugestão da turma, aprovada pela Mariane):
- os três passos ("Você escreve: sem nome e sem login", "A escola responde: em até 30 dias", "Você
  acompanha: pelo código de protocolo") ficam num cartão de vidro no próprio topo, logo abaixo dos
  botões;
- lado a lado a partir de 560 px e um embaixo do outro no celular;
- eles substituem a linha de garantias e a seção "Como funciona" que ficava abaixo do topo;
- o texto de apoio virou "Reclamação, ideia, elogio ou relato: a direção e a equipe de
  atendimento leem tudo", para não repetir o prazo.

Testado em 375, 768 e 1280 px: nada rola para o lado, e envio, voto, ordem e filtro do mural
funcionam. No computador e no tablet os três passos cabem na primeira tela. No celular também
cabem, sem a barra escura do protótipo, que não existe no site.

## Aurora mais suave e título mais grosso (22/10/2026)

Na votação parcial, o Aurora saiu na frente, puxado pelas cores. A Mariane decidiu manter a
paleta atual da interface, mas achou o Aurora "meio exagerado": os tons poderiam ser "mais suaves
e mais organizados", e a fonte do título incomodava ("mais grossa ia ficar mais legal"). Os
ajustes seguiram o próprio [Stocketa](https://styles.refero.design/style/c1f7749f-319b-491b-8243-22050e85994f):

- **Título:** Cabinet Grotesk 800, com as letras mais juntas, no título, nas seções, nos números
  e no protocolo. O Stocketa usa peso 700 e espaçamento negativo nos títulos, e a turma tinha
  gostado da fonte do Megafone.
- **Cores com papel definido:** verde e azul fazem a luz do fundo, o anel do disco e o brilho do
  botão. O amarelo e o laranja ficam só no logo. A luz do fundo ficou mais fraca (26% e 22%, antes
  45% e 40%) e mais lenta. O anel virou verde, azul e azul-claro, girando devagar.
- **Organização:** os cartões flutuantes ficaram retos, sem inclinação, e o código do protocolo
  não quebra mais linha no celular.
- **Testes:** 375, 768 e 1280 px, sem rolar para o lado; os cartões cobrem no máximo 14% das
  figuras no celular.

## Rodada 3, versão 4 (22/10/2026): terceiro acabamento, Escultura, e logo novo

A Mariane pediu um terceiro design. Ele seguiu as regras da rodada 3: fundo claro, mesma fonte,
mesma estrutura e nada exagerado.

| | |
|---|---|
| Referência principal | [Lusion](https://styles.refero.design/style/1b44386e-31a8-40b0-a577-27c088b51264): "galeria de esculturas 3D sobre um chão lavanda fosco" |
| O que foi preservado | Fundo `#F0F1FA` (nunca branco puro), tinta preta, superfícies lisas sem vidro nem degradê, uma sombra só e bem fraca (4%), botões em pílula grafite com um "+" à esquerda, título curto no centro e um palco grande de cantos bem redondos embaixo. O azul do colégio só aparece em traço de ícone, foco e destaque pequeno. A cor da página fica toda na peça 3D |
| Detalhe emprestado | Das figuras infladas do [Slush](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b): as quatro figuras do logo viram uma peça 3D inflada e brilhante, feita por [design/arquivo/esculpir.py](design/arquivo/esculpir.py) (calculada a partir das figuras, sem programa de 3D) |
| Interação | A peça flutua, e a sombra no chão acompanha. Com mouse, ela inclina e a luz do palco segue o ponteiro. No celular só flutua; com "reduzir movimento" fica parada |
| Consultados e não usados | Bento (contorno preto grosso, cores demais), Clay (massinha, infantil), Glow, Supahub, Hume AI e Together AI |
| Fichas (protocolo e resposta) | Nos cantos do palco a partir de 1000 px; embaixo dele no celular e no tablet |

A Fontshare não tem a Aeonik, fonte do Lusion. Ficou a Cabinet Grotesk, que a Mariane escolheu.

**Logo novo nos três acabamentos:**
- o logo completo aparece no topo da tela inicial e no rodapé;
- as figuras em alta resolução entram no ícone, no disco do Aurora, no ícone de app do Estúdio e
  na peça 3D;
- cada imagem vai embutida uma vez só (`montar.py`), e a página ficou com 215 KB.

**Testes:**
- em 375, 768 e 1280 px, nenhuma das 9 telas rola para o lado;
- as fichas do Escultura não cobrem a peça;
- envio em 4 passos, protocolo, apoio e ordem do mural conferidos.

**Um link por design:** a Mariane achou a página com os três juntos confusa para a turma. O
`montar.py` passou a gerar também uma página para cada acabamento:
- cada uma é travada no seu acabamento, sem os botões de troca;
- cada uma sempre abre no Início;
- cada uma vira um link próprio, e a página com os três juntos continua existindo para comparar.

## Rodada 3 (22/10/2026): só Aurora e Estúdio, em fundo claro

Retorno da Mariane sobre a rodada 2: Aurora e Estúdio "na direção certa"; **fundo escuro não**
(no máximo um cinza claro para quebrar o clarão do branco); o Meia-noite ficou "muito exagerado".
O Meia-noite saiu, e a página (versão 3) mostra os dois acabamentos que sobraram:

| Acabamento | Fundo | O que mudou |
|---|---|---|
| **Aurora** | névoa cinza-azulada `#EEF1F4` | Figuras do logo num disco de vidro com um anel que gira nas cores do colégio; cartões de vidro flutuando com o protocolo e o aviso "Nova resposta da escola" |
| **Estúdio** | cinza-névoa `#F4F5F7` (o da Apple, citado no estilo do CleanShot X), cartões brancos | Janela do próprio ESCUTA 14 com um mini-mural, ícone de aplicativo brilhante, protocolo e aviso em camadas; selo "Novo · Canal da lei ESCUTA 14" |

Nos dois: seção "Como funciona" em três passos com ícone, ícone em cada assunto do envio, setas
de apoio e contestação no mural e o nome de cada etapa do envio (Tipo, Assunto, Você, Texto).
Testado em 375, 768 e 1280 px: nenhuma tela rola para o lado; no Estúdio, as janelas soltas não
cobrem texto (no celular e no tablet elas descem para baixo da janela principal); no Aurora, os
cartões cobrem no máximo 17% das figuras no celular. Fonte da página (com os três acabamentos):
`design/arquivo/prototipos-rodada3.fonte.html`; a rodada 2 ficou só na versão 2 da página publicada.

## Rodada 2 (22/10/2026): fonte do Megafone + aparência do Pátio, com brilho

Retorno da Mariane sobre a rodada 1: o C ficou "horrível"; ela gostou da **fonte do A** e da
**aparência do B**, mas achou tudo "fraco" e pediu algo **mais tecnológico e brilhante**. Virou
um design só (Cabinet Grotesk em maiúsculas espaçadas + Manrope; cantos redondos, botões grandes,
envio em 4 passos, figuras do logo) em três acabamentos, na mesma página publicada (versão 2):

| Acabamento | Referência principal | Brilho |
|---|---|---|
| **Aurora** | [Stocketa](https://styles.refero.design/style/c1f7749f-319b-491b-8243-22050e85994f): névoa clara, aurora no fundo, título em degradê, vidro fosco, pílulas | Aurora animada nas cores do colégio; cartões de vidro com reflexo no alto |
| **Estúdio** | [CleanShot X](https://styles.refero.design/style/679f08af-741f-4b04-bb44-0a9b97e96ad3): branco, tinta preta, um azul elétrico, brilho azul atrás do topo, janelas em camadas | Botão azul com reflexo e sombra azul; janelas do próprio ESCUTA 14 |
| **Meia-noite** | [Authkit](https://styles.refero.design/style/e80231a2-e4d6-406a-a2c9-2e6109679690): fundo da meia-noite, vidro com borda de geada, título aceso, cartões em leque | Botão verde com halo de luz; figuras do logo brilhando |

Do cult-ui: o halo animado embaixo do botão principal e o vidro fosco com reflexo vêm do
[`halo-button`](https://www.cult-ui.com); a aurora que se mexe, do `bg-animated-gradient`;
os números que rolam e o mural que se reordena, do `rolling-number` e do `vote-tally`.
Consultados e não usados: Vetric (prisma iridescente, cantos quase retos), Signal, OpenServ,
Apple Espanha, Unicorn Studio e Dimension. A rodada 1 está em
`design/arquivo/prototipos-rodada1.fonte.html`.

## Rodada 1 — direções de design (fatia 0.1, 22/10/2026)

Protótipo clicável das três: página "Designs do ESCUTA 14" (artifact da Mariane; fonte em
[design/arquivo/prototipos-rodada1.fonte.html](design/arquivo/prototipos-rodada1.fonte.html)). Testado em 375, 768 e 1280 px: nenhuma das 9 telas rola
para o lado. Dados do mural e números são exemplos.

| Direção | Referência principal (o que foi preservado) | Detalhe emprestado | Fontes |
|---|---|---|---|
| **A · Megafone** | [CQCM no Refero](https://styles.refero.design/style/12db22d6-7738-4aee-ab6b-6d6731c7e1e0): painel verde dominante, título em maiúsculas com espaçamento largo, botões pretos em pílula, sem sombra, "escadinha" de blocos coloridos | Figuras do logo no lugar da foto do herói | Cabinet Grotesk (Fontshare) + Manrope |
| **B · Pátio** | [Duolingo no Refero](https://styles.refero.design/style/95b472c5-fc07-46a8-a11f-c5432e290fcd): fundo branco, contornos grossos, raio único de 12 px, botões que afundam (borda de baixo), sem sombra | Envio em 4 passos (uma pergunta por vez); números que rolam ([rolling-number, cult-ui](https://www.cult-ui.com)) | Pally (Fontshare) |
| **C · Cartaz** | [Firstandforemost no Refero](https://styles.refero.design/style/ac86af87-6f60-42a2-b805-87a168792e55): faixas brancas e laranja, título gigante e fininho, pílulas, sem caixas com borda | Formas recortadas nas cores do logo ([SuperHi no Refero](https://styles.refero.design/style/90b8631c-4e2c-407e-86a3-d2bff456dc93)); mural reordenado com animação ([vote-tally, cult-ui](https://www.cult-ui.com)) | Switzer (Fontshare) |

Consultados e não usados: Quizlet, Lego e Google for Education (Refero), que serviram só de
comparação. O [shadergradient](https://shadergradient.co) foi testado com as cores do colégio:
saiu um azul elétrico granulado, longe da paleta, e o WebGL pesa em celular simples. Ficou fora.

Ajustes de acessibilidade em relação às referências: o verde e o laranja do logo não passam AA
com texto branco pequeno, então os botões usam tons mais escuros (`#007A3D` no B, `#C2380A` no
C), e o laranja `#F04008` aparece só em título grande e nas formas.
