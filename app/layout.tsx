// Molde de todas as páginas: fontes, luz de fundo, cabeçalho e rodapé. As fontes (licença
// aberta) entram pelo next/font: o Next guarda uma cópia no próprio site na hora de montar,
// então quem visita não faz pedido ao Google (ADR 0002).
import type { Metadata, Viewport } from 'next';
import { Manrope, Schibsted_Grotesk } from 'next/font/google';
import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Partes';
import './globals.css';

const schibsted = Schibsted_Grotesk({ subsets: ['latin'], weight: ['800'], variable: '--fonte-schibsted', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--fonte-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'ESCUTA 14', template: '%s · ESCUTA 14' },
  description: 'Ouvidoria anônima do Colégio Estadual 14 de Dezembro, de Peabiru (PR). Mande reclamação, ideia, elogio ou relato sem dizer seu nome.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#eef1f4', colorScheme: 'light' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${schibsted.variable} ${manrope.variable}`}>
      <body>
        <div className="pagina">
          <div className="luz" aria-hidden="true">
            <span className="l1" />
            <span className="l2" />
          </div>
          <Cabecalho />
          <main>{children}</main>
          <Rodape />
        </div>
      </body>
    </html>
  );
}
