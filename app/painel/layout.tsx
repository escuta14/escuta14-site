// Molde de todas as telas do painel (entrar, confirmar, definir senha e as de dentro): só carrega
// os estilos do painel. Quem confere o login é o molde de (dentro) e o proxy.ts.
import './painel.css';

export default function MoldeDoPainel({ children }: { children: React.ReactNode }) {
  return children;
}
