// Sessão do painel (Supabase Auth) no servidor. Usa a chave PÚBLICA do Supabase com a sessão de
// quem entrou: a RLS do banco confere o papel em `equipe` (ADR 0001). O cookie da sessão é
// httpOnly: o navegador guarda, mas nenhum script da página consegue ler.
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { exigir } from './segredos';

export const OPCOES_COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

export async function clienteDaSessao() {
  const pote = await cookies();
  return createServerClient(exigir('SUPABASE_URL'), exigir('SUPABASE_PUBLISHABLE_KEY'), {
    cookieOptions: OPCOES_COOKIE,
    cookies: {
      getAll: () => pote.getAll(),
      setAll: (lista) => {
        // Em página (não em ação), o Next não deixa gravar cookie; o proxy.ts renova a sessão.
        try {
          lista.forEach(({ name, value, options }) => pote.set(name, value, { ...options, ...OPCOES_COOKIE }));
        } catch {}
      },
    },
  });
}
