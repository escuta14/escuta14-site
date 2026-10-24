// Números do ano para a equipe (spec, /painel/numeros): os mesmos de "A escola ouviu", mais o
// segmento e o total de cada mês. Lê com a sessão de quem entrou: a RLS só deixa a equipe ativa.
import { Barras, NumeroGrande } from '@/components/Numeros';
import { exigirEquipe } from '@/lib/equipe';
import { porMes, resumir, type LinhaNumeros } from '@/lib/numeros';

export default async function Numeros() {
  const { banco } = await exigirEquipe();
  const { data, error } = await banco.rpc('numeros_do_ano');
  if (error) return <p className="erro vidro aviso-painel">Não deu para carregar os números agora. Tente de novo.</p>;
  const linhas = (data ?? []) as LinhaNumeros[];
  const r = resumir(linhas);

  return (
    <div className="painel-corpo">
      <h1 className="h2">Números do ano</h1>
      <p className="aviso-mural">Sem as demonstrações e as excluídas. São os mesmos números da página pública “A escola ouviu”, que não mostra o segmento.</p>
      <div className="numeros-grade">
        <NumeroGrande valor={String(r.total)} legenda="manifestações no ano" />
        <NumeroGrande
          valor={r.percentualNoPrazo === null ? '—' : `${r.percentualNoPrazo}%`}
          legenda={`respondidas no prazo (${r.noPrazo} de ${r.comDesfecho})`}
        />
        <NumeroGrande valor={String(r.comDesfecho - r.noPrazo)} legenda="fora do prazo (respondidas atrasadas ou vencidas sem resposta)" />
      </div>
      <Barras titulo="Por mês" contagem={porMes(linhas)} />
      <Barras titulo="Por tema" contagem={r.porTema} />
      <Barras titulo="Por categoria" contagem={r.porCategoria} />
      <Barras titulo="Por segmento" contagem={r.porSegmento} />
    </div>
  );
}
