// Situação da rotina diária para a direção ver no painel (Equipe). A rotina anota no banco a hora
// em que rodou (migration 0005), porque o Hobby da Vercel guarda o registro só por 1 hora.
// Testado em testes/rotina.test.ts.

const HORA = 60 * 60 * 1000;
/** A rotina roda todo dia às 6h de Brasília; no Hobby pode atrasar até 1 hora. Mais que isso, algo parou. */
export const LIMITE_HORAS = 26;

export function situacaoDaRotina(ultima: string | null | undefined, agora = new Date()): { texto: string; alerta: boolean } {
  if (!ultima) return { texto: 'A rotina ainda não anotou nenhuma execução.', alerta: true };
  const quando = new Date(ultima);
  const dia = quando.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const hora = quando.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const texto = `Rodou pela última vez em ${dia} às ${hora}.`;
  if ((agora.getTime() - quando.getTime()) / HORA > LIMITE_HORAS) {
    return { texto: `${texto} Faz mais de um dia que ela não roda: avise quem cuida do site (manual técnico, "Rotina diária").`, alerta: true };
  }
  return { texto, alerta: false };
}
