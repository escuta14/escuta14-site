'use client';
// Mural (design.md, "Item do mural"): ordenar por mais apoiadas ou mais recentes, filtrar por
// categoria e tema, apoiar ou contestar (tocar de novo desfaz). Retirada vira aviso com o
// fundamento da lei. Os números são um termômetro, não uma votação oficial (spec).
import { useMemo, useState, useTransition } from 'react';
import { votar } from '@/app/mural/acoes';
import { CATEGORIAS, SEGMENTOS, TEMAS } from '@/lib/opcoes';
import type { ItemMural } from '@/lib/mural';
import { dataLegivel } from '@/lib/situacao';
import { Icone } from './Icone';

const NOME: Record<string, string> = Object.fromEntries([...CATEGORIAS, ...TEMAS, ...SEGMENTOS]);

function Item({ item }: { item: ItemMural }) {
  const [estado, setEstado] = useState({ apoios: item.apoios, contestacoes: item.contestacoes, meuVoto: item.meu_voto });
  const [erro, setErro] = useState('');
  const [ocupado, iniciar] = useTransition();

  if (!item.texto) {
    return (
      <article className="item-mural vidro retirada">
        <p className="etiquetas">Retirada · {dataLegivel(item.dia).slice(0, 5)}</p>
        <p>{item.aviso ?? 'Manifestação retirada pela direção com base no art. 12 da lei ESCUTA 14.'}</p>
      </article>
    );
  }

  function clicar(tipo: 'apoio' | 'contestacao') {
    setErro('');
    const novo = estado.meuVoto === tipo ? null : tipo;
    iniciar(async () => {
      const r = await votar(item.codigo, novo);
      if (r.ok) setEstado({ apoios: r.apoios, contestacoes: r.contestacoes, meuVoto: r.meuVoto });
      else setErro(r.erro);
    });
  }

  return (
    <article className="item-mural vidro">
      <p className="etiquetas">
        <span className="tag cat">{NOME[item.categoria]}</span>
        <span className="tag">{NOME[item.tema]}</span>
        <span className="tag">
          {NOME[item.segmento]} · {dataLegivel(item.dia).slice(0, 5)}
        </span>
      </p>
      <p className="texto-mural">{item.texto}</p>
      {item.resposta ? (
        <div className="resposta">
          <p className="resposta-titulo">
            <Icone nome="ok" /> Resposta da escola
          </p>
          <p>{item.resposta}</p>
        </div>
      ) : null}
      <div className="votos">
        {(['apoio', 'contestacao'] as const).map((tipo) => {
          const total = tipo === 'apoio' ? estado.apoios : estado.contestacoes;
          const rotulo = tipo === 'apoio' ? 'Apoio' : 'Contesto';
          return (
            <button key={tipo} type="button" className={`voto ${tipo}`} aria-pressed={estado.meuVoto === tipo} disabled={ocupado} onClick={() => clicar(tipo)} aria-label={`${rotulo}, ${total}`}>
              <Icone nome={tipo === 'apoio' ? 'cima' : 'baixo'} />
              <span>{rotulo}</span>
              <span className="numero">{total}</span>
            </button>
          );
        })}
      </div>
      {erro ? <p className="erro" role="alert">{erro}</p> : null}
    </article>
  );
}

export function Mural({ itens }: { itens: ItemMural[] }) {
  const [ordem, setOrdem] = useState<'apoiadas' | 'recentes'>('apoiadas');
  const [categoria, setCategoria] = useState('');
  const [tema, setTema] = useState('');

  const lista = useMemo(() => {
    const filtrados = itens.filter((i) => (!categoria || (i.texto && i.categoria === categoria)) && (!tema || (i.texto && i.tema === tema)));
    return filtrados.sort((a, b) => (ordem === 'apoiadas' ? (b.texto ? b.apoios : -1) - (a.texto ? a.apoios : -1) : b.dia.localeCompare(a.dia)));
  }, [itens, ordem, categoria, tema]);

  return (
    <>
      <div className="controles">
        <div className="grupo-pilula" role="group" aria-label="Ordenar">
          <button type="button" aria-pressed={ordem === 'apoiadas'} onClick={() => setOrdem('apoiadas')}>
            Mais apoiadas
          </button>
          <button type="button" aria-pressed={ordem === 'recentes'} onClick={() => setOrdem('recentes')}>
            Mais recentes
          </button>
        </div>
        <label className="filtro">
          Tipo
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todos</option>
            {CATEGORIAS.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="filtro">
          Assunto
          <select value={tema} onChange={(e) => setTema(e.target.value)}>
            <option value="">Todos</option>
            {TEMAS.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="nota">Só aparece aqui o que a direção aprovou. Os números são um termômetro, não uma votação oficial.</p>
      {lista.length === 0 ? (
        <p className="vazio vidro">{itens.length === 0 ? 'Ainda não há manifestações no mural. Elas aparecem aqui depois que a direção aprova.' : 'Nada com esse filtro.'}</p>
      ) : (
        <div className="lista-mural">
          {lista.map((i) => (
            <Item key={i.codigo} item={i} />
          ))}
        </div>
      )}
    </>
  );
}
