# Spec — ESCUTA 14

> O que o sistema faz. Não descreve código. Atualizar sempre que a implementação
> divergir daqui — spec desatualizada engana mais do que ajuda.
> Vocabulário: [GLOSSARY.md](../GLOSSARY.md). Decisões difíceis de desfazer: [docs/adr/](adr/).

Última atualização: 22/10/2026 (depois do /grill-with-docs)

## Problema

No Colégio Estadual 14 de Dezembro (Peabiru, PR), quem quer dizer algo à escola, seja uma
reclamação, uma ideia, um elogio ou um relato, precisa falar pessoalmente e se identificar.
Muita coisa não chega à direção por medo de exposição ou de retaliação, ou porque não existe
canal. A direção, por sua vez, não tem um registro organizado do que a comunidade pensa.

A **lei ESCUTA 14**, projeto de lei da turma do 3º ano B (2026), institui o Programa de
Participação e Escuta Estudantil ([texto](projeto-de-lei.md)) e propõe um canal digital
permanente, gratuito e anônimo. O **ESCUTA 14** (o site) é esse canal funcionando: uma
ouvidoria que a escola herda e mantém depois que a turma se formar.

A lei é a fonte das regras de produto, e o site é a fonte das alterações da lei (as duas
andam juntas). Artigos citados nesta spec são os da versão 3 da lei:

| Regra | Artigo da lei |
|---|---|
| Categorias da manifestação | art. 5º |
| Anonimato, sem cadastro, protocolo | art. 6º |
| Equipe (direção + quem ela designar) e sigilo | art. 7º |
| Temas, prazo de 30 dias, resposta única | art. 8º |
| Proibição de expor ou constranger | art. 9º |
| Mural, desistência, apoio sem caráter de votação, aviso de retirada | art. 10 |
| Aviso de emergência | art. 11 |
| Fundamentos de recusa, retirada e exclusão; justificativa formal | art. 12 |
| Prestação de contas pública ("A escola ouviu") | art. 14 |
| Custo zero, contas com a direção, código aberto | art. 15 |
| Participação da comunidade escolar inteira | art. 16 |

## Quem usa

| Perfil | O que faz no sistema |
|---|---|
| Autor (anônimo: estudante, professor, funcionário ou responsável) | Envia manifestação, acompanha e desiste pelo protocolo, lê o mural, apoia ou contesta |
| Atendimento (quem a direção escolher: secretaria, equipe pedagógica, coordenação) | Lê e organiza as manifestações, muda o andamento, escreve a resposta, pede avaliação da direção |
| Direção | Tudo o que o atendimento faz, mais: decide o mural (aprova, recusa, retira), exclui, prorroga prazo, publica providências e cuida da equipe |
| Mantenedor (Mariane até o fim do ano letivo de 2026; depois, quem a direção nomear) | Mexe no código e nas contas; **não tem conta no painel** |

O grêmio estudantil não tem acesso ao painel: acompanha pelo mural e por "A escola ouviu",
como qualquer pessoa.

## Escopo da primeira versão (até a mostra de 10/11/2026)

Entra:

- Envio anônimo: categoria, tema, segmento, texto e a opção "quero que seja pública".
- Protocolo para o autor acompanhar o andamento, o prazo, a resposta e a situação no mural, e
  para desistir da publicação.
- Painel da equipe: login, lista com filtros, detalhe, andamento, resposta, prazo, pedido de
  avaliação, histórico.
- Moderação do mural pela direção, sempre com fundamento da lei e justificativa formal.
- Mural público por ano letivo, com apoio e contestação anônimos em números.
- "A escola ouviu" (art. 14): números por tema e categoria, percentual respondido no prazo e
  providências.
- Aviso de emergência nas telas de envio e de protocolo.
- Equipe gerida pelo painel: a direção convida, muda papel e desativa contas.
- Marcação de **demonstração** para o dia da mostra.
- Rotina diária que impede o Supabase gratuito de pausar e apaga os registros do antispam.
- Manual da escola (para a direção), manual técnico (para o mantenedor) e termo de sigilo.
- Visual com as cores e o logo do colégio, no celular, no tablet e no computador.
- Acesso por link e por QR code para os cartazes da escola (art. 4º).

**Não** entra agora (e por quê):

