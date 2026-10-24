// "Outras ações" do detalhe da manifestação: o que se usa de vez em quando (andamento, assunto,
// pedir avaliação e, só para a direção, prorrogar, retirar do mural e excluir). Fica recolhido
// para a tela começar pela resposta. Cada ação diz numa frase o que acontece.
import { FUNDAMENTOS_EXCLUSAO, FUNDAMENTOS_MURAL } from '@/lib/painel';
import { TEMAS } from '@/lib/opcoes';
import { avaliacao, corrigirTema, excluir, moderar, mudarAndamento, prorrogar } from './acoes';

export function Fundamentos({ lista }: { lista: readonly (readonly [string, string])[] }) {
  return (
    <select name="fundamento" required defaultValue="" aria-label="Fundamento da lei">
      <option value="" disabled>
        Escolha o motivo da lei
      </option>
      {lista.map(([v, r]) => (
        <option key={v} value={v}>
          {r}
        </option>
      ))}
    </select>
  );
}

type Dados = { id: string; andamento: string; tema: string; publicacao: string; pedido_avaliacao: boolean; prorrogada_ate: string | null; resposta: string | null };

export function OutrasAcoes({ m, direcao }: { m: Dados; direcao: boolean }) {
  const oculto = <input type="hidden" name="id" value={m.id} />;
  return (
    <details className="duvidas vidro recolhido">
      <summary>Outras ações</summary>
      <div className="recolhido-corpo">
        {m.andamento === 'nova' ? (
          <form action={mudarAndamento} className="form-justificativa">
            {oculto}
            <input type="hidden" name="andamento" value="em_analise" />
            <p className="nota">Avise o resto da equipe que alguém já está vendo esta manifestação.</p>
            <button className="btn btn-sec" type="submit">Marcar como em análise</button>
          </form>
        ) : null}
        {m.andamento === 'respondida' ? (
          <form action={mudarAndamento} className="form-justificativa">
            {oculto}
            <input type="hidden" name="andamento" value="arquivada" />
            <p className="nota">Já foi respondida e não precisa de mais nada? Arquive.</p>
            <button className="btn btn-sec" type="submit">Arquivar</button>
          </form>
        ) : null}

        <form action={corrigirTema} className="linha-form">
          {oculto}
          <label className="filtro">
            O assunto está errado? Corrija:
            <select name="tema" defaultValue={m.tema}>
              {TEMAS.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-sec" type="submit">Corrigir assunto</button>
        </form>

        {!m.pedido_avaliacao ? (
          <form action={avaliacao} className="form-justificativa">
            {oculto}
            <input type="hidden" name="pedir" value="sim" />
            <p className="nota">Na dúvida, chame a direção. Ela vê o pedido em “Aprovações”.</p>
            <button className="btn btn-sec" type="submit">Pedir avaliação da direção</button>
          </form>
        ) : direcao ? (
          <form action={avaliacao} className="form-justificativa">
            {oculto}
            <input type="hidden" name="pedir" value="nao" />
            <p className="nota">O atendimento pediu a sua avaliação. Quando terminar, marque aqui.</p>
            <button className="btn btn-sec" type="submit">Marcar como avaliada</button>
          </form>
        ) : (
          <p className="nota">A direção já foi chamada para avaliar.</p>
        )}

        {direcao && !m.prorrogada_ate && !m.resposta ? (
          <form action={prorrogar} className="form-justificativa">
            {oculto}
            <p className="nota">Precisa de mais tempo? Prorrogue por mais 30 dias (uma vez só). Quem enviou lê o motivo.</p>
            <textarea name="explicacao" className="campo-texto curto" required minLength={10} maxLength={1000} placeholder="Por que precisa de mais tempo" aria-label="Por que precisa de mais tempo" />
            <button className="btn btn-sec" type="submit">Prorrogar o prazo</button>
          </form>
        ) : null}

        {direcao && m.publicacao === 'publicada' ? (
          <form action={moderar} className="form-justificativa">
            {oculto}
            <input type="hidden" name="acao" value="retirar" />
            <p className="nota">Tirar do mural. No lugar fica um aviso com o motivo da lei.</p>
            <Fundamentos lista={FUNDAMENTOS_MURAL} />
            <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique o caso (pelo menos 20 letras)" aria-label="Explicação" />
            <button className="btn btn-sec" type="submit">Retirar do mural</button>
          </form>
        ) : null}

        {direcao ? (
          <form action={excluir} className="form-justificativa">
            {oculto}
            <p className="nota">Excluir: só para propaganda, texto repetido ou só ofensas. Some do painel e das páginas, mas fica guardada.</p>
            <Fundamentos lista={FUNDAMENTOS_EXCLUSAO} />
            <textarea name="explicacao" className="campo-texto curto" required minLength={20} maxLength={1000} placeholder="Explique o caso (pelo menos 20 letras)" aria-label="Explicação" />
            <button className="btn btn-sec" type="submit">Excluir com justificativa</button>
          </form>
        ) : null}
      </div>
    </details>
  );
}
