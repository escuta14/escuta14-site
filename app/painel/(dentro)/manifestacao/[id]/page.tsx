// Detalhe da manifestação (spec, /painel/manifestacao/[id]): texto completo, situação, resposta,
// andamento, tema, avaliação da direção e, só para a direção, mural, prazo e exclusão. Embaixo,
// as justificativas formais e o histórico. A escola nunca edita o texto de quem escreveu.
import { notFound } from 'next/navigation';
import { Etiqueta, NOME, Resultado, Situacao } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';
import { TEMAS } from '@/lib/opcoes';
import { FUNDAMENTOS_EXCLUSAO, FUNDAMENTOS_MURAL } from '@/lib/painel';
import { dataLegivel } from '@/lib/situacao';
import { avaliacao, corrigirTema, excluir, moderar, mudarAndamento, prorrogar, responder } from './acoes';

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });

function Fundamentos({ lista }: { lista: readonly (readonly [string, string])[] }) {
  return (
    <select name="fundamento" required defaultValue="">
      <option value="" disabled>
        Escolha o fundamento da lei
      </option>
      {lista.map(([v, r]) => (
        <option key={v} value={v}>
          {r}
        </option>
      ))}
    </select>
  );
}

export default async function Detalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ feito?: string; erro?: string }> }) {
  const { id } = await params;
  const aviso = await searchParams;
  if (!ID.test(id)) notFound();
  const { banco, papel } = await exigirEquipe();
  const { data: m } = await banco.from('manifestacoes').select('*').eq('id', id).maybeSingle();
  if (!m) notFound();
  const [{ data: justificativas }, { data: historico }, { data: equipe }] = await Promise.all([
    banco.from('justificativas').select('texto_formal, criada_em').eq('manifestacao_id', id).order('criada_em'),
    banco.from('historico').select('acao, valor_anterior, valor_novo, usuario_id, criado_em').eq('manifestacao_id', id).order('criado_em', { ascending: false }),
    banco.from('equipe').select('usuario_id, nome'),
  ]);
  const nomes = Object.fromEntries((equipe ?? []).map((e) => [e.usuario_id, e.nome]));
  const direcao = papel === 'direcao';
  const excluida = !!m.excluida_em;
  const oculto = <input type="hidden" name="id" value={id} />;

  return (
    <div className="painel-corpo">
      <Resultado feito={aviso.feito} erro={aviso.erro} />
      <article className="vidro detalhe">
        <p className="etiquetas">
          <span className="tag cat">{NOME[m.categoria]}</span>
          <span className="tag">{NOME[m.tema]}</span>
          <span className="tag">{NOME[m.segmento]}</span>
          <Situacao andamento={m.andamento} publicacao={m.publicacao} />
          {m.demonstracao ? <Etiqueta tom="neutra">Demonstração</Etiqueta> : null}
          {excluida ? <Etiqueta tom="laranja">Excluída</Etiqueta> : null}
        </p>
        <p className="data-painel">
          Chegou em {dataHora(m.criada_em)} · prazo {dataLegivel(m.prorrogada_ate ?? m.prazo_em)}
          {m.prorrogada_ate ? ' (prorrogado)' : ''}
        </p>
        <p className="texto-mural">{m.texto}</p>
      </article>

      {!excluida ? (
        <>
          <form className="vidro bloco-painel" action={responder}>
            {oculto}
            <label className="pergunta-painel" htmlFor="resposta">
              Resposta da escola
            </label>
            <p className="nota">Uma resposta só. Dá para corrigir depois; a versão antiga fica no histórico. O autor lê pelo protocolo.</p>
            {m.publicacao === 'publicada' ? <p className="aviso-mural">Esta manifestação está no mural: a resposta vai aparecer lá para todos.</p> : null}
            <textarea id="resposta" name="resposta" className="campo-texto" defaultValue={m.resposta ?? ''} maxLength={3000} required minLength={1} />
            <button className="btn btn-pri" type="submit">
              Salvar resposta
            </button>
          </form>

          <div className="vidro bloco-painel acoes-painel">
            {m.andamento === 'nova' ? (
              <form action={mudarAndamento}>
                {oculto}
                <input type="hidden" name="andamento" value="em_analise" />
                <button className="btn btn-sec" type="submit">Marcar como em análise</button>
              </form>
            ) : null}
            {m.andamento === 'respondida' ? (
              <form action={mudarAndamento}>
                {oculto}
                <input type="hidden" name="andamento" value="arquivada" />
                <button className="btn btn-sec" type="submit">Arquivar</button>
              </form>
            ) : null}
            <form action={corrigirTema} className="linha-form">
              {oculto}
              <label className="filtro">
                Corrigir o assunto
                <select name="tema" defaultValue={m.tema}>
                  {TEMAS.map(([v, r]) => (
                    <option key={v} value={v}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn btn-sec" type="submit">Corrigir</button>
            </form>
            {!m.pedido_avaliacao ? (
              <form action={avaliacao}>
                {oculto}
                <input type="hidden" name="pedir" value="sim" />
                <button className="btn btn-sec" type="submit">Pedir avaliação da direção</button>
              </form>
            ) : direcao ? (
              <form action={avaliacao}>
                {oculto}
                <input type="hidden" name="pedir" value="nao" />
                <button className="btn btn-sec" type="submit">Marcar como avaliada</button>
              </form>
            ) : (
              <p className="nota">A direção já foi chamada para avaliar.</p>
            )}
          </div>

          {direcao ? (
            <div className="vidro bloco-painel">
              <h2 className="pergunta-painel">Só a direção</h2>
              {m.publicacao === 'aguardando' ? (
                <>
                  <form action={moderar}>
                    {oculto}
                    <input type="hidden" name="acao" value="aprovar" />
                    <button className="btn btn-pri" type="submit">Aprovar para o mural</button>
                  </form>
                  <form action={moderar} className="form-justificativa">
                    {oculto}
                    <input type="hidden" name="acao" value="recusar" />
                    <p className="nota">Recusar o mural (a manifestação continua na fila para ser respondida):</p>
                    <Fundamentos lista={FUNDAMENTOS_MURAL} />
                    <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique o caso para o autor (pelo menos 20 letras)" />
                    <button className="btn btn-sec" type="submit">Recusar com justificativa</button>
                  </form>
                </>
              ) : null}
              {m.publicacao === 'publicada' ? (
                <form action={moderar} className="form-justificativa">
                  {oculto}
                  <input type="hidden" name="acao" value="retirar" />
                  <p className="nota">Retirar do mural (fica um aviso com o fundamento no lugar):</p>
                  <Fundamentos lista={FUNDAMENTOS_MURAL} />
                  <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique o caso (pelo menos 20 letras)" />
                  <button className="btn btn-sec" type="submit">Retirar com justificativa</button>
                </form>
              ) : null}
              {!m.prorrogada_ate && !m.resposta ? (
                <form action={prorrogar} className="form-justificativa">
                  {oculto}
                  <p className="nota">Prorrogar o prazo por mais 30 dias (uma vez só; o autor lê a explicação):</p>
                  <textarea name="explicacao" className="campo-texto curto" required minLength={10} maxLength={1000} placeholder="Por que precisa de mais tempo" />
                  <button className="btn btn-sec" type="submit">Prorrogar</button>
                </form>
              ) : null}
              <details className="duvidas">
                <summary>Excluir esta manifestação</summary>
                <form action={excluir} className="form-justificativa">
                  {oculto}
                  <p className="nota">Some do painel e das páginas públicas, mas nunca é apagada do banco. O autor lê a justificativa.</p>
                  <Fundamentos lista={FUNDAMENTOS_EXCLUSAO} />
                  <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique o caso (pelo menos 20 letras)" />
                  <button className="btn btn-sec" type="submit">Excluir com justificativa</button>
                </form>
              </details>
            </div>
          ) : null}
        </>
      ) : null}

      {justificativas?.length ? (
        <section className="vidro bloco-painel">
          <h2 className="pergunta-painel">Justificativas formais</h2>
          {justificativas.map((j) => (
            <p key={j.criada_em} className="justificativa">
              {j.texto_formal}
            </p>
          ))}
        </section>
      ) : null}

      <section className="vidro bloco-painel">
        <h2 className="pergunta-painel">Histórico</h2>
        {historico?.length ? (
          <ul className="historico">
            {historico.map((h) => (
              <li key={h.criado_em + h.acao}>
                <strong>{dataHora(h.criado_em)}</strong> · {nomes[h.usuario_id] ?? 'Conta removida'} {h.acao}
                {h.valor_novo && h.acao !== 'respondeu' && h.acao !== 'corrigiu a resposta' ? ` (${h.valor_anterior ?? '—'} → ${h.valor_novo})` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="nota">Ninguém mexeu nesta manifestação ainda.</p>
        )}
      </section>
    </div>
  );
}
