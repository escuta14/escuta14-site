// Página Mural (spec, "Telas"): manifestações aprovadas pela direção, do ano letivo atual.
// É lida a cada visita (não fica pronta no build), porque os votos mudam o tempo todo.
import type { Metadata } from 'next';
import { Mural } from '@/components/Mural';
import { listarMural } from '@/lib/mural';

export const metadata: Metadata = { title: 'Mural' };
export const dynamic = 'force-dynamic';

export default async function PaginaMural() {
  const itens = await listarMural();
  return (
    <div className="wrap">
      <div className="mural">
        <h1 className="h1">Mural</h1>
        {itens === null ? <p className="erro vidro vazio">O mural está fora do ar agora. Tente de novo daqui a pouco.</p> : <Mural itens={itens} />}
      </div>
    </div>
  );
}
