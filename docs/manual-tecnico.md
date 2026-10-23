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

**Supabase:** projeto criado em 23/10/2026 com o e-mail do site. As chaves (URL, chave pública e
chave secreta) ficam só no `.env.local` da mantenedora e nos segredos da Vercel; nunca aqui, no
código ou em mensagem. O plano Free pausa o projeto depois de 7 dias sem uso. Até a rotina
diária existir (fatia 3.2), entrar no painel do Supabase pelo menos uma vez por semana ou
reativar o projeto se ele pausar (os dados não se perdem).

**A senha não fica aqui nem em nenhum lugar do repositório.** O repositório é público: quem lesse
a senha entraria no e-mail e, por ele, em todas as outras contas. Até a passagem, a senha fica só
com a mantenedora, num gerenciador de senhas ou no papel junto com os códigos de reserva. Na
passagem ela vai para a direção do mesmo jeito, no papel ou pessoalmente, nunca por mensagem.

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
