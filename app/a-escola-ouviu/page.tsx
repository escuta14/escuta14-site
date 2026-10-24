// Página "A escola ouviu" (art. 14 da lei; spec, "Telas"): quantas manifestações chegaram no mês
// e no ano letivo, por tema e por categoria, o percentual respondido no prazo e as providências
// da direção. Só números somados: nenhum texto de manifestação, nada que identifique alguém.
// Demonstrações e exclusões ficam fora (o banco já tira). Lida a cada visita, como o mural.
import type { Metadata } from 'next';
import { Barras, NumeroGrande } from '@/components/Numeros';
import { NOME } from '@/components/PainelPartes';
import { mesDe } from '@/lib/datas';
import { lerEscolaOuviu } from '@/lib/escola-ouviu';
import { nomeDoMes, resumir } from '@/lib/numeros';
import { dataLegivel } from '@/lib/situacao';

export const metadata: Metadata = { title: 'A escola ouviu' };
export const dynamic = 'force-dynamic';

export default async function EscolaOuviu() {
  const dados = await lerEscolaOuviu();
  const agora = new Date();
  const ano = agora.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  });
  const mes = mesDe(agora);

  if (!dados) {
    return (
      <div className="wrap">
        <div className="numeros">
          <h1 className="h1">A escola ouviu</h1>
          <p className="erro vidro vazio">Esta página está fora do ar agora. Tente de novo daqui a pouco.</p>
        </div>
      </div>
    );
  }

  const doAno = resumir(dados.linhas);
  const doMes = resumir(dados.linhas, mes);
  return (
    <div className="wrap">
      <div className="numeros">
        <h1 className="h1">A escola ouviu</h1>
        <p className="lead">
          O que chegou ao ESCUTA 14 em {ano}, o que a escola respondeu no prazo de 30 dias e o que ela já fez. São só números: nenhuma manifestação aparece
          aqui.
        </p>

        <div className="numeros-grade">
          <NumeroGrande valor={String(doAno.total)} legenda={`manifestações em ${ano}`} />
          <NumeroGrande valor={String(doMes.total)} legenda={`em ${nomeDoMes(mes)}`} />
          <NumeroGrande
            valor={doAno.percentualNoPrazo === null ? '—' : `${doAno.percentualNoPrazo}%`}
            legenda={
              doAno.percentualNoPrazo === null
                ? 'respondidas no prazo (nenhum prazo terminou ainda)'
                : `respondidas no prazo (${doAno.noPrazo} de ${doAno.comDesfecho} com prazo encerrado ou já respondidas)`
            }
          />
        </div>

        <Barras titulo={`Por tema, em ${ano}`} contagem={doAno.porTema} />
        <Barras titulo={`Por categoria, em ${ano}`} contagem={doAno.porCategoria} />
        {doMes.total > 0 ? <Barras titulo={`Por tema, em ${nomeDoMes(mes)}`} contagem={doMes.porTema} /> : null}

        <section className="lista-mural">
          <h2 className="h2">O que a escola fez</h2>
          {dados.providencias.length === 0 ? (
            <p className="vidro vazio">A direção ainda não publicou nenhuma providência.</p>
          ) : (
            <ul className="lista-providencias">
              {dados.providencias.map((p) => (
                <li key={`${p.feita_em}-${p.titulo}`} className="vidro">
                  <p className="etiquetas">
                    <span className="tag cat">{NOME[p.tema]}</span>
                    <span className="tag">{dataLegivel(p.feita_em)}</span>
                  </p>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="nota">
          Conta como “no prazo” a manifestação respondida em até 30 dias (ou até a prorrogação, que a direção pode dar uma vez). As que ainda estão dentro do
          prazo não entram no percentual.
        </p>
      </div>
    </div>
  );
}
