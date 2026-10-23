# ESCUTA 14

> Lido pelo Claude em toda sessão deste projeto. Instrução que se repetir no chat
> deve ser escrita aqui — repetir no chat some quando a conversa acaba, aqui não.

## O que é

Ouvidoria anônima e gratuita do **Colégio Estadual 14 de Dezembro (Peabiru, PR)**, criada
pela **lei ESCUTA 14** (projeto de lei da turma). Estudantes, professores, funcionários e
responsáveis mandam manifestações para a equipe da escola (direção e atendimento), que responde
por um painel em até 30 dias. Manifestações aprovadas pela direção vão para um mural público,
onde qualquer um apoia ou contesta.

Feito pela turma do 3º ano B de 2026 (Mariane no site) para a mostra interdisciplinar de
10/11/2026, a pedido do professor Michel (Mídias Digitais e Sociologia), junto com a lei
ESCUTA 14. ("Nossa Voz, Nossa Escola" foi o nome anterior à votação; não usar.) **É um presente para a escola: precisa continuar
funcionando depois que a turma se formar, nas mãos de quem nunca viu o código.**

Documentos: [glossário](GLOSSARY.md) · [spec](docs/spec.md) · [plano](docs/plano.md) ·
[tarefas](docs/tarefas.md) · [design](docs/design.md) · [decisões (ADRs)](docs/adr/) · [referências](docs/referencias.md) ·
[projeto de lei](docs/projeto-de-lei.md) · [termo de sigilo](docs/termo-de-sigilo.md) ·
[manual técnico](docs/manual-tecnico.md)

Ficha no segundo cérebro: `~/.claude/second-brain/projects/escuta-14.md`

## Stack

| Camada | Escolha |
|---|---|
| Front | Next.js + TypeScript + Tailwind |
| Back | Server Actions e rotas do Next |
| Banco / auth | Supabase Free (Postgres + Auth) |
| Antispam | Cloudflare Turnstile |
| Deploy | Vercel Hobby, publicado por GitHub Actions (ADR 0004) + Vercel Cron |
| Testes | Vitest (regras) + Playwright (fluxo principal) |

## Como rodar

Preenchido na fatia 1.1, quando o projeto Next existir.

## Estilo e convenções

- **Idioma do código: português.** Arquivos, variáveis, funções, tabelas, colunas e
  commits (`manifestacoes`, `segmento`, `apoiar()`). Termos do próprio framework ficam
  como são (`page.tsx`, `useState`).
- Idioma de conversa e documentos: português. Sem linguagem neutra.
- **Comentários explicando bastante:** cada arquivo começa dizendo para que serve, e cada
  regra diz o porquê. Quem herdar o projeto pode ser um aluno que nunca viu Next.js.
- Formatação: Prettier + ESLint no padrão do Next.
- Mensagem de commit: `tipo(escopo): o que mudou`, em português.
- Texto da interface: frases curtas, palavras do dia a dia, sem sigla sem explicação.
- **Visual: seguir [docs/design.md](docs/design.md)** (Aurora: cores, fontes, espaço,
  componentes). Tela nova que precise de algo fora dele: primeiro mudar o design.md.
- **Vocabulário do [GLOSSARY.md](GLOSSARY.md)** no código, na interface e nos documentos:
  manifestação (nunca "fala"), atendimento (nunca "secretaria" como papel), recusa, retirada,
  exclusão, desistência, fundamento, justificativa. Termo novo ou mudado vai para o glossário.

## Regras permanentes

1. **Segredo nunca entra no código.** Senha, chave de API e token só em `.env.local`, com
   `.env.example` sem valor e `.env*` no `.gitignore`. Chave commitada fica no histórico.
2. **Arquivo pequeno, uma responsabilidade por módulo.** Alvo de ~200 linhas; acima de 300,
   quebrar.
3. **Teste junto com a feature**, no mesmo commit.
4. **Commit a cada fatia funcionando**, dizendo o que mudou e por quê.
5. **Uma fatia por vez**, na ordem de `docs/tarefas.md`. O que aparecer no caminho vai para
   "Guardado para depois".
6. **Refactor nas paradas marcadas** no plano.
7. **Bug é para entender:** explicar a causa antes de corrigir.
8. **Nunca excluir dado de usuário.** Exclusão é soft delete (`excluida_em`), com confirmação.
9. **Spec é viva:** se a implementação mudar uma regra, `docs/spec.md` muda junto.
10. **O anonimato é a promessa do produto** ([ADR 0002](docs/adr/0002-anonimato-no-codigo.md)). Nunca gravar IP, user agent, cookie ou qualquer
    coisa que identifique o aparelho junto com uma manifestação ou um voto. O antispam usa só
    HMAC do IP, em tabela separada, apagado em 2 dias. Não pôr analytics, pixel nem script de
    rastreamento. A página Sobre só promete o que o código cumpre.
11. **Navegador nunca fala direto com o banco** ([ADR 0001](docs/adr/0001-navegador-nunca-fala-com-o-banco.md)). Todas as tabelas têm RLS ligada e nenhuma
    policy para `anon`. O visitante passa pelo servidor do Next (Turnstile + limite + validação).
    A chave secreta do Supabase só existe no servidor. O painel usa a sessão do usuário, e a
    RLS confere o papel em `equipe` (com `ativo = true`).
