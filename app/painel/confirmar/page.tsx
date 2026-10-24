// Destino do link que chega por e-mail (convite para a equipe ou troca de senha). Endereço
// liberado em Supabase → Authentication → URL Configuration (manual técnico, "Painel").
import type { Metadata } from 'next';
import { Confirmar } from './Confirmar';

export const metadata: Metadata = { title: 'Confirmar acesso', robots: { index: false, follow: false } };

export default function PaginaConfirmar() {
  return (
    <div className="wrap">
      <div className="enviar">
        <h1 className="h1">Painel da escola</h1>
        <Confirmar />
      </div>
    </div>
  );
}
