// Molde das telas do painel: confere que a pessoa é da equipe (ativa) e mostra o menu do papel
// dela. Moderação e Equipe só aparecem para a direção. Não aparece em buscadores.
import type { Metadata } from 'next';
import Link from 'next/link';
import { sair } from '../entrar/acoes';
import { exigirEquipe } from '@/lib/equipe';
import { PAPEIS } from '@/lib/painel';

export const metadata: Metadata = { title: 'Painel', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function MoldePainel({ children }: { children: React.ReactNode }) {
  const membro = await exigirEquipe();
  return (
    <div className="wrap painel">
      <nav className="painel-menu vidro" aria-label="Painel">
        <span className="painel-quem">
          {membro.nome} · {PAPEIS[membro.papel]}
        </span>
        <Link href="/painel">Manifestações</Link>
        {membro.papel === 'direcao' ? <Link href="/painel/moderacao">Moderação</Link> : null}
        {membro.papel === 'direcao' ? <Link href="/painel/equipe">Equipe</Link> : null}
        <form action={sair}>
          <button className="link-botao" type="submit">
            Sair
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
