# Tarefas — ESCUTA 14

> Lista de trabalho, na ordem. Uma fatia por sessão. Ao terminar uma fatia:
> ver rodando → escrever/rodar o teste → commitar → marcar aqui.

Última atualização: 22/10/2026

Legenda: `[ ]` a fazer · `[~]` em andamento · `[x]` pronto e commitado

## Pendências que só a Mariane resolve (fora do código)

- [x] Decidir o e-mail das contas: um e-mail próprio do site, criado pela Mariane (23/10)
- [x] Criar o e-mail próprio do site (23/10; endereço no [manual técnico](manual-tecnico.md))
- [ ] Trocar a senha do e-mail por uma longa e aleatória, ligar a verificação em duas etapas e
      imprimir os códigos de reserva
- [ ] Criar com esse e-mail: GitHub, Vercel, Supabase e Cloudflare
- [ ] Responder as perguntas em aberto da [spec](spec.md)
- [x] Mandar o texto do projeto de lei (22/10)
- [ ] Grupo revisar a v3 do projeto de lei no Google Docs da turma (sugestões de 22/10) e
      aceitar ou recusar cada uma
- [ ] Imprimir o Apêndice A (4 folhas, 84 linhas) e recolher as assinaturas
- [x] Levar os três acabamentos para a turma votar: venceu o **Aurora** (23/10)
- [ ] Assinar o termo de sigilo com a direção ([termo-de-sigilo.md](termo-de-sigilo.md))
- [ ] Combinar com a direção a data da passagem (última semana de aula de 2026)

## Projeto de lei (acompanha o site)

- [x] v2 em ABNT com alterações marcadas, versão limpa e Apêndice A de assinaturas (22/10)
- [x] v3 direto no Google Docs da turma, em modo Sugestão (22/10, depois do grilling)
- [ ] Depois do sim do grupo: próximas mudanças entram como sugestões novas (v4)
- [x] Página Sobre mostra o texto de `docs/projeto-de-lei.md`, com a versão e a situação (24/10)
- [ ] Depois do sim do grupo: atualizar o cabeçalho do arquivo ("o grupo ainda precisa aprovar") e
      pôr o número de assinaturas

## Fatia 0.1 — Três direções de design

Pronto quando: a turma escolheu uma direção.

- [x] Pesquisa nos sites de referência (skill `refero-design`) — ver [referencias.md](referencias.md)
- [x] Três direções com fonte, cores, forma e movimento diferentes, todas sobre o logo
- [x] Protótipos de Início, Enviar e Mural para cada direção (22/10)
- [x] Conferir em 375, 768 e 1280 px (nenhuma tela rola para o lado); contraste AA nas cores escolhidas
- [x] Link publicado: página "Designs do ESCUTA 14" (privada até a Mariane compartilhar)
- [x] Rodada 2: um design só (fonte do A, aparência do B) em três acabamentos brilhantes (22/10)
- [x] Rodada 3: só Aurora e Estúdio, em fundo cinza-claro; Meia-noite fora (22/10)
- [x] Terceiro acabamento, Escultura (Lusion, peça 3D do logo), e o logo horizontal novo nos três (22/10)
- [x] Um link para cada design, para a votação não confundir (22/10)
- [x] Aurora mais suave e organizado, com título em Cabinet Grotesk 800 (22/10)
- [x] Turma votou: **Aurora** (23/10). Estúdio e Escultura descartados (fonte em `design/arquivo/`)

## Fatia 0.2 — Design escolhido vira sistema

Pronto quando: `docs/design.md` tem cores, fontes, espaçamento e componentes.

- [x] Paleta da interface: fica a atual; as cores do logo horizontal só nas imagens do logo (22/10)
- [x] Passo a passo logo no começo da página Início, num cartão abaixo dos botões (sugestão
      da turma; feito em 23/10)
- [x] Fonte dos títulos: Schibsted Grotesk 800, licença aberta (a Cabinet Grotesk tem licença
      fechada e não pode ir para o repositório público); escolhida pela Mariane em 23/10
- [x] Registrar tokens e componentes do Aurora em [design.md](design.md) (23/10)
- [x] Commit (PR de 23/10)

