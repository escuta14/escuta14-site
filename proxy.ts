// Proxy do Next (antigo "middleware"): roda antes das páginas do painel. Renova a sessão do
// Supabase e manda quem não entrou para /painel/entrar. A permissão de verdade é conferida no
// banco (RLS e funções do painel); isto aqui é só o caminho.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ABERTAS = ['/painel/entrar', '/painel/confirmar'];

export async function proxy(pedido: NextRequest) {
  let resposta = NextResponse.next({ request: pedido });
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return resposta;

  const supabase = createServerClient(url, chave, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => pedido.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => pedido.cookies.set(name, value));
        resposta = NextResponse.next({ request: pedido });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, { ...options, httpOnly: true }));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !ABERTAS.some((a) => pedido.nextUrl.pathname.startsWith(a))) {
    const destino = pedido.nextUrl.clone();
    destino.pathname = '/painel/entrar';
    destino.search = '';
    return NextResponse.redirect(destino);
  }
  return resposta;
}

export const config = { matcher: ['/painel/:caminho*'] };
