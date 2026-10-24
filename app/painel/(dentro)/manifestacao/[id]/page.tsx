// Detalhe da manifestação (spec, /painel/manifestacao/[id]). A tela começa pelo que se faz quase
// sempre: ler e responder. Salvar a resposta volta para a lista. Se a pessoa pediu o mural, a
// direção decide logo abaixo. O resto fica em "Outras ações" e o histórico, recolhido no fim.
// A escola nunca edita o texto de quem escreveu.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Etiqueta, NOME, Resultado, Situacao } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';
import { FUNDAMENTOS_MURAL } from '@/lib/painel';
import { dataLegivel } from '@/lib/situacao';
import { moderar, responder } from './acoes';
import { Fundamentos, OutrasAcoes } from './OutrasAcoes';

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });

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
      <Link className="voltar" href="/painel">
        ← Voltar para a lista
      </Link>
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
          Chegou em {dataHora(m.criada_em)} · responder até {dataLegivel(m.prorrogada_ate ?? m.prazo_em)}
          {m.prorrogada_ate ? ' (prazo prorrogado)' : ''}
        </p>
        <p className="texto-mural">{m.texto}</p>
      </article>

      {!excluida ? (
        <>
          <form className="vidro bloco-painel" action={responder}>
            {oculto}
            <label className="pergunta-painel" htmlFor="resposta">
              {m.resposta ? 'Resposta da escola (dá para corrigir)' : 'Escreva a resposta da escola'}
            </label>
            <p className="nota">Quem enviou lê pelo protocolo. Escreva como numa conversa, em poucas frases. Ao salvar, o painel volta para a lista.</p>
            {m.publicacao === 'publicada' ? <p className="aviso-mural">Esta manifestação está no mural: a resposta vai aparecer lá para todos.</p> : null}
            <textarea id="resposta" name="resposta" className="campo-texto" defaultValue={m.resposta ?? ''} maxLength={3000} required minLength={1} />
            <button className="btn btn-pri" type="submit">
              Salvar resposta
            </button>
          </form>

          {direcao && m.publicacao === 'aguardando' ? (
            <section className="vidro bloco-painel">
              <h2 className="pergunta-painel">A pessoa pediu para aparecer no mural</h2>
              <p className="nota">Aprove se não identifica ninguém e não ofende. Recusar só com um motivo da lei (art. 12); a manifestação continua na fila para ser respondida.</p>
              <form action={moderar}>
                {oculto}
                <input type="hidden" name="acao" value="aprovar" />
                <button className="btn btn-pri" type="submit">Aprovar para o mural</button>
              </form>
              <details className="duvidas">
                <summary>Recusar o mural</summary>
                <form action={moderar} className="form-justificativa">
                  {oculto}
                  <input type="hidden" name="acao" value="recusar" />
                  <Fundamentos lista={FUNDAMENTOS_MURAL} />
                  <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique para quem enviou (pelo menos 20 letras)" aria-label="Explicação para quem enviou" />
                  <button className="btn btn-sec" type="submit">Recusar com justificativa</button>
                </form>
              </details>
            </section>
          ) : null}

          <OutrasAcoes m={m} direcao={direcao} />
        </>
      ) : null}

      <details className="duvidas vidro recolhido">
        <summary>Histórico{justificativas?.length ? ' e justificativas' : ''}</summary>
        <div className="recolhido-corpo">
          {justificativas?.length ? (
            <div className="form-justificativa">
              {justificativas.map((j) => (
                <p key={j.criada_em} className="justificativa">
                  {j.texto_formal}
                </p>
              ))}
            </div>
          ) : null}
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
        </div>
      </details>
    </div>
  );
}
