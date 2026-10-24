// Página Acompanhar (spec, "Telas"): consulta pelo protocolo, com o aviso de emergência (art. 11).
// Título e cartão centralizados (pedido da Mariane, 24/10); o aviso de emergência ocupa a largura toda.
import type { Metadata } from 'next';
import { ConsultaProtocolo } from '@/components/ConsultaProtocolo';
import { AvisoEmergencia } from '@/components/Partes';

export const metadata: Metadata = { title: 'Acompanhar' };

export default function Acompanhar() {
  return (
    <div className="wrap">
      <div className="enviar acompanhar">
        <h1 className="h1">Acompanhar</h1>
        <section className="cartao-consulta vidro" aria-label="Consultar protocolo">
          <p className="lead">Digite o protocolo que apareceu quando você enviou. Ele começa com E14.</p>
          <ConsultaProtocolo chaveAntispam={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''} />
        </section>
        <AvisoEmergencia />
      </div>
    </div>
  );
}
