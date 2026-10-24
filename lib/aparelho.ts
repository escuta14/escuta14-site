// Cookie do "aparelho" para o voto (spec, regra 23): 32 bytes aleatórios em base64url. Só serve
// para impedir dois votos do mesmo aparelho; o banco recebe a versão embaralhada.
export const COOKIE_APARELHO = 'e14_aparelho';

export function cookieValido(valor: string | undefined): valor is string {
  return typeof valor === 'string' && /^[A-Za-z0-9_-]{43}$/.test(valor);
}