- Anexo de foto ou arquivo: pode trazer rosto, documento e dado pessoal de menor.
- Aviso por e-mail a cada manifestação nova: exige mais um serviço e mais uma conta para herdar.
- Conversa entre autor e escola: a resposta é única; quem discordar envia outra manifestação.
- Comentários no mural: viraria uma rede social anônima entre menores, difícil de moderar.
- Recurso formal contra recusa: a justificativa formal e o reenvio resolvem os casos comuns.
- Regra automática por número de apoios: convida campanha de votos.
- Identificação opcional (nome ou contato): quebra a promessa de anonimato.
- Aplicativo de celular e domínio próprio: o site funciona no celular; `escuta14.vercel.app`
  (ou o mais próximo disponível) é gratuito.

## Como sabemos que deu certo

- **Na mostra (10/11/2026):** um visitante lê o QR code, envia uma manifestação pública pelo
  celular, a direção aprova no painel, a manifestação aparece no mural e outra pessoa apoia.
  O ciclo inteiro ao vivo, em menos de dois minutos.
- **No ano seguinte:** o site continua no ar sem ninguém da turma mexer, a direção entra no
  painel pelo menos uma vez por mês e "A escola ouviu" mostra respostas dentro do prazo.

## Telas

### Início (`/`)

- Mostra: o nome ESCUTA 14 e o logo do colégio, a promessa de anonimato em uma frase e os
  caminhos: "Enviar manifestação", "Ver o mural", "Acompanhar meu protocolo", "A escola ouviu".

### Enviar (`/enviar`)

- Objetivo: mandar uma manifestação em menos de um minuto.
- Mostra: categoria (botões grandes), "Sobre o quê?" (tema), "Você é…" (segmento), texto com
  contador, a caixa "Quero que seja pública" (explicando que a direção aprova antes e que dá
  para desistir depois), o aviso de emergência e a verificação antispam.
- Sucesso: tela do protocolo, com o código grande, botão de copiar, a data até a qual a escola
  deve responder e o aviso "guarde este código; ninguém consegue recuperá-lo".
- Estados: enviando / erro (texto curto, limite estourado, falha do antispam, banco fora).

### Acompanhar (`/acompanhar`)

- A mesma consulta aparece no Início, no cartão "Já mandou? Veja a resposta" (24/10/2026). O
  antispam só carrega quando a pessoa usa o campo.

- Mostra, depois de digitar o protocolo (no corpo do formulário, nunca na URL):
  - andamento e prazo ("a escola tem até 21/11 para responder"; se houve prorrogação, a nova
    data e a explicação da direção);
  - a resposta da escola, quando houver;
  - a situação no mural: aguardando, publicada, recusada ou retirada (com a **justificativa
    formal**), ou desistida;
  - se a manifestação foi excluída, a justificativa formal da exclusão.
- Ações do autor: "Cancelar o pedido de publicação" (enquanto aguarda) e "Tirar do mural"
  (quando publicada). É a **desistência**: não pede justificativa.

### Mural (`/mural`)

- Mostra as manifestações publicadas do **ano letivo atual**: categoria, tema, segmento, dia,
  texto, apoios, contestações e a resposta da escola.
- Uma manifestação retirada pela direção vira um aviso no lugar dela: *"Manifestação retirada
  pela direção com base no art. 12, § 1º, inciso III, da lei ESCUTA 14 (linguagem
  desrespeitosa)."* A desistência some sem aviso.
- Ações: ordenar por "mais apoiadas" ou "mais recentes", filtrar por categoria e tema, apoiar,
  contestar, desfazer. Filtro "anos anteriores", só para leitura (sem apoio novo).
- Texto fixo: os números são um termômetro da comunidade, não uma votação oficial.

### A escola ouviu (`/a-escola-ouviu`)

- Quantas manifestações chegaram por tema e por categoria (no mês e no ano letivo), quantas
  foram respondidas dentro do prazo (percentual) e as providências publicadas pela direção,
  cada uma ligada a um tema e com data.
- Nunca mostra texto de manifestação privada nem nada que identifique alguém. Demonstrações e
  exclusões não entram nos números.
- O percentual no prazo só conta as manifestações com desfecho: já respondidas, ou com o prazo
  (ou a prorrogação) vencido sem resposta. As que ainda estão no prazo ficam de fora.

### Sobre (`/sobre`)

- O que é o ESCUTA 14, como funciona o anonimato (só o que o código cumpre), o texto aceito da
  lei ESCUTA 14 e os créditos do 3º ano B de 2026.
- "O colégio" (`/sobre#colegio`): endereço, telefone da secretaria, WhatsApp, e-mail e Instagram da escola, com o aviso de que esses
  canais não são anônimos. O logo do colégio, no Início e no rodapé, leva para cá.

### Painel da equipe (`/painel/...`)

