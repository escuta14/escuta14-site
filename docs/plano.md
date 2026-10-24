# Plano — ESCUTA 14

> Como o projeto vai ser construído, em fatias que funcionam de ponta a ponta.
> Base: [spec.md](spec.md). Tarefas detalhadas: [tarefas.md](tarefas.md).

Última atualização: 22/10/2026 · **Prazo: mostra interdisciplinar em 10/11/2026**

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Front | Next.js + TypeScript + Tailwind | Padrão da Mariane, o que a Vercel roda melhor e o que tem mais material para quem herdar |
| Back | Server Actions e rotas do Next | O servidor guarda a chave secreta e confere antispam e limites; o navegador nunca fala direto com o banco |
| Banco / auth | Supabase Free (Postgres + Auth) | Gratuito, com RLS e login da equipe prontos |
| Antispam | Cloudflare Turnstile | Gratuito, sem quebra-cabeça para humano e sem rastrear como o reCAPTCHA |
| Deploy | Vercel Hobby ligada ao GitHub + Vercel Cron | Gratuito; repositório público não esbarra na vaga única do Hobby (ADR 0004); a rotina diária mantém o Supabase acordado |
| Testes | Vitest (regras) + Playwright (fluxo) | Decisão da Mariane: regras + caminho feliz |

## Fases

Espinha: problema → ideia → planejamento → design → desenvolvimento → banco/API →
testes → deploy → divulgação → feedback → melhorias.

### Fase 0 — Design escolhido pela turma (22/10 a 26/10)

| # | Fatia | Entrega visível | Depende de |
|---|---|---|---|
| 0.1 | Três direções de design | Protótipos navegáveis de Início, Enviar e Mural em 3 estilos, no celular, tablet e computador, com link para a turma votar | — |
| 0.2 | Design escolhido vira sistema | Cores, fontes e componentes da direção vencedora em `docs/design.md` | 0.1 + voto da turma |

### Fase 1 — Envio no ar (até 29/10)

| # | Fatia | Entrega visível | Depende de |
|---|---|---|---|
| 1.1 | Envio anônimo de ponta a ponta | Mandar uma manifestação pelo site no ar e receber o protocolo | contas do site, 0.2 |
| 1.2 | Painel da equipe | Login (direção e atendimento), lista com filtros, detalhe, andamento, resposta única e prazo de 30 dias | 1.1 |
| 1.3 | Acompanhar pelo protocolo | O autor lê o andamento, o prazo e a resposta | 1.2 |

### Fase 2 — Mural (até 03/11)

| # | Fatia | Entrega visível | Depende de |
|---|---|---|---|
| 2.1 | Moderação com justificativa formal | Fila da direção; recusa, retirada e exclusão com fundamento do art. 12; pedido de avaliação; desistência pelo protocolo | 1.2 |
| 2.2 | Mural com apoiar e contestar | Manifestações aprovadas no ar por ano letivo, voto único por aparelho, aviso de retirada | 2.1 |
| 2.3 | Números e "A escola ouviu" | Totais por tema, categoria e segmento no painel; página pública com números e providências (art. 11 da lei) | 1.2 |

### Fase 3 — Pronto para a mostra e para durar (até 08/11)

| # | Fatia | Entrega visível | Depende de |
|---|---|---|---|
| 3.1 | Equipe pelo painel | A direção convida, muda papel e desativa contas; prorrogação de prazo; marcação de demonstração; histórico | 1.2 |
| 3.2 | Rotina diária e página Sobre | Supabase não pausa; limites antigos somem; projeto de lei publicado | 1.1 |
| 3.3 | Segurança e testes de ponta a ponta | Auditoria, Playwright do ciclo inteiro, conferência de fora | tudo |
| 3.4 | Passagem para a escola | Manual da escola, manual técnico, termo de sigilo assinado, e-mail e contas do site entregues à direção, com a mantenedora como convidada | tudo |

**09/11:** folga para imprevistos e ensaio da demonstração (QR code, roteiro).
**10/11:** mostra.

