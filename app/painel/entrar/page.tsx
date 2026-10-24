// Entrada do painel da equipe (spec, /painel/entrar). Não aparece em buscadores.
import type { Metadata } from 'next';
import { FormularioEntrar } from './Formulario';

export const metadata: Metadata = { title: 'Painel da escola', robots: { index: false, follow: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  return (
    <div className="wrap">
      <div className="enviar">
        <h1 className="h1">Painel da escola</h1>
        <p className="lead">Só para a direção e a equipe de atendimento. Quem quer mandar uma manifestação não precisa de conta.</p>
        <FormularioEntrar motivo={motivo} />
      </div>
    </div>
  );
}
