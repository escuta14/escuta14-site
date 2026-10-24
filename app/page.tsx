// Página Início (spec, "Telas"): logo do colégio, a promessa em uma frase, o caminho para
// enviar e o passo a passo logo no começo (sugestão da turma). A arte da direita é decorativa.
import Image from 'next/image';
import Link from 'next/link';
import { Icone } from '@/components/Icone';
import { AvisoEmergencia } from '@/components/Partes';

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
          </div>
          <ol className="passos vidro" aria-label="Como funciona">
            <li>
              <span className="passo-num" aria-hidden="true">1</span>
              <div>
                <strong>Você escreve</strong>
                <span>Sem nome e sem login.</span>
              </div>
            </li>
            <li>
              <span className="passo-num" aria-hidden="true">2</span>
              <div>
                <strong>A escola responde</strong>
                <span>Em até 30 dias.</span>
              </div>
            </li>
            <li>
              <span className="passo-num" aria-hidden="true">3</span>
              <div>
                <strong>Você acompanha</strong>
                <span>Pelo código de protocolo.</span>
              </div>
            </li>
          </ol>
        </div>
        <div className="arte" aria-hidden="true">
          <div className="disco">
            <Image className="figuras" src="/logo-figuras.webp" alt="" width={420} height={449} priority />
          </div>
          <div className="cartao-solto vidro c1">
            <p className="rotulo-pequeno">Seu protocolo</p>
            <p className="codigo-solto">E14-7K3QM</p>
            <p>Resposta em até 30 dias</p>
          </div>
          <div className="cartao-solto vidro c2">
            <div className="linha">
              <span className="ok-redondo">
                <Icone nome="ok" />
              </span>
              <div>
                <p className="rotulo-pequeno">Nova resposta da escola</p>
                <p>A peça foi pedida. A troca sai na primeira semana de novembro.</p>
              </div>
            </div>
          </div>
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