| Tela | O que faz |
|---|---|
| `/painel/entrar` | Login com e-mail e senha |
| `/painel` | Abas "Para responder" (sem resposta, das mais antigas para as mais novas; abre nela), "Respondidas" e "Todas"; passo a passo "Como usar o painel" e filtros recolhidos (categoria, tema, segmento, publicação, período, demonstração); destaque para prazo vencendo ("aguardando há 26 dias") |
| `/painel/manifestacao/[id]` | Texto completo e a resposta em destaque (com o aviso "vai aparecer no mural" quando publicada); **salvar a resposta volta para a lista**. Se pediu o mural, a direção aprova ou recusa logo abaixo. Recolhidos: "Outras ações" (andamento, corrigir tema, pedir avaliação, prorrogar e excluir, estes da direção) e o histórico |
| `/painel/moderacao` ("Aprovações" no menu) | Só direção: fila de pedidos de publicação e de pedidos de avaliação; aprovar, recusar ou retirar escolhendo o fundamento e escrevendo a explicação |
| `/painel/providencias` | Só direção: publicar providências em "A escola ouviu" |
| `/painel/numeros` | Totais por tema, categoria, segmento e mês; percentual respondido no prazo |
| `/painel/equipe` | Só direção: convidar, mudar papel (direção ou atendimento), desativar e reativar contas. No fim, "Rotina diária": a hora da última execução da rotina (em vermelho se passou de 26 horas). Ninguém tira o próprio acesso de direção (a troca de diretor é: o antigo convida o novo, o novo desativa o antigo). Lembrete de conferir a lista no começo de cada ano letivo |

## Entidades e campos

### manifestacoes

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| id | uuid | sim | gerado pelo banco; nunca aparece fora do painel |
| codigo_publico | uuid | sim | aleatório; é o que o mural usa no lugar do id (regra 26) |
| protocolo_hash | texto | sim | hash do protocolo; único; o protocolo em si não é guardado |
| categoria | enum | sim | sugestao, reclamacao, critica, elogio, relato, proposta, outra |
| tema | enum | sim | infraestrutura, convivencia, ensino, atendimento, organizacao, seguranca, outro; a equipe pode corrigir |
| segmento | enum | sim | estudante, professor, funcionario, responsavel |
| texto | texto | sim | 10 a 3.000 caracteres, sem espaços nas pontas; nunca editado pela escola |
| publicacao | enum | sim | privada, aguardando, publicada, recusada, retirada, desistida |
| andamento | enum | sim | nova, em_analise, respondida, arquivada; arquivar só depois de responder |
| resposta | texto | não | uma só; até 3.000 caracteres; correções vão para o histórico |
| respondida_em | data e hora | não | primeira gravação da resposta (conta para o prazo) |
| prazo_em | data | sim | envio + 30 dias |
| prorrogada_ate | data | não | prazo + 30 dias; uma vez só, pela direção |
| explicacao_prorrogacao | texto | não | obrigatória ao prorrogar; o autor lê |
| pedido_avaliacao | booleano | sim | marcado pelo atendimento para a direção decidir |
| demonstracao | booleano | sim | verdadeiro se enviada dentro do período da mostra |
| criada_em | data e hora | sim | padrão agora |
| atualizada_em | data e hora | sim | muda a cada alteração |
| excluida_em | data e hora | não | exclusão = soft delete, sempre com justificativa |

### justificativas

Uma por recusa, retirada ou exclusão. **Não se edita nem se apaga.**

| Campo | Tipo | Regra |
|---|---|---|
| manifestacao_id | uuid | a manifestação |
| acao | enum | recusa, retirada, exclusao |
| fundamento | enum | da lista do art. 12 compatível com a ação (ver abaixo) |
| explicacao | texto | obrigatória, de 20 a 1.000 caracteres |
| texto_formal | texto | montado pelo site com o artigo, o inciso, a explicação e a data |
| usuario_id | uuid | quem da direção decidiu (nunca aparece para o público) |
| criada_em | data e hora | |

Fundamentos (art. 12):

| Ação | Fundamento | Inciso |
|---|---|---|
| Recusa ou retirada | identifica o autor ou outra pessoa | § 1º, I |
| Recusa ou retirada | expõe ou constrange alguém | § 1º, II |
| Recusa ou retirada | linguagem desrespeitosa, ofensiva ou discriminatória | § 1º, III |
| Recusa ou retirada | contém dado pessoal | § 1º, IV |
| Recusa ou retirada | sem relação com a comunidade escolar | § 1º, V |
| Exclusão | propaganda, spam ou texto sem sentido | § 3º, I |
| Exclusão | repete manifestação já enviada | § 3º, II |
| Exclusão | apenas ofensas, sem nada aproveitável | § 3º, III |

