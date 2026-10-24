// Página Enviar (spec, "Telas"): o formulário em 4 passos e o aviso de emergência. A chave
// pública do antispam vem do ambiente; sem ela, o formulário avisa que está fora do ar.
import type { Metadata } from 'next';
import { FormularioEnvio } from '@/components/FormularioEnvio';
import { AvisoEmergencia } from '@/components/Partes';

export const metadata: Metadata = { title: 'Enviar manifestação' };

export default function Enviar() {
  return (
    <div className="wrap">
      <div className="enviar">
        <h1 className="h1">Nova manifestação</h1>
        <FormularioEnvio chaveAntispam={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''} />
        <AvisoEmergencia />
      </div>
    </div>
  );
}
