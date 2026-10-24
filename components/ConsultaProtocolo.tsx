'use client';
// Consulta pelo protocolo (fatia 1.3): no topo do Início e na página Acompanhar. O antispam só
// carrega quando a pessoa toca no campo, para quem só está olhando a página não falar com a
// Cloudflare. O protocolo fica só na memória da página: nunca na URL nem guardado no aparelho.
import { useState, useTransition } from 'react';
import { consultarProtocolo, desistir, type ResultadoConsulta } from '@/app/acompanhar/acoes';
import type { Situacao } from '@/lib/situacao';
import { Turnstile } from './Turnstile';

export function ConsultaProtocolo({ chaveAntispam }: { chaveAntispam: string }) {
  const [protocolo, setProtocolo] = useState('');
  const [ativo, setAtivo] = useState(false);
  const [token, setToken] = useState('');
  const [reiniciar, setReiniciar] = useState(0);
  const [erro, setErro] = useState('');
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, iniciar] = useTransition();

  function chamar(acao: typeof consultarProtocolo) {
    setErro('');
    iniciar(async () => {
      const r: ResultadoConsulta = await acao({ protocolo, token });
      setReiniciar((n) => n + 1);
      setConfirmar(false);
      if (r.ok) setSituacao(r.situacao);
      else setErro(r.erro);
    });
  }

  function outro() {
    setSituacao(null);
    setProtocolo('');
    setErro('');
  }

  if (!chaveAntispam) return <p className="erro">A consulta está fora do ar agora. Tente de novo mais tarde.</p>;

  const antispam = ativo ? <Turnstile chave={chaveAntispam} aoMudar={setToken} reiniciar={reiniciar} /> : null;

  if (situacao) {
    const textoDesistir = situacao.desistencia === 'cancelar' ? 'Cancelar o pedido de mural' : 'Tirar do mural';
    return (
      <div className="consulta-resultado" role="status">
        <p className="rotulo-pequeno">Situação</p>
        <p className="consulta-andamento">{situacao.andamento}</p>
        {situacao.prazo ? <p>{situacao.prazo}</p> : null}
        {situacao.resposta ? (
          <div className="resposta">
            <p className="resposta-titulo">Resposta da escola</p>
            <p>{situacao.resposta}</p>
          </div>
        ) : null}
        {situacao.mural ? <p>{situacao.mural}</p> : null}
        {situacao.justificativa ? <p className="justificativa">{situacao.justificativa}</p> : null}
        {situacao.desistencia ? (
          confirmar ? (
            <div className="confirmar">
              <p>Tem certeza? Depois disso a manifestação não volta para o mural.</p>
              {antispam}
              <div className="acoes-linha">
                <button className="btn btn-pri" type="button" disabled={ocupado || !token} onClick={() => chamar(desistir)}>
                  {ocupado ? 'Aguarde…' : `Sim, ${textoDesistir.toLowerCase()}`}
                </button>
                <button className="btn btn-sec" type="button" onClick={() => setConfirmar(false)}>
                  Não
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-sec" type="button" onClick={() => setConfirmar(true)}>
              {textoDesistir}
            </button>
          )
        ) : null}
        {erro ? <p className="erro" role="alert">{erro}</p> : null}
        <button className="link-botao" type="button" onClick={outro}>
          Consultar outro protocolo
        </button>
      </div>
    );
  }

  return (
    <form
      className="consulta-form"
      onSubmit={(e) => {
        e.preventDefault();
        chamar(consultarProtocolo);
      }}
    >
      <label htmlFor="protocolo">Seu protocolo</label>
      <input
        id="protocolo"
        className="campo"
        value={protocolo}
        onChange={(e) => {
          setProtocolo(e.target.value);
          setAtivo(true); // também ao colar ou preencher sozinho, sem tocar no campo
        }}
        onFocus={() => setAtivo(true)}
        placeholder="E14-XXXXX-XXXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={24}
      />
      {antispam}
      {erro ? <p className="erro" role="alert">{erro}</p> : null}
      <button className="btn btn-pri" type="submit" disabled={ocupado || !token || protocolo.replace(/[^0-9a-z]/gi, '').length < 10}>
        {ocupado ? 'Procurando…' : 'Ver a resposta'}
      </button>
    </form>
  );
}
