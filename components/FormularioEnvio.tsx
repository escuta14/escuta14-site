'use client';
// Formulário de envio em 4 passos (design.md, "Envio em 4 passos"): tipo, assunto, quem você é
// e texto. As opções são rádios de verdade (funcionam pelo teclado). Se o envio falhar, o texto
// continua na tela (spec, "Casos de erro"). O protocolo só aparece aqui, uma vez.
import { useRef, useState, useTransition } from 'react';
import { enviarManifestacao, type ResultadoEnvio } from '@/app/enviar/acoes';
import { CATEGORIAS, SEGMENTOS, TEMAS } from '@/lib/opcoes';
import { contarCaracteres, TEXTO_MAXIMO, TEXTO_MINIMO } from '@/lib/regras';
import { Icone } from './Icone';
import { Turnstile } from './Turnstile';

const PASSOS = [
  { nome: 'Tipo', pergunta: 'O que você quer mandar?', campo: 'categoria', lista: CATEGORIAS, icones: true },
  { nome: 'Assunto', pergunta: 'É sobre o quê?', campo: 'tema', lista: TEMAS, icones: false },
  { nome: 'Você', pergunta: 'Você é…', campo: 'segmento', lista: SEGMENTOS, icones: false },
] as const;

type Escolhas = { categoria?: string; tema?: string; segmento?: string };