## Fatia 0.1 em detalhe

Não depende de conta nenhuma, por isso vem primeiro.

- O que faz: três direções visuais diferentes, cada uma pesquisada nos sites de referência
  (styles.refero.design, cult-ui.com, shadergradient.co e os complementares) e montada sobre
  as cores e o logo do colégio. Cada direção mostra Início, Enviar e Mural.
- Arquivos previstos: `docs/design/` com os protótipos e os prints; `docs/referencias.md` com
  a fonte de cada escolha.
- Teste que acompanha: conferência em 375 px (celular), 768 px (tablet) e 1280 px
  (computador); nenhuma tela rola para o lado; contraste AA; navegação só pelo teclado.
- Publicação: um link para a turma ver e escolher.
- Pronto quando: a turma escolheu uma direção.

## Fatia 1.1 em detalhe (a primeira que vai ao ar)

- O que faz: página inicial e `/enviar` no visual escolhido; o servidor valida o texto,
  confere o Turnstile e o limite por IP, grava e devolve o protocolo. Aviso de emergência.
  Cabeçalhos de segurança (CSP, X-Frame-Options).
- Banco: migration com `manifestacoes` e `limites`, RLS ligada e nenhuma policy para `anon`.
- Teste que acompanha: Vitest no protocolo (formato, hash), na validação do texto, no
  limite por IP e na falha fechada sem `TURNSTILE_SECRET_KEY`.
- Deploy: Vercel da escola, ligada ao GitHub (ADR 0004); repositório público (MIT).
- Pronto quando: uma manifestação enviada pelo celular no endereço público aparece no banco,
  e a chave pública sozinha recebe recusa ao tentar ler a tabela.

## Paradas de refactor

| Depois da fatia | O que revisar |
|---|---|
| 1.3 | arquivos acima de 200 linhas, repetição, código morto, spec ainda bate |
| 2.3 | idem + consultas do mural e do painel |
| 3.2 | idem + comentários pensando em quem vai herdar |

## Riscos

| Risco | Sinal de que aconteceu | Plano B |
|---|---|---|
| Supabase Free pausa depois de 7 dias parado (férias) | Site mostra "fora do ar" | Rotina diária da Vercel consulta o banco; manual explica como despausar |
| Contas perdidas quando a turma sair | Ninguém sabe a senha | Contas num e-mail próprio do site desde o primeiro dia; na passagem, senha, recuperação e códigos de reserva vão para a direção (manual técnico) |
| Fala ofensiva ou com nome de aluno no mural | Reclamação na escola | Nada é publicado sem aprovação; direção retira com um clique |
| Spam ou ataque no formulário | Centenas de envios iguais | Turnstile + limite por IP + exclusão (soft delete) de spam |
| Limite por IP barrando a escola inteira | Alunos no Wi-Fi recebem "muitas mensagens" | Limites altos por causa do IP compartilhado; ajuste por variável |
| Termos do plano Hobby da Vercel (uso não comercial) | Aviso da Vercel | Projeto escolar sem fins lucrativos; se precisar, Cloudflare Pages |
| Contas do site atrasarem | 1.1 parada | Fase 0 não depende delas; começar as contas já |
| Vercel Hobby barrar commits da mantenedora | Site para de atualizar | Repositório público (a ligação Git publica); se virar privado, rotina do GitHub (ADR 0004) |
| Passagem esquecida no fim do ano | Ex-aluno com acesso à produção | Última semana de aula: remover convites, trocar token, mantenedor nomeado (tarefa marcada) |
| Atualização do Next quebrar o site anos depois | Build falha na Vercel | Versões fixas no `package.json`; o manual técnico explica como atualizar |

## Depois de rodar

- Divulgação: QR code na mostra, cartaz nos corredores, grupo de pais.
- Feedback: perguntar à direção e à secretaria, depois de duas semanas, o que falta no painel.
- Melhorias já previstas para a v2: anexos, aviso por e-mail, assunto/local como filtro,
  identificação opcional.