## Fatia 1.1 — Envio anônimo de ponta a ponta

Pronto quando: uma manifestação enviada pelo celular no endereço público aparece no banco,
e a chave pública sozinha é recusada ao ler a tabela.

- [x] `git init`, Next.js + TS + Tailwind com versões fixas, ESLint e Prettier
- [x] Cabeçalhos de segurança (CSP, X-Frame-Options, Referrer-Policy)
- [x] Migration: `manifestacoes`, `limites`, enums, RLS ligada, nada para `anon` (rodada em 24/10)
- [x] Gerar protocolo e hash; validar texto; limite por IP; Turnstile com falha fechada
- [x] Páginas Início e Enviar no design escolhido, com aviso de emergência
- [x] Teste (Vitest): protocolo, validação, limite, falha fechada
- [x] Deploy na Vercel e conferência de fora (24/10: https://escuta14.vercel.app)
- [x] Commit: `feat(envio): manifestação anônima com protocolo` (PR #4)

## Fatia 1.2 — Painel da equipe

- [x] Login (Supabase Auth), tabela `equipe`, policies por papel; cadastro aberto desligado (24/10)
- [x] Lista com filtros, detalhe, andamento e resposta, histórico, moderação com fundamento,
      prorrogação, exclusão (soft delete) (24/10)
- [x] Equipe: convidar, trocar papel, desativar/reativar; troca de diretor; lembrete anual (24/10)
- [x] Teste: atendimento não modera; conta desativada não lê nada (`supabase/testes/painel_permissoes.sql`, 18 de 18)
- [ ] Primeira conta da direção (falta o e-mail do diretor) e primeiro login de verdade
- [x] Commit

## Fatia 1.3 — Acompanhar pelo protocolo

- [x] Consulta pelo corpo do formulário, com Turnstile e limite, no Início e em /acompanhar; desistência (24/10)
- [x] Teste: situação de cada estado; protocolo errado só diz "não achamos" (24/10)
- [ ] Commit

## Refactor — depois da fatia 1.3

- [ ] Arquivo acima de 200 linhas: quebrar por responsabilidade
- [ ] Código morto: apagar
- [ ] Repetição: extrair
- [ ] Nome ruim: renomear enquanto é barato
- [ ] Spec ainda descreve o que o sistema faz? Se não, atualizar `docs/spec.md`
- [ ] Testes continuam passando
- [ ] Commit do refactor separado do commit de feature

## Adiantado da fase 2 (24/10, pedido da Mariane)

- [x] Mural: publicadas do ano atual, ordem (mais apoiadas/recentes), filtro por tipo e assunto,
      aviso de retirada com o fundamento
- [x] Voto: apoiar, contestar, trocar, desfazer; 1 por aparelho (cookie protegido, só o código
      embaralhado no banco); limite de 1.000 por hora
- [x] Início: passo a passo com dúvidas que abrem; consulta de verdade no lugar do exemplo
- [x] Envio: etapas alinhadas (uma barrinha por etapa)
- [ ] Mural: filtro "anos anteriores" (só leitura), quando houver ano anterior
- [x] 2.3: "A escola ouviu" (números do ano e do mês por tema e categoria, % no prazo,
      providências); /painel/numeros (mais segmento e mês); /painel/providencias (direção)
- [x] 3.2: rotina diária (Vercel Cron em `/api/rotina`, trava com `CRON_SECRET`) e página Sobre
- [x] Rotina cadastrada na Vercel e disparada por ela em 26/10 ("rotina: ok"). O log do Hobby dura
      só 1 hora, então a rotina passou a anotar a última execução no banco, e o painel mostra
- [ ] Conferir em 27/10 que a hora da última execução mudou sozinha (`select * from rotina;`)

## Fatias 2.1 a 3.4

Detalhadas quando a fase 1 terminar (ver [plano](plano.md)).

## Guardado para depois

- VLibras (tradutor de Libras do governo federal): avaliar na fatia 3.2, porque carrega
  script de fora e pede exceção na CSP.
- Anexos, aviso por e-mail, assunto/local, identificação opcional: v2 (ver spec).
