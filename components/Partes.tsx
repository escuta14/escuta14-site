// Partes fixas que aparecem em várias telas: rodapé e aviso de emergência (design.md).
import Image from 'next/image';
import { Icone } from './Icone';

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="wrap rodape-in">
        <Image className="logo-escola" src="/logo-colegio.webp" alt="Colégio Estadual 14 de Dezembro" width={480} height={186} />
        <p>Colégio Estadual 14 de Dezembro · Peabiru (PR) · Canal criado pela lei ESCUTA 14, da turma do 3º ano B de 2026.</p>
        <nav className="links-rodape" aria-label="Mais páginas">
          <a className="link-rodape" href="/a-escola-ouviu">
            A escola ouviu
          </a>
          <a className="link-rodape" href="/sobre">
            Sobre
          </a>
          <a className="link-rodape" href="/painel/entrar">
            Área da equipe
          </a>
        </nav>
      </div>
    </footer>
  );
}

export function AvisoEmergencia() {
  return (
    <div className="emergencia vidro">
      <span className="caixa-icone" aria-hidden="true">
        <Icone nome="telefone" />
      </span>
      <p>
        <strong>É uma emergência?</strong> O ESCUTA 14 é anônimo e não consegue socorrer ninguém. Ligue 190 (Polícia Militar), 100 (Disque Direitos Humanos) ou 188 (CVV), ou procure o
        Conselho Tutelar.
      </p>
    </div>
  );
}