### votos

manifestacao_id, votante_hash (código embaralhado do aparelho), tipo (apoio ou contestacao),
criado_em. Chave: (manifestacao_id, votante_hash). Votos de manifestação retirada ou
desistida ficam guardados, sem aparecer.

### equipe

usuario_id (Supabase Auth), nome (do funcionário, nunca de quem escreve), papel (direcao ou
atendimento), ativo (desativada perde o acesso na hora), criado_em.

### providencias

titulo, texto, tema, data, publicada, usuario_id (nunca aparece no site público).

### historico

Quem fez o quê no painel: manifestacao_id, usuario_id, ação, valor anterior, valor novo, data.

### limites (antispam)

chave (código embaralhado de IP + ação + janela), contador, início da janela. **Sem ligação
nenhuma com manifestações ou votos.** Apagado em 2 dias.

## Regras de negócio

**Anonimato**

1. Ninguém precisa de login, nome, e-mail ou telefone para enviar, consultar ou votar.
2. O site não grava IP, aparelho nem navegador junto com a manifestação ou com o voto.
3. O antispam guarda só um código embaralhado do IP, numa tabela separada, apagado em 2 dias.
4. O protocolo tem o formato `E14-XXXXX-XXXXX`, sem caracteres que confundem (0/O, 1/I/L), e
   aparece uma única vez. O banco guarda só o hash. Protocolo perdido não se recupera.

**Envio**

5. O texto tem de 10 a 3.000 caracteres depois de tirar os espaços das pontas.
6. Com pedido público, a manifestação nasce "aguardando"; sem pedido, "privada".
7. O autor escolhe o tema; a equipe pode corrigi-lo (vai para o histórico). Os números usam o
   tema corrigido.
8. Envio e consulta de protocolo passam pelo Turnstile. Sem a chave configurada no servidor,
   são recusados (falha fechada).
9. Limites por IP e por hora: 60 envios, 1.000 votos e 120 consultas. São altos de propósito:
   no Wi-Fi da escola, todos saem pelo **mesmo IP**.
10. Tudo o que chega no período da mostra (configurado; padrão: 10/11/2026 inteiro, horário de
    Brasília) nasce como **demonstração**: fica separado no painel e fora dos números.

**Resposta e prazo**

11. Cada manifestação tem uma resposta só. A equipe pode corrigi-la; a correção vai para o
    histórico. Não há troca de mensagens.
12. O prazo é de 30 dias a partir do envio. Só a direção prorroga, uma vez, por mais 30 dias,
    com explicação que o autor lê.
13. Conta como "respondida no prazo" a manifestação cuja primeira resposta saiu até o prazo
    (ou até a prorrogação).
14. Uma manifestação só vai para "arquivada" depois de ter resposta. Sem resposta, só sai da
    fila por exclusão.
15. Se a manifestação está publicada, a resposta aparece no mural; o painel avisa antes de salvar.

**Mural e "dizer não"**

16. Nada aparece no mural sem a aprovação da direção.
17. Recusa, retirada e exclusão são só da direção e exigem fundamento da lista do art. 12
    compatível com a ação, mais explicação. O site monta a justificativa formal; o autor lê
    pelo protocolo. A justificativa não se edita depois de gravada.
18. O atendimento não diz não: ele marca "pedir avaliação da direção".
19. A recusa e a retirada não tiram a manifestação da fila da equipe; ela continua sendo
    analisada e respondida.
20. A retirada deixa no mural um aviso com o fundamento. A desistência do autor some sem aviso
    e não pede justificativa.
21. A escola não edita o texto de ninguém. Quem discordar de uma recusa reenvia o texto sem o
    problema apontado.
22. Exclusão é soft delete: some do painel e das páginas públicas, mas nunca é apagada do banco.
23. Um voto por aparelho em cada manifestação publicada do ano letivo atual; dá para trocar e
    desfazer. "Aparelho" é um código aleatório num cookie protegido (1 ano); o banco guarda só
    a versão embaralhada.
24. Apoios não disparam nenhuma obrigação automática; são um termômetro.
25. O mural mostra o ano letivo atual (o ano corrente, no horário de Brasília); anos anteriores
    ficam só para leitura.
26. O mural e "A escola ouviu" nunca mostram id, andamento interno, histórico, hora exata nem
    quem da equipe decidiu.

**Segurança e equipe**

