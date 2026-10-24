// Providências: só a direção. O que a escola fez a partir do que ouviu vai para a página pública
// "A escola ouviu" (art. 14), com tema e data. Nada se apaga: dá para tirar da página e pôr de volta.
import { NOME, Resultado } from '@/components/PainelPartes';
import { dataDoBanco } from '@/lib/datas';
import { exigirEquipe } from '@/lib/equipe';
import { TEMAS } from '@/lib/opcoes';
import { dataLegivel } from '@/lib/situacao';
import { mostrar, publicar } from './acoes';

export default async function Providencias({ searchParams }: { searchParams: Promise<{ feito?: string; erro?: string }> }) {
  const aviso = await searchParams;
  const { banco } = await exigirEquipe(true);
  const { data: lista } = await banco
    .from('providencias')
    .select('id, titulo, texto, tema, feita_em, oculta_em')
    .order('feita_em', { ascending: false })
    .limit(200);
  const hoje = dataDoBanco(new Date());

  return (
    <div className="painel-corpo">
      <h1 className="h2">Providências</h1>
      <Resultado feito={aviso.feito} erro={aviso.erro} />
      <p className="aviso-mural">
        Conte o que a escola fez a partir das manifestações. Aparece na página pública “A escola ouviu”, com o tema e a data. Não cite nomes nem detalhes que
        identifiquem quem escreveu.
      </p>

      <form className="vidro bloco-painel form-justificativa" action={publicar}>
        <h2 className="pergunta-painel">Publicar uma providência</h2>
        <label className="filtro">
          Título
          <input name="titulo" className="campo-painel" required minLength={3} maxLength={120} placeholder="Ex.: Bebedouro do pátio trocado" />
        </label>
        <label className="filtro">
          O que foi feito
          <textarea name="texto" className="campo-texto curto" required minLength={10} maxLength={2000} />
        </label>
        <label className="filtro">
          Tema
          <select name="tema" required defaultValue="">
            <option value="" disabled>
              Escolha
            </option>
            {TEMAS.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="filtro">
          Quando foi feito
          <input name="data" type="date" required max={hoje} defaultValue={hoje} />
        </label>
        <button className="btn btn-pri" type="submit">
          Publicar
        </button>
      </form>

      <ul className="lista-equipe">
        {(lista ?? []).map((p) => (
          <li key={p.id} className={`vidro bloco-painel ${p.oculta_em ? 'desativada' : ''}`}>
            <p>
              <strong>{p.titulo}</strong> · {NOME[p.tema]} · {dataLegivel(p.feita_em)}
              {p.oculta_em ? ' · fora da página' : ''}
            </p>
            <p className="nota">{p.texto}</p>
            <form action={mostrar}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="mostrar" value={p.oculta_em ? 'sim' : 'nao'} />
              <button className="btn btn-sec" type="submit">
                {p.oculta_em ? 'Pôr de volta na página' : 'Tirar da página'}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
