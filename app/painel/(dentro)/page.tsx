// Lista do painel (spec, /painel). Abre na fila "Para responder" (sem resposta, do mais antigo ao
// mais novo); as abas mostram as respondidas ou todas. O passo a passo e os filtros ficam
// recolhidos, para a tela começar pelo que importa. Lê com a sessão de quem entrou (RLS).
import Link from 'next/link';
import { CartaoLista, Resultado, type Linha } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';
import { CATEGORIAS, SEGMENTOS, TEMAS } from '@/lib/opcoes';
import { abaDaLista, ABAS, PUBLICACOES } from '@/lib/painel';

type Filtros = {
  aba?: string;
  categoria?: string;
  tema?: string;
  segmento?: string;
  publicacao?: string;
  demonstracao?: string;
  de?: string;
  ate?: string;
  excluidas?: string;
  feito?: string;
  erro?: string;
};
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const PERMITIDOS: Record<'categoria' | 'tema' | 'segmento' | 'publicacao', string[]> = {
  categoria: CATEGORIAS.map(([v]) => v),
  tema: TEMAS.map(([v]) => v),
  segmento: SEGMENTOS.map(([v]) => v),
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
  const aba = abaDaLista(f.aba);
  const { banco, papel } = await exigirEquipe();

  let consulta = banco
    .from('manifestacoes')
    .select('id, categoria, tema, segmento, texto, andamento, publicacao, pedido_avaliacao, demonstracao, criada_em, resposta, excluida_em')
    .order('criada_em', { ascending: aba === 'responder' })
    .limit(300);
  if (aba === 'responder') consulta = consulta.is('resposta', null);
  if (aba === 'respondidas') consulta = consulta.not('resposta', 'is', null);
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
  const temFiltro = Object.keys(PERMITIDOS).some((c) => f[c as keyof Filtros]) || f.demonstracao || f.de || f.ate || f.excluidas;

  return (
    <div className="painel-corpo">
      <h1 className="h2">Manifestações</h1>
      <Resultado feito={f.feito} erro={f.erro} />

      <details className="duvidas vidro guia">
        <summary>Como usar o painel</summary>
        <ol>
          <li>Abra uma manifestação da aba “Para responder”. As mais antigas aparecem primeiro, porque o prazo delas acaba antes (30 dias).</li>
          <li>Leia com calma e escreva a resposta da escola. Quem enviou lê pelo protocolo, sem se identificar.</li>
          <li>Toque em “Salvar resposta”. O painel volta para esta lista com as que faltam.</li>
          <li>Se a pessoa pediu o mural, a direção aprova ou recusa em “Aprovações”, sempre com o motivo da lei.</li>
          <li>Precisa de ajuda da direção? Dentro da manifestação, em “Outras ações”, toque em “Pedir avaliação da direção”.</li>
        </ol>
      </details>

      <nav className="abas" aria-label="Quais manifestações mostrar">
        {Object.entries(ABAS).map(([valor, rotulo]) => (
          <Link key={valor} href={valor === 'responder' ? '/painel' : `/painel?aba=${valor}`} aria-current={aba === valor ? 'page' : undefined}>
            {rotulo}
            {aba === valor ? ` (${lista.length})` : ''}
          </Link>
        ))}
      </nav>

      <details className="duvidas vidro recolhido" open={!!temFiltro}>
        <summary>Filtrar por tipo, assunto, data…</summary>
        <form className="filtros" method="get">
          <input type="hidden" name="aba" value={aba} />
          <Seletor nome="categoria" rotulo="Tipo" opcoes={[...CATEGORIAS]} valor={f.categoria} />
          <Seletor nome="tema" rotulo="Assunto" opcoes={[...TEMAS]} valor={f.tema} />
          <Seletor nome="segmento" rotulo="Quem" opcoes={[...SEGMENTOS]} valor={f.segmento} />
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
      </details>

      {error ? <p className="erro">Não deu para carregar agora. Tente de novo.</p> : null}
      {lista.length === 0 && !error ? (
        <p className="vazio vidro">{aba === 'responder' && !temFiltro ? 'Nenhuma manifestação esperando resposta. Tudo em dia!' : 'Nenhuma manifestação aqui.'}</p>
      ) : null}
      <ul className="lista-painel">
        {lista.map((m) => (
          <CartaoLista key={m.id} m={m} />
        ))}
      </ul>
    </div>
  );
}