12. **Falha fechada:** sem `TURNSTILE_SECRET_KEY`, `SEGREDO_ANONIMATO` ou `CRON_SECRET`
    configurados, a ação é recusada. Segredo comparado em tempo constante.
13. **Dizer não só com fundamento da lei** ([ADR 0003](docs/adr/0003-dizer-nao-so-com-fundamento-da-lei.md)).
    Recusa, retirada e exclusão são só da direção, com fundamento do art. 12 e explicação; a
    justificativa formal não se edita. Mural só mostra `publicacao = 'publicada'`. A escola
    não edita o texto de ninguém. Desistência do autor não pede justificativa.
14. **A lei é a fonte das regras de produto.** A tabela "Regra × artigo" fica no topo de
    [docs/spec.md](docs/spec.md). Mudar uma regra pede mudar a spec e a lei juntas.
15. **Protocolo nunca vai na URL** nem em log. O banco guarda só o hash.
16. **Limites por IP são altos de propósito:** a escola inteira sai por um IP só no Wi-Fi.
17. **Acessível para qualquer pessoa:** contraste AA, alvo de toque de 44 px, tudo pelo
    teclado, rótulo em todo campo, fonte de 16 px para cima, funcionando em celular simples
    e internet lenta. Testar em 375 px, 768 px e 1280 px; nenhuma tela rola para o lado.
18. **Custo zero, sempre.** Nenhum serviço pago, nenhum plano pago. Dependência nova com
    versão fixa e sem aviso de segurança.
19. **Pensar em quem herda:** toda configuração manual (conta, variável, rotina) vai para o
    manual técnico em `docs/` no mesmo commit.
20. **O projeto de lei acompanha o site.** Regra nova ou mudada no site vira alteração na lei
    no mesmo dia. **A versão-mestre é o Google Docs da turma** (o link fica na ficha do segundo
    cérebro, nunca no repositório): alteração entra lá em **modo Sugestão**, pelo navegador, para
    o grupo e o professor aceitarem. Depois, `docs/projeto-de-lei.md` recebe o texto aceito e uma
    linha no histórico. O gerador em `ferramentas/projeto-de-lei/` está aposentado (fez a v2).
    Cuidado ao inserir parágrafo logo depois de uma troca sugerida: o texto riscado fica depois
    do texto novo, então ir para o fim da linha (End) antes do Enter.
21. **`turma/` nunca vai para o git:** tem os nomes das autoras e as listas de assinatura
    (menores de idade). No repositório (público), só o texto da lei sem nomes.
22. **A mantenedora não tem conta no painel.** Até o fim do ano letivo de 2026, só a Mariane
    mexe na produção (convidada no GitHub e no Supabase; deploy pela rotina do GitHub). Ler o
    texto de uma manifestação real só para corrigir um erro; termo de sigilo em
    [docs/termo-de-sigilo.md](docs/termo-de-sigilo.md). Dado de teste nunca em produção fora do
    período de demonstração.
23. **Repositório público, licença MIT.** Nada de segredo, nome ou dado de ninguém no código.
    Única exceção, decidida pela Mariane em 23/10/2026: o primeiro nome dela nos documentos.
    Os commits saem com o endereço privado do GitHub (`git config` local), nunca com nome
    completo ou e-mail pessoal.

## Skills úteis aqui

| Skill | Quando usar |
|---|---|
| `refero-design` | Qualquer tela nova ou mudança visual (sem MCP; ver o `CLAUDE.md` global) |
| `domain-modeling` | Termo novo, conflito de vocabulário ou decisão difícil de desfazer (glossário e ADR) |
| `/grill-with-docs` | Antes de uma mudança grande de regra (só a Mariane dispara) |
| `tdd` | Regras de anonimato, limite, protocolo, voto e permissão |
| `auditoria-seguranca` | Antes da mostra (fatia 3.3) e a cada mudança de RLS ou rota |
| `code-review` | Ao fechar cada fatia |
| `diagnosing-bugs` | Quando algo quebrar ou ficar lento |
| `editar-imagem` | Logo, favicon, QR code, prints para a apresentação |
| `wizard` | Passo a passo de criar as contas do site (no e-mail próprio) e entregar à direção |
| `/setup-matt-pocock-skills` | Uma vez, se for usar `to-tickets` ou `to-spec` (só a Mariane dispara) |

## Armadilhas conhecidas

- Supabase Free pausa o projeto depois de 7 dias sem uso (férias escolares). A rotina diária
  da Vercel existe por isso; não remover.
- Vercel Hobby: uma vaga de desenvolvedor; commits de quem não é dono da conta são barrados.
  Por isso a publicação é pela rotina do GitHub (ADR 0004); não ligar a integração Git da Vercel.
- Não há Docker na máquina da Mariane: o Supabase local não roda. Testar contra o projeto
  real da escola, com cuidado para não gravar dado de teste em produção.
