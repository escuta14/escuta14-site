// Protocolo da manifestação (spec, regra 4): formato E14-XXXXX-XXXXX, sem caracteres que
// confundem (0/O, 1/I/L). Aparece uma vez só, para quem enviou. O banco guarda só o código
// embaralhado (HMAC com SEGREDO_ANONIMATO), então nem quem tem acesso ao banco descobre o
// protocolo, e protocolo perdido não se recupera. Nunca pôr o protocolo em URL nem em log.

export const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const TAMANHO = 10;

/**
 * Sorteia um protocolo novo com o gerador seguro do sistema. Bytes de 248 a 255 são
 * descartados para cada letra ter a mesma chance (256 não é múltiplo de 31).
 */
export function gerarProtocolo(sortear: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const limite = 256 - (256 % ALFABETO.length);
  let codigo = '';
  while (codigo.length < TAMANHO) {
    for (const byte of sortear(TAMANHO * 2)) {
      if (byte < limite && codigo.length < TAMANHO) codigo += ALFABETO[byte % ALFABETO.length];
    }
  }
  return `E14-${codigo.slice(0, 5)}-${codigo.slice(5)}`;
}

/**
 * Lê o que a pessoa digitou (com ou sem traço, maiúscula ou minúscula, com espaços) e devolve
 * o protocolo no formato certo, ou null se não for um protocolo possível.
 */
export function normalizarProtocolo(digitado: string): string | null {
  const limpo = digitado.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const corpo = limpo.startsWith('E14') ? limpo.slice(3) : limpo;
  if (corpo.length !== TAMANHO || [...corpo].some((c) => !ALFABETO.includes(c))) return null;
  return `E14-${corpo.slice(0, 5)}-${corpo.slice(5)}`;
}
