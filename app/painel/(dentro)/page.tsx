// Lista do painel (spec, /painel): filtros por categoria, tema, segmento, andamento, publicação,
// período e demonstração; contador de novas; destaque para prazo vencendo. A leitura usa a
// sessão de quem entrou e a RLS do banco.
import { CartaoLista, type Linha } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';
import { CATEGORIAS, SEGMENTOS, TEMAS } from '@/lib/opcoes';
import { ANDAMENTOS, PUBLICACOES } from '@/lib/painel';

type Filtros = { categoria?: string; tema?: string; segmento?: string; andamento?: string; publicacao?: string; demonstracao?: string; de?: string; ate?: string; excluidas?: string };
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const PERMITIDOS: Record<'categoria' | 'tema' | 'segmento' | 'andamento' | 'publicacao', string[]> = {
  categoria: CATEGORIAS.map(([v]) => v),
  tema: TEMAS.map(([v]) => v),
  segmento: SEGMENTOS.map(([v]) => v),
  andamento: Object.keys(ANDAMENTOS),
  publicacao: Object.keys(PUBLICACOES),
};

function Seletor({ nome, rotulo, opcoes, valor }: { nome: string; rotulo: string; opcoes: readonly (readonly [string, string])[]; valor?: string }) {
  return (
    <label className="filtro">
      {rotulo}
      <select name={nome} defaultValue={valor ?? ''}>
        <option value="">Todos</option>
        {opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function ListaPainel({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const { banco, papel } = await exigirEquipe();

  let consulta = banco
    .from('manifestacoes')
    .select('id, categoria, tema, segmento, texto, andamento, publicacao, pedido_avaliacao, demonstracao, criada_em, resposta, excluida_em')
    .order('criada_em', { ascending: false })
    .limit(300);
  // Cada filtro só aceita os valores da sua lista (o que vem na URL não é confiável).
  for (const campo of Object.keys(PERMITIDOS) as (keyof typeof PERMITIDOS)[]) {
    const valor = f[campo];
    if (valor && PERMITIDOS[campo].includes(valor)) consulta = consulta.eq(campo, valor);
  }
  if (f.demonstracao !== 'todas') consulta = consulta.eq('demonstracao', f.demonstracao === 'sim');
  if (f.de && DATA.test(f.de)) consulta = consulta.gte('criada_em', `${f.de}T00:00:00-03:00`);
  if (f.ate && DATA.test(f.ate)) consulta = consulta.lte('criada_em', `${f.ate}T23:59:59-03:00`);
  consulta = papel === 'direcao' && f.excluidas === 'sim' ? consulta.not('excluida_em', 'is', null) : consulta.is('excluida_em', null);

  const { data, error } = await consulta;
  const lista = (data ?? []) as Linha[];
  const novas = lista.filter((m) => m.andamento === 'nova').length;

  return (
    <div className="painel-corpo">
      <h1 className="h2">Manifestações</h1>
      <p className="lead">
        {novas === 1 ? '1 nova' : `${novas} novas`} nesta lista · {lista.length} no total
      </p>
      <form className="filtros vidro" method="get">
        <Seletor nome="categoria" rotulo="Tipo" opcoes={[...CATEGORIAS]} valor={f.categoria} />
        <Seletor nome="tema" rotulo="Assunto" opcoes={[...TEMAS]} valor={f.tema} />
        <Seletor nome="segmento" rotulo="Quem" opcoes={[...SEGMENTOS]} valor={f.segmento} />
        <Seletor nome="andamento" rotulo="Andamento" opcoes={Object.entries(ANDAMENTOS)} valor={f.andamento} />
        <Seletor nome="publicacao" rotulo="Mural" opcoes={Object.entries(PUBLICACOES)} valor={f.publicacao} />
        <label className="filtro">
          Demonstração
          <select name="demonstracao" defaultValue={f.demonstracao ?? 'nao'}>
            <option value="nao">Sem demonstração</option>
            <option value="sim">Só demonstração</option>
            <option value="todas">Todas</option>
          </select>
        </label>
        <label className="filtro">
          De
          <input type="date" name="de" defaultValue={f.de} />
        </label>
        <label className="filtro">
          Até
          <input type="date" name="ate" defaultValue={f.ate} />
        </label>
        {papel === 'direcao' ? (
          <label className="filtro">
            <input type="checkbox" name="excluidas" value="sim" defaultChecked={f.excluidas === 'sim'} /> Só excluídas
          </label>
        ) : null}
        <button className="btn btn-sec" type="submit">
          Filtrar
        </button>
      </form>
      {error ? <p className="erro">Não deu para carregar agora. Tente de novo.</p> : null}
      {lista.length === 0 && !error ? <p className="vazio vidro">Nenhuma manifestação com esses filtros.</p> : null}
      <ul className="lista-painel">
        {lista.map((m) => (
          <CartaoLista key={m.id} m={m} />
        ))}
      </ul>
    </div>
  );
}
