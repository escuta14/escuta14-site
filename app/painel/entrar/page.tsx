// Entrada do painel da equipe (spec, /painel/entrar). Não aparece em buscadores.
// Ao lado do título, o mesmo disco animado do logo do Início (design.md, "Movimento"), para a
// tela não ficar vazia. É enfeite: o leitor de tela pula, e some em telas estreitas.
import type { Metadata } from 'next';
import Image from 'next/image';
import { FormularioEntrar } from './Formulario';

export const metadata: Metadata = { title: 'Painel da escola', robots: { index: false, follow: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  return (
    <div className="wrap">
      <div className="enviar">
        <div className="entrar-topo">
          <div className="entrar-texto">
            <h1 className="h1">Painel da escola</h1>
            <p className="lead">Só para a direção e a equipe de atendimento. Quem quer mandar uma manifestação não precisa de conta.</p>
          </div>
          <div className="disco disco-pequeno" aria-hidden="true">
            <Image className="figuras" src="/logo-figuras.webp" alt="" width={420} height={449} />
          </div>
        </div>
        <FormularioEntrar motivo={motivo} />
      </div>
    </div>
  );
}
