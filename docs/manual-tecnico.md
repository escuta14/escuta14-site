# Manual técnico do ESCUTA 14

Para quem vai cuidar do site depois da turma. Aqui fica toda configuração feita à mão: conta,
variável, rotina. Nenhuma senha, chave ou token aparece neste arquivo: ele diz **onde** cada
coisa está, nunca o valor. O repositório é público.

Começado em 23/10/2026. As seções de variáveis, rotinas e publicação entram junto com as fatias
que as criam (1.1 em diante).

## Contas do site

Todas as contas do ESCUTA 14 usam um **e-mail próprio do site**, criado pela Mariane em
23/10/2026. Não usam o e-mail pessoal de ninguém nem o da escola. Assim a escola recebe tudo
de uma vez na passagem. Decisão registrada na
[ADR 0004](adr/0004-deploy-por-github-actions.md#atualização-23102026-e-mail-próprio-do-site).

| Conta | Para quê | Entra como |
|---|---|---|
| E-mail do site | Dono de todas as outras contas | Senha + verificação em duas etapas |
| GitHub | Código (repositório público) e rotina que publica o site | E-mail do site; a mantenedora entra com a conta pessoal, como convidada |
| Vercel (Hobby) | Hospedagem e rotina diária | E-mail do site |
| Supabase (Free) | Banco de dados e login do painel | E-mail do site; a mantenedora como convidada |
| Cloudflare | Antispam (Turnstile) | E-mail do site |

**Endereço:** escuta14.ouvidoria@gmail.com (Gmail, criado em 23/10/2026). Um primeiro
endereço, ouvidoria.escuta14@gmail.com, foi trocado por este no mesmo dia e não é usado.

**GitHub:** conta `escuta14`, criada com esse e-mail. O código fica em
[escuta14/escuta14-site](https://github.com/escuta14/escuta14-site) (público). A mantenedora
entra com a conta pessoal, como colaboradora.

**Vercel:** conta criada em 23/10/2026 com o e-mail do site (plano Hobby, gratuito). A ligação
Git da Vercel fica **desligada**; quem publica é a rotina do GitHub (ADR 0004).

**Supabase:** projeto criado em 23/10/2026 com o e-mail do site. As chaves (URL, chave pública e
chave secreta) ficam só no `.env.local` da mantenedora e nos segredos da Vercel; nunca aqui, no
código ou em mensagem. O plano Free pausa o projeto depois de 7 dias sem uso. Até a rotina
diária existir (fatia 3.2), entrar no painel do Supabase pelo menos uma vez por semana ou
reativar o projeto se ele pausar (os dados não se perdem).

**A senha não fica aqui nem em nenhum lugar do repositório.** O repositório é público: quem lesse
a senha entraria no e-mail e, por ele, em todas as outras contas. Até a passagem, a senha fica só
com a mantenedora, num gerenciador de senhas ou no papel junto com os códigos de reserva. Na
passagem ela vai para a direção do mesmo jeito, no papel ou pessoalmente, nunca por mensagem.

### Cloudflare Turnstile (antispam)

O Turnstile é a verificação que impede robôs de mandarem manifestações em massa. Ele aparece no
último passo do envio e, na maioria das vezes, nem pede nada à pessoa: no máximo uma caixinha
para marcar, nunca um quebra-cabeça. O plano gratuito tem verificações ilimitadas e não precisa
pôr o site na Cloudflare.

**Criar a conta e o widget (uma vez):**

1. Entrar em [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) e criar a conta
   com o **e-mail do site**, com uma senha só dela. O plano gratuito não pede cartão. Ligar a
   verificação em duas etapas em "My Profile" → "Authentication".
2. No menu da esquerda, abrir **"Turnstile"** e clicar em **"Add widget"**. Não precisa pôr o
   site no ar antes nem colocar domínio na Cloudflare: se aparecer um convite para "adicionar um
   domínio" ou "conectar um site", pular (isso é para quem usa a Cloudflare como DNS). O hostname
   é só um texto; a Cloudflare não confere se o site já existe.
3. Preencher:
   - **Widget name:** `ESCUTA 14`.
   - **Hostname management:** `escuta14.vercel.app` (o endereço previsto do site na Vercel). Não
     pôr `localhost` aqui; no computador de quem programa valem as chaves de teste, abaixo.
   - **Widget mode:** **Managed** (o recomendado: só mostra a caixinha quando desconfia).
   - **Pre-clearance:** deixar **No**.
4. Clicar em **"Create"**. Aparecem duas chaves:
   - **Site Key:** é pública (vai na página). No código, vira `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
   - **Secret Key:** é **segredo**. No código, vira `TURNSTILE_SECRET_KEY`. Fica só no
     `.env.local` da mantenedora e nas variáveis de ambiente da Vercel. Nunca no repositório, no
     chat, em print ou em mensagem.
5. Até a fatia 1.1 criar o `.env.local`, guardar a Secret Key no gerenciador de senhas.

**Se o endereço do site mudar** (outro nome na Vercel, domínio próprio), abrir o widget em
"Turnstile" → "Settings", trocar o hostname e clicar em "Save". Sem isso, a verificação falha e,
pela regra de falha fechada, ninguém consegue enviar.

**Chaves de teste (para o computador de quem programa).** A Cloudflare publica chaves que
funcionam em qualquer endereço, inclusive `localhost`, e não protegem nada. Só valem fora da
produção:

| Para quê | Site Key | Secret Key |
|---|---|---|
| Sempre passa | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Sempre falha (testar o erro) | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AA` |

Fonte: [documentação do Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/),
conferida em 23/10/2026.

## Variáveis

Ficam no `.env.local` (computador de quem programa, fora do git) e nas variáveis de ambiente do
projeto `escuta14` na Vercel (Settings → Environment Variables, ambiente Production). Os nomes
estão no `.env.example`, sem valor.

| Variável | É segredo? | De onde vem |
|---|---|---|
| `SUPABASE_URL` | não | `https://evgtythzrrrrvppimxae.supabase.co` (projeto `escuta14`) |
| `SUPABASE_SECRET_KEY` | **sim** | Supabase → Project Settings → API Keys → Secret keys |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | não | Cloudflare → Turnstile → widget ESCUTA 14 → Site Key |
| `TURNSTILE_SECRET_KEY` | **sim** | Mesmo lugar → Secret Key |
| `SEGREDO_ANONIMATO` | **sim** | Gerado uma vez (32+ caracteres aleatórios). **Nunca trocar**: embaralha os protocolos; trocar faz os protocolos antigos deixarem de ser achados |
| `CRON_SECRET` | **sim** | Gerado uma vez (rotina diária, fatia 3.2) |
| `MOSTRA_INICIO`, `MOSTRA_FIM` | não | Período da mostra; o que chega nele nasce como demonstração |

Sem `SUPABASE_*`, `TURNSTILE_SECRET_KEY` ou `SEGREDO_ANONIMATO`, o envio mostra "fora do ar"
(falha fechada). Sem a Site Key, o formulário nem aparece.

## Banco

O SQL fica em `supabase/migrations/`, numerado. Cada arquivo roda **uma vez**, em ordem, no
Supabase → SQL Editor (colar e "Run"). Todas as tabelas têm RLS ligada e nenhuma policy para a
chave pública (ADR 0001).

| Arquivo | O que faz | Rodado em |
|---|---|---|
| `0001_envio.sql` | Tipos, `manifestacoes`, `limites` e a função `registrar_tentativa` | 24/10/2026 |

## Publicação

A rotina `.github/workflows/publicar.yml` publica na Vercel a cada merge na `main` (ADR 0004).
Precisa de três segredos no GitHub (repositório → Settings → Secrets and variables → Actions):
`VERCEL_TOKEN` (Vercel → Account Settings → Tokens), `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` (do
arquivo `.vercel/project.json`, criado por `npx vercel@65.2.0 link`). A rotina `verificar.yml`
roda lint, testes e build em cada PR.

### Assinatura dos commits

O repositório é público, e cada commit mostra o nome e o e-mail de quem fez. Por isso, nesta
pasta, o git usa o login do GitHub e o **endereço privado** que o GitHub dá a cada conta
(`número+login@users.noreply.github.com`), e não o nome completo nem o e-mail pessoal. Quem
herdar faz o mesmo, uma vez, dentro da pasta do projeto:

```bash
git config user.name "seu-login-do-github"
git config user.email "numero+seu-login@users.noreply.github.com"
```

O endereço exato aparece no GitHub em Settings → Emails, na opção "Keep my email addresses
private".

### Ao criar o e-mail

1. Serviço gratuito (por exemplo, Gmail). Custo zero é regra do projeto.
2. Senha forte, guardada só com a mantenedora. Nunca no repositório, no chat, em print ou em
   grupo de mensagem.
3. Ligar a verificação em duas etapas e **imprimir os códigos de reserva**. Eles destravam a
   conta se o celular sumir.
4. Telefone de recuperação: o da mantenedora até a passagem. Anotar que precisa ser trocado.

### Na passagem (última semana de aula de 2026)

Com alguém da direção ao lado:

1. Trocar a senha do e-mail do site por uma nova, que só a direção fica sabendo.
2. Trocar o telefone e o e-mail de recuperação para os da escola.
3. Gerar códigos de reserva novos e entregar impressos à direção. Os antigos deixam de valer.
4. Tirar o celular da mantenedora da verificação em duas etapas.
5. Remover a mantenedora como convidada no GitHub e no Supabase, se ela não continuar.
6. Trocar o token da Vercel guardado nos secrets do GitHub (`VERCEL_TOKEN`).
