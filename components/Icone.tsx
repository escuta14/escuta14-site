// Ícones de traço (24×24), desenhados no próprio código: nada é baixado de outro site.
const CAMINHOS: Record<string, string[]> = {
  sugestao: ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'],
  reclamacao: ['M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13'],
  critica: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'M12 7v4', 'M12 14h.01'],
  elogio: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  relato: ['M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z', 'M14 3v6h6', 'M8 13h8', 'M8 17h6'],
  proposta: ['M4 22V4', 'M4 4h12l-2 4 2 4H4'],
  outra: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  ok: ['M20 6 9 17l-5-5'],
  cima: ['m6 15 6-6 6 6'],
  baixo: ['m6 9 6 6 6-6'],
  mais: ['M12 5v14', 'M5 12h14'],
  telefone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z'],
};

export function Icone({ nome }: { nome: string }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      {(CAMINHOS[nome] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
