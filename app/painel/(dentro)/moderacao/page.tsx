// Moderação (spec, /painel/moderacao): só a direção. Fila de pedidos de mural e de pedidos de
// avaliação. A decisão é tomada no detalhe de cada manifestação, sempre com fundamento da lei.
import { CartaoLista, type Linha } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';

export default async function Moderacao() {
  const { banco } = await exigirEquipe(true);
  const campos = 'id, categoria, tema, segmento, texto, andamento, publicacao, pedido_avaliacao, demonstracao, criada_em, resposta, excluida_em';
  const [{ data: mural }, { data: avaliacao }] = await Promise.all([
    banco.from('manifestacoes').select(campos).eq('publicacao', 'aguardando').is('excluida_em', null).order('criada_em'),
    banco.from('manifestacoes').select(campos).eq('pedido_avaliacao', true).is('excluida_em', null).order('criada_em'),
  ]);
  return (
    <div className="painel-corpo">
      <h1 className="h2">Moderação</h1>
      <h2 className="pergunta-painel">Pedidos de mural ({mural?.length ?? 0})</h2>
      {mural?.length ? (
        <ul className="lista-painel">
          {(mural as Linha[]).map((m) => (
            <CartaoLista key={m.id} m={m} />
          ))}
        </ul>
      ) : (
        <p className="vazio vidro">Nenhum pedido de mural esperando.</p>
      )}
      <h2 className="pergunta-painel">Pedidos de avaliação do atendimento ({avaliacao?.length ?? 0})</h2>
      {avaliacao?.length ? (
        <ul className="lista-painel">
          {(avaliacao as Linha[]).map((m) => (
            <CartaoLista key={m.id} m={m} />
          ))}
        </ul>
      ) : (
        <p className="vazio vidro">Nenhum pedido de avaliação.</p>
      )}
    </div>
  );
}
