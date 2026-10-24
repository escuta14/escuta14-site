'use client';
// Cabeçalho: logo + "ESCUTA 14" e o menu. A tela atual fica marcada (aria-current). Abaixo de
// 480 px, "Início" e "Acompanhar" saem do menu (o logo leva ao início, onde também se consulta).
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', rotulo: 'Início', soLargo: true },
  { href: '/enviar', rotulo: 'Enviar', soLargo: false },
  { href: '/acompanhar', rotulo: 'Acompanhar', soLargo: true },
  { href: '/mural', rotulo: 'Mural', soLargo: false },
];

export function Cabecalho() {
  const caminho = usePathname();
  return (
    <header className="topo">
      <div className="wrap topo-in">
        <Link className="marca" href="/">
          <span className="icone-app">
            <Image src="/logo-figuras.webp" alt="" width={32} height={34} priority />
          </span>
          <span>ESCUTA 14</span>
        </Link>
        <nav className="menu" aria-label="Menu">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={l.soLargo ? 'so-largo' : undefined} aria-current={caminho === l.href ? 'page' : undefined}>
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
