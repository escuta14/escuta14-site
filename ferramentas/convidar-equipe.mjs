// Convida uma pessoa para o painel pela linha de comando, com a chave secreta do .env.local.
// Serve para dois casos (manual técnico, "Painel"):
//   1. a primeira conta da direção, quando ainda não há ninguém no painel para convidar;
//   2. a escola ficou sem direção ativa no painel (todos saíram sem passar a vez).
// Uso: node --env-file=.env.local ferramentas/convidar-equipe.mjs "Nome" email@escola direcao|atendimento
// Se o e-mail já tiver conta, reativa e põe o papel indicado. Não mostra chave nenhuma.
import { createClient } from '@supabase/supabase-js';

const [nome, email, papel] = process.argv.slice(2);
if (!nome || !email?.includes('@') || !['direcao', 'atendimento'].includes(papel)) {
  console.log('Uso: node --env-file=.env.local ferramentas/convidar-equipe.mjs "Nome" email direcao|atendimento');
  process.exit(1);
}
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const { data, error } = await db.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), { redirectTo: 'https://escuta14.vercel.app/painel/confirmar' });
let id = data?.user?.id;
if (error) {
  if (error.code !== 'email_exists') {
    console.log('Não deu para convidar:', error.code);
    process.exit(1);
  }
  const { data: lista } = await db.auth.admin.listUsers({ perPage: 1000 });
  id = lista.users.find((u) => u.email === email.trim().toLowerCase())?.id;
  console.log('Esse e-mail já tinha conta: reativando.');
}
const { error: e2 } = await db.from('equipe').upsert({ usuario_id: id, nome, papel, ativo: true });
console.log(e2 ? 'Falhou ao gravar na equipe: ' + e2.code : `Pronto: ${papel}${error ? '' : ' (convite enviado por e-mail)'}.`);