export function FormularioEnvio({ chaveAntispam }: { chaveAntispam: string }) {
  const [passo, setPasso] = useState(1);
  const [escolhas, setEscolhas] = useState<Escolhas>({});
  const [texto, setTexto] = useState('');
  const [publica, setPublica] = useState(false);
  const [token, setToken] = useState('');
  const [reiniciar, setReiniciar] = useState(0);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState<Extract<ResultadoEnvio, { ok: true }> | null>(null);
  const [avisoCopia, setAvisoCopia] = useState('');
  const [enviando, iniciar] = useTransition();
  const codigo = useRef<HTMLParagraphElement>(null);

  const tamanho = contarCaracteres(texto.trim());
  const atual = PASSOS[passo - 1];
  const podeContinuar = passo < 4 && !!atual && !!escolhas[atual.campo];

  function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setErro('');
    iniciar(async () => {
      const r = await enviarManifestacao({ ...escolhas, texto, publica, token });
      setReiniciar((n) => n + 1);
      if (r.ok) setSucesso(r);
      else setErro(r.erro);
    });
  }

  function copiar() {
    if (!sucesso) return;
    const selecionar = () => {
      if (!codigo.current) return;
      const faixa = document.createRange();
      faixa.selectNodeContents(codigo.current);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(faixa);
      setAvisoCopia('Código selecionado. Copie segurando o dedo em cima ou com Ctrl+C.');
    };
    if (navigator.clipboard) navigator.clipboard.writeText(sucesso.protocolo).then(() => setAvisoCopia('Código copiado.'), selecionar);
    else selecionar();
  }

  function outra() {
    setSucesso(null);
    setEscolhas({});
    setTexto('');
    setPublica(false);
    setPasso(1);
    setAvisoCopia('');
  }

  if (sucesso) {
    return (
      <div className="sucesso vidro" role="status">
        <div className="ok-grande" aria-hidden="true">
          <Icone nome="ok" />
        </div>
        <h2 className="h2">A escola recebeu</h2>
        <p className="codigo" ref={codigo}>
          {sucesso.protocolo}
        </p>
        <p style={{ margin: 0, maxWidth: '46ch', color: 'var(--color-tinta-2)' }}>
          Esse é o seu protocolo. A escola tem até <strong>{sucesso.prazo}</strong> para responder. Guarde o código: ninguém consegue recuperá-lo para você.
        </p>
        <div className="sucesso-acoes">
          <button className="btn btn-pri" type="button" onClick={copiar}>
            Copiar código
          </button>
          <button className="btn btn-sec" type="button" onClick={outra}>
            Enviar outra
          </button>
        </div>
        <p aria-live="polite" style={{ margin: 0, fontWeight: 700 }}>
          {avisoCopia}
        </p>
      </div>
    );
  }

  if (!chaveAntispam) {
    return <p className="erro vidro formulario">O ESCUTA 14 está fora do ar agora. Tente de novo mais tarde.</p>;
  }

  return (
    <form className="formulario vidro" onSubmit={enviar} noValidate>
      {/* Uma barrinha por etapa, com o nome logo embaixo dela: barra e nome sempre alinhados. */}
      <div className="progresso">
        <p className="passo-n" aria-live="polite">
          Passo {passo} de 4
        </p>
        <ol className="etapas" aria-label="Etapas do envio">
          {['Tipo', 'Assunto', 'Você', 'Texto'].map((n, i) => (
            <li key={n} aria-current={i + 1 === passo ? 'step' : undefined} className={i + 1 < passo ? 'feita' : undefined}>
              <span className="etapa-barra" aria-hidden="true" />
              {n}
            </li>
          ))}
        </ol>
      </div>

      {atual ? (
        <fieldset>
          <legend className="pergunta">{atual.pergunta}</legend>
          <div className={atual.icones ? 'opcoes' : 'opcoes sem-icone'}>
            {atual.lista.map(([valor, rotulo]) => {
              const id = `${atual.campo}-${valor}`;
              return (
                <span key={valor}>
                  <input
                    className="opcao-in"
                    type="radio"
                    id={id}
                    name={atual.campo}
                    value={valor}
                    checked={escolhas[atual.campo] === valor}
                    onChange={() => setEscolhas((e) => ({ ...e, [atual.campo]: valor }))}
                  />
                  <label className="opcao" htmlFor={id}>
                    {atual.icones ? <Icone nome={valor} /> : null}
                    {rotulo}
                  </label>
                </span>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div>
          <label className="pergunta" htmlFor="texto">
            Agora conta pra gente
          </label>
          <textarea
            id="texto"
            className="campo-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-describedby="contador"
            aria-invalid={tamanho > TEXTO_MAXIMO}
            maxLength={TEXTO_MAXIMO + 500}
          />
          <p id="contador" className={tamanho > TEXTO_MAXIMO ? 'contador passou' : 'contador'} aria-live="polite">
            {tamanho < TEXTO_MINIMO
              ? `Faltam ${TEXTO_MINIMO - tamanho} letras.`
              : tamanho > TEXTO_MAXIMO
                ? `Passou ${tamanho - TEXTO_MAXIMO} do limite de 3.000 caracteres.`
                : `${tamanho.toLocaleString('pt-BR')} de 3.000 caracteres.`}
          </p>
          <div className="marcar">
            <input type="checkbox" id="publica" checked={publica} onChange={(e) => setPublica(e.target.checked)} />
            <label htmlFor="publica">Quero que apareça no mural. A direção aprova antes, e eu posso desistir depois.</label>
          </div>
          <Turnstile chave={chaveAntispam} aoMudar={setToken} reiniciar={reiniciar} />
          {erro ? (
            <p className="erro" role="alert">
              {erro}
            </p>
          ) : null}
        </div>
      )}

      <div className="barra">
        <button className="btn btn-sec" type="button" onClick={() => setPasso((p) => p - 1)} style={{ visibility: passo === 1 ? 'hidden' : 'visible' }}>
          Voltar
        </button>
        {passo < 4 ? (
          <button className="btn btn-pri" type="button" disabled={!podeContinuar} onClick={() => setPasso((p) => p + 1)}>
            Continuar
          </button>
        ) : (
          <button className="btn btn-pri" type="submit" disabled={enviando || !token || tamanho < TEXTO_MINIMO || tamanho > TEXTO_MAXIMO}>
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        )}
      </div>
    </form>
  );
}
