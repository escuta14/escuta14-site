// Página Sobre (spec, "Telas"): o que é o ESCUTA 14, como funciona o anonimato, o texto da lei e
// os créditos. Só promete o que o código cumpre (ADR 0002; regra 10 do CLAUDE.md): mudou o
// código, revise esta página. A lei vem de docs/projeto-de-lei.md, lido quando o site é montado.
// Créditos só com a turma, sem nomes: as autoras são menores de idade (regra 21).
// A seção "O colégio" (#colegio) é para onde leva o logo do colégio no Início e no rodapé.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { lerLei, type Trecho } from '@/lib/lei';

export const metadata: Metadata = { title: 'Sobre' };
export const dynamic = 'force-static';

const CODIGO_ABERTO = 'https://github.com/escuta14/escuta14-site';

// Contatos públicos do colégio (os mesmos que a escola divulga). Mudou algum? Trocar aqui.
const COLEGIO = {
  endereco: 'Rua Cassemiro Radominski, 1332 — Peabiru (PR) — CEP 87250-000',
  mapa: 'https://www.openstreetmap.org/search?query=Rua%20Cassemiro%20Radominski%2C%201332%2C%20Peabiru',
  email: 'pbuquatorzededezembro@seed.pr.gov.br',
  // Telefones passados pela Mariane em 24/10/2026.
  secretaria: { texto: '(44) 3531-2026', link: 'tel:+554435312026' },
  whatsapp: { texto: '(44) 99831-4884', link: 'https://wa.me/5544998314884' },
  instagram: 'https://www.instagram.com/colegioest.14de/',
  arroba: '@colegioest.14de',
};

const PROMESSAS = [
  'Para enviar, o site não pede nome, e-mail, telefone nem login.',
  'O site não grava o seu IP nem nada do seu aparelho junto com a manifestação ou com o voto.',
  'Para barrar spam, o site conta quantas vezes cada rede enviou na última hora. Guarda só uma versão embaralhada do IP, numa tabela separada das manifestações, e apaga em 2 dias.',
  'O protocolo é guardado embaralhado. Ninguém consegue ver qual é o seu nem recuperá-lo se você perder, nem a escola.',
  'O voto no mural usa um código sorteado e guardado num cookie do seu aparelho. O banco guarda só a versão embaralhada, para contar um voto por aparelho.',
  'Antes de enviar ou consultar, um teste da Cloudflare (Turnstile) confere se é uma pessoa. Ele não recebe o texto da manifestação.',
  'Não há propaganda, contador de visitas nem script de rastreamento.',
];

function Texto({ trechos }: { trechos: Trecho[] }) {
  return trechos.map((t, i) => (t.forte ? <strong key={i}>{t.texto}</strong> : <span key={i}>{t.texto}</span>));
}

export default function Sobre() {
  const lei = lerLei(readFileSync(path.join(process.cwd(), 'docs', 'projeto-de-lei.md'), 'utf8'));
  return (
    <div className="wrap">
      <div className="sobre">
        <h1 className="h1">Sobre o ESCUTA 14</h1>
        <p className="lead">
          O ESCUTA 14 é a ouvidoria anônima e gratuita do Colégio Estadual 14 de Dezembro, de Peabiru (PR). Estudantes, professores, funcionários e responsáveis
          mandam sugestões, reclamações, críticas, elogios, relatos e propostas. A escola responde em até 30 dias.
        </p>

        <section className="vidro bloco-sobre">
          <h2 className="h2">Como funciona</h2>
          <ul>
            <li>
              Quem lê as manifestações é a equipe da escola: a direção e as pessoas que ela escolher, como a equipe pedagógica. Elas assumem o compromisso de
              sigilo (art. 7º da lei).
            </li>
            <li>Nada aparece no mural sem a aprovação da direção, e ela só pode dizer não com um motivo previsto na lei (art. 12).</li>
            <li>
              A página <Link href="/a-escola-ouviu">A escola ouviu</Link> mostra quantas manifestações chegaram, quantas foram respondidas no prazo e o que a
              escola fez.
            </li>
          </ul>
        </section>

        <section className="vidro bloco-sobre">
          <h2 className="h2">Como o anonimato é garantido</h2>
          <ul>
            {PROMESSAS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>
            <strong>O cuidado que falta é seu:</strong> não escreva o seu nome nem detalhes que só você sabe. O texto é a única coisa que pode identificar quem
            escreveu.
          </p>
          <p>
            O código do site é aberto (art. 15 da lei): qualquer pessoa pode conferir que ele faz o que esta página diz, em{' '}
            <a href={CODIGO_ABERTO}>github.com/escuta14/escuta14-site</a>.
          </p>
        </section>

        <section className="vidro bloco-sobre">
          <h2 className="h2">A lei ESCUTA 14</h2>
          <p>O site nasceu junto com um projeto de lei escrito pela turma, que cria o canal e diz as regras dele. {lei.versao}</p>
          <details className="duvidas">
            <summary>Ler o projeto de lei completo</summary>
            <div className="texto-lei">
              {lei.blocos.map((b, i) =>
                b.tipo === 'titulo' ? (
                  <h3 key={i}>
                    <Texto trechos={b.trechos} />
                  </h3>
                ) : b.tipo === 'citacao' ? (
                  <blockquote key={i}>
                    <Texto trechos={b.trechos} />
                  </blockquote>
                ) : (
                  <p key={i}>
                    <Texto trechos={b.trechos} />
                  </p>
                ),
              )}
            </div>
          </details>
        </section>

        <section className="vidro bloco-sobre" id="colegio">
          <h2 className="h2">O colégio</h2>
          <p>Colégio Estadual 14 de Dezembro — Ensino Fundamental e Médio, da rede estadual do Paraná.</p>
          <ul>
            <li>
              Endereço: {COLEGIO.endereco} (<a href={COLEGIO.mapa}>ver no mapa</a>)
            </li>
            <li>
              Telefone da secretaria: <a href={COLEGIO.secretaria.link}>{COLEGIO.secretaria.texto}</a>
            </li>
            <li>
              WhatsApp: <a href={COLEGIO.whatsapp.link}>{COLEGIO.whatsapp.texto}</a>
            </li>
            <li>
              E-mail: <a href={`mailto:${COLEGIO.email}`}>{COLEGIO.email}</a>
            </li>
            <li>
              Instagram: <a href={COLEGIO.instagram}>{COLEGIO.arroba}</a>
            </li>
          </ul>
          <p>
            <strong>Esses canais não são anônimos:</strong> quem recebe vê o seu número, o seu e-mail ou o seu perfil. Para falar sem se identificar, use o{' '}
            <Link href="/enviar">ESCUTA 14</Link>.
          </p>
        </section>

        <section className="vidro bloco-sobre">
          <h2 className="h2">Quem fez</h2>
          <p>
            A turma do 3º ano B de 2026 do Colégio Estadual 14 de Dezembro, para a mostra interdisciplinar de 10 de novembro de 2026. O site é um presente para
            a escola e continua funcionando depois que a turma se formar.
          </p>
        </section>
      </div>
    </div>
  );
}
