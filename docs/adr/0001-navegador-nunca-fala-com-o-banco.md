# O navegador nunca fala com o banco

O comum com Supabase é o navegador ler e gravar direto nas tabelas, protegido só pela RLS. No
ESCUTA 14, o visitante é anônimo e a escola inteira sai por um IP só, então não há login que a
RLS possa conferir, e um formulário aberto direto ao banco não teria como checar antispam,
limite nem validação. Decidimos que **todas as tabelas têm RLS ligada e nenhuma policy para
`anon`**, e que tudo o que o visitante faz (enviar, consultar protocolo, desistir, votar, ler
o mural) passa pelo servidor do Next, que confere o Turnstile, o limite e a validação e só então
usa a chave secreta do Supabase. A equipe usa a própria sessão, e a RLS confere o papel em
`equipe`.

## Consequências

- A chave pública do Supabase, sozinha, recebe recusa em qualquer tabela. Isso é conferido de
  fora a cada publicação.
- A chave secreta só existe no servidor (variável de ambiente da Vercel), nunca no navegador.
- Não "simplificar" pondo o cliente do Supabase para gravar direto do navegador: isso abre o
  formulário para spam e tira as checagens de anonimato do servidor.