27. Toda mudança feita no painel vai para o histórico (quem, quando, o quê).
28. Conta desativada perde o acesso na hora.
29. As telas de envio e de protocolo mostram o aviso de emergência (art. 11): o ESCUTA 14 é
    anônimo e não consegue socorrer ninguém.
30. O mantenedor não tem conta no painel. Lê o texto de uma manifestação real só quando for
    preciso para corrigir um erro, e assina termo de sigilo com a direção (art. 7º, parágrafo
    único).

## Permissões

| Ação | Quem pode |
|---|---|
| Enviar, consultar protocolo, desistir, ler o mural e "A escola ouviu", votar | Qualquer pessoa, sem login (desistir: só quem tem o protocolo) |
| Ler manifestações, filtrar, ver números e histórico | Atendimento e direção |
| Mudar andamento, responder, corrigir tema | Atendimento e direção |
| Pedir avaliação da direção | Atendimento |
| Aprovar, recusar ou retirar do mural; excluir | Direção (sempre com justificativa) |
| Prorrogar prazo | Direção |
| Publicar providências | Direção |
| Convidar, mudar papel, desativar conta da equipe | Direção |
| Mexer no banco, no código e nas contas | Mantenedor (sem conta no painel) |

A chave pública do Supabase sozinha **não lê nem grava nada** (ver ADR 0001). Dado de usuário
nunca é excluído de verdade.

## Casos de erro

| Situação | O que o sistema faz | O que a pessoa vê |
|---|---|---|
| Texto curto ou longo demais | Não envia | O contador fica vermelho e diz quanto falta ou sobra |
| Antispam falhou | Recusa | "Não conseguimos confirmar que você é uma pessoa. Tente de novo." |
| Limite por hora estourado | Recusa | "Muitas mensagens deste lugar agora. Tente daqui a pouco." |
| Banco fora do ar ou pausado | Não perde o texto digitado | "O ESCUTA 14 está fora do ar agora. Seu texto continua aqui." |
| Protocolo não encontrado | — | "Não achamos esse protocolo. Confira as letras e os números." |
| Recusa sem fundamento ou sem explicação | Não grava | "Escolha o fundamento da lei e explique o caso." |
| Arquivar sem resposta | Não deixa | "Responda antes de arquivar." |
| Segunda prorrogação | Não deixa | "O prazo desta manifestação já foi prorrogado uma vez." |
| Sessão do painel expirou | Volta para o login | "Sua sessão terminou. Entre de novo." |
| Voto em manifestação retirada ou de ano anterior | Recusa | "Esta manifestação não recebe mais apoios." |
| Conta da equipe desativada | Recusa o login e as ações | "Esta conta não tem mais acesso." |

Nenhuma mensagem de erro mostra detalhe interno (nome de tabela, SQL, pilha de erro).

## Integrações e serviços externos

| Serviço | Para quê | Segredo necessário (nome da variável) |
|---|---|---|
| Supabase (Free) | Banco, login da equipe | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (todas só no servidor; ADR 0001) |
| Cloudflare Turnstile (grátis) | Antispam do envio e da consulta | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Vercel (Hobby) | Hospedagem e rotina diária (`/api/rotina`, todo dia) | `CRON_SECRET` |
| GitHub | Código; cada merge na `main` publica na Vercel (ADR 0004); `verificar.yml` confere os PRs | — |
| — | Embaralhar IP, aparelho e protocolo | `SEGREDO_ANONIMATO` |
| — | Período da mostra | `MOSTRA_INICIO`, `MOSTRA_FIM` (não são segredo) |

Nenhuma chave aparece neste documento nem no código. Todas as contas (GitHub, Vercel,
Supabase, Cloudflare) usam o **e-mail próprio do ESCUTA 14**. A Mariane criou esse e-mail em
23/10/2026, e ele vai para a direção na passagem. A mantenedora entra com a conta pessoal, como
convidada, no GitHub e no Supabase. Ver o [manual técnico](manual-tecnico.md).

## Perguntas em aberto

- [x] Categorias, temas e segmentos: os da lei (arts. 5º, 8º e 16). Resolvido em 22/10.
- [x] Regras do mural, da justificativa, do prazo e do acesso: resolvidas no grilling de 22/10.
- [ ] A página Sobre mostra os nomes das autoras ou só "3º ano B de 2026"? (turma; nomes só
      com o sim de cada uma)
- [x] E-mail das contas: um e-mail próprio do site, criado pela Mariane, que vai para a
      direção na passagem. Resolvido em 23/10.
- [ ] Nome e e-mail da primeira conta da direção. (direção)
- [ ] Data exata da passagem (última semana de aula de 2026) e mantenedor depois dela. (direção)
