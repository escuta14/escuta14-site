# Publicação pela rotina do GitHub, não pela ligação direta da Vercel

As contas são da escola (e-mail da escola), mas quem programa é outra pessoa: a mantenedora
(Mariane até o fim de 2026, depois quem a direção nomear). O plano Hobby da Vercel tem uma vaga
de desenvolvedor só e barra a publicação de commits de quem não é dono da conta (confirmado em
repositório privado; em repositório público, não há garantia). Decidimos que **a ligação Git da
Vercel fica desligada, e uma rotina do GitHub Actions publica o site a cada mudança na `main`**,
usando um token da Vercel da escola guardado nos secrets do repositório.

## Consequências

- A mantenedora não precisa da senha da escola: entra como convidada no GitHub e no Supabase.
- A passagem é remover o convite e trocar o token, não trocar senhas.
- Não "consertar" ligando a integração Git da Vercel: os commits de quem não é dono passam a ser
  barrados e o site para de atualizar sem aviso.
- Se a escola um dia tiver plano pago, a integração direta volta a ser uma opção.

## Atualização (23/10/2026): e-mail próprio do site

As contas não usam mais o e-mail da escola, e sim um **e-mail próprio do ESCUTA 14**, criado
pela Mariane. A decisão desta ADR continua igual: a publicação segue pela rotina do GitHub. Muda
a passagem: como a Mariane criou o e-mail e sabe a senha, nesse dia ela entrega à direção a
senha, troca o telefone e o e-mail de recuperação para os da escola e passa os códigos de
reserva da verificação em duas etapas. Isso vem além de remover o convite e trocar o token. O
passo a passo está no [manual técnico](../manual-tecnico.md).
