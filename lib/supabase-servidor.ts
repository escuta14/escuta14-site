// Conexão do servidor com o banco (ADR 0001: o navegador nunca fala com o banco). Usa a chave
// secreta do Supabase, que só existe no servidor. 'server-only' faz o build falhar se alguém
// importar este arquivo numa parte que roda no navegador.
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { exigir } from './segredos';

export function bancoDoServidor() {
  return createClient(exigir('SUPABASE_URL'), exigir('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
