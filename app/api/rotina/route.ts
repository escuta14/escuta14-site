// Rotina diária (Vercel Cron, ver vercel.json): todo dia, faz o banco ter uso para o Supabase
// gratuito não pausar (ele pausa depois de 7 dias parado, nas férias) e apaga as contagens do
// antispam com mais de 2 dias (ADR 0002). Só a Vercel chama: sem o CRON_SECRET certo, 401.
// Não remover (CLAUDE.md, "Armadilhas conhecidas"). Como conferir: docs/manual-tecnico.md.
import { rotinaAutorizada } from '@/lib/segredos';
import { prepararServidor } from '@/lib/servidor';

export async function GET(pedido: Request) {
  if (!rotinaAutorizada(pedido.headers.get('authorization'))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const s = prepararServidor();
  if (!s) return Response.json({ ok: false }, { status: 503 });
  const { data, error } = await s.banco.rpc('rotina_diaria');
  if (error) {
    console.error('rotina: falha', error.code);
    return Response.json({ ok: false }, { status: 503 });
  }
  console.log('rotina: ok, antispam apagado', data);
  return Response.json({ ok: true });
}
