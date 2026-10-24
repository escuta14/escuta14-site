// Página Início (spec, "Telas"): logo do colégio, a promessa em uma frase, o caminho para
// enviar, o passo a passo logo no começo (sugestão da turma), com as dúvidas que abrem, e a
// consulta pelo protocolo de verdade no lugar do exemplo (pedido da Mariane, 24/10).
import Image from 'next/image';
import Link from 'next/link';
import { ConsultaProtocolo } from '@/components/ConsultaProtocolo';
import { Duvidas } from '@/components/Duvidas';
import { AvisoEmergencia } from '@/components/Partes';

const PASSOS = [
  ['Você escreve', 'Sem nome e sem login.'],
  ['A escola responde', 'Em até 30 dias.'],
  ['Você acompanha', 'Pelo código de protocolo.'],
] as const;

const SEGMENTOS = [
  ['Estudantes', '#2858C0'],
  ['Professores', '#707070'],
  ['Funcionários', '#F04008'],
  ['Responsáveis', '#E8E828'],
] as const;

export default function Inicio() {
  return (
    <>
      <section className="wrap hero">
        <div className="hero-texto">
          <Image className="logo-escola" src="/logo-colegio.webp" alt="Colégio Estadual 14 de Dezembro" width={480} height={186} priority />
          <h1 className="h1">Sua voz chega na direção</h1>
          <p className="lead">Reclamação, ideia, elogio ou relato: a direção e a equipe de atendimento leem tudo.</p>
          <div className="acoes">
            <Link className="btn btn-pri" href="/enviar">
              Enviar manifestação
            </Link>
            <Link className="btn btn-sec" href="/mural">
              Ver o mural
            </Link>
          </div>
          <Link className="link-forte" href="/a-escola-ouviu">
            A escola ouviu: o que chegou e o que a escola já fez
          </Link>
          <div className="passos-caixa vidro">
            <ol className="passos" aria-label="Como funciona">
              {PASSOS.map(([titulo, detalhe], i) => (
                <li key={titulo}>
                  <span className="passo-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{titulo}</strong>
                    <span>{detalhe}</span>
                  </div>
                </li>
              ))}
            </ol>
            <Duvidas />
          </div>
        </div>
        <div className="arte">
          <div className="disco" aria-hidden="true">
            <Image className="figuras" src="/logo-figuras.webp" alt="" width={420} height={449} priority />
          </div>
          <section className="cartao-consulta vidro" aria-labelledby="titulo-consulta">
            <h2 id="titulo-consulta" className="consulta-titulo">
              Já mandou? Veja a resposta
            </h2>
            <ConsultaProtocolo chaveAntispam={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''} />
          </section>
        </div>
      </section>

      <section className="wrap secao">
        <h2 className="h2">Todo mundo da escola pode falar</h2>
        <ul className="segmentos">
          {SEGMENTOS.map(([nome, cor]) => (
            <li key={nome} className="vidro">
              <span className="bola" style={{ background: cor }} />
              {nome}
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap secao">
        <AvisoEmergencia />
      </section>
    </>
  );
}
