// Peças dos números (design.md, "Números"): cartão com o número grande em degradê e a lista
// "rótulo · barra · quantidade". Usadas em "A escola ouviu" e em /painel/numeros.
import type { Contagem } from '@/lib/numeros';

export function NumeroGrande({ valor, legenda }: { valor: string; legenda: string }) {
  return (
    <div className="vidro numero-cartao">
      <p className="numero-grande">{valor}</p>
      <p className="numero-legenda">{legenda}</p>
    </div>
  );
}

/** Barras para comparar de olho; o número escrito ao lado é o que vale (leitor de tela lê a lista). */
export function Barras({ titulo, contagem }: { titulo: string; contagem: Contagem }) {
  const maior = Math.max(1, ...contagem.map(([, n]) => n));
  return (
    <section className="vidro bloco-numeros">
      <h2 className="pergunta-painel">{titulo}</h2>
      <ul className="barras">
        {contagem.map(([rotulo, n]) => (
          <li key={rotulo}>
            <span>{rotulo}</span>
            <span className="barra-trilho" aria-hidden="true">
              <span className="barra-cheia" style={{ width: `${(n / maior) * 100}%` }} />
            </span>
            <strong>{n}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
