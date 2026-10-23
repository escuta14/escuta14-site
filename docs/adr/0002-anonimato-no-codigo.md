# O anonimato está no próprio código, não na boa vontade

A lei ESCUTA 14 promete que ninguém sabe quem escreveu (art. 6º). Guardar o IP ou o aparelho
junto da manifestação facilitaria combater spam e voto repetido, mas tornaria a promessa falsa
para quem tivesse acesso ao banco, inclusive a escola e a mantenedora. Decidimos que **nada que
identifique o aparelho é gravado junto de uma manifestação ou de um voto**:

- o antispam guarda só um HMAC do IP numa tabela separada, sem ligação com a manifestação, e
  apaga em 2 dias;
- o voto usa um código aleatório num cookie protegido, guardado só como HMAC;
- o protocolo é guardado só como hash; perdido, não se recupera;
- sem analytics, pixel ou script de rastreamento.

## Consequências

- Quem limpa o cookie consegue votar de novo; o limite por IP segura o abuso grosso. Os apoios
  são um termômetro, não uma votação oficial.
- Os limites por IP são altos (a escola inteira divide um IP no Wi-Fi).
- A escola não consegue procurar o autor de uma manifestação, nem querendo. Isso é o objetivo.
