// Passo a passo completo, que abre e fecha embaixo dos 3 passos do Início (pedido da Mariane,
// 24/10). Usa <details>, que funciona pelo teclado e no leitor de tela sem nenhum script.
// Só promete o que o código cumpre (regra 10 do CLAUDE.md).
const DUVIDAS: { pergunta: string; resposta: string[] }[] = [
  {
    pergunta: 'Como eu mando?',
    resposta: [
      'Toque em "Enviar manifestação". São 4 passos: o tipo (sugestão, reclamação, crítica, elogio, relato, proposta ou outra), o assunto, quem você é (estudante, professor, funcionário ou responsável) e o texto.',
      'Escreva de 10 a 3.000 letras. Conte o que acontece, onde e desde quando. Não escreva o seu nome nem o de outras pessoas.',
      'No fim, a página confere que você é uma pessoa (às vezes pede para marcar uma caixinha) e você toca em "Enviar".',
    ],
  },
  {
    pergunta: 'O que é o protocolo?',
    resposta: [
      'É um código como E14-AB2CD-EF3GH que aparece uma vez só, logo depois de enviar. Ele é o único jeito de ver a resposta da escola.',
      'Copie, anote ou tire um print. Ninguém consegue recuperar o protocolo para você, nem a escola, porque o site não guarda quem mandou.',
    ],
  },
  {
    pergunta: 'Como vejo a resposta?',
    resposta: ['Digite o protocolo no campo "Já mandou?" aqui no Início ou na página Acompanhar. Lá aparece a situação, o prazo e a resposta, quando houver.'],
  },
  {
    pergunta: 'É anônimo mesmo?',
    resposta: [
      'O site não pede nome, e-mail, telefone nem login. Ele não guarda o seu IP nem nada do seu aparelho junto com a manifestação.',
      'O cuidado que falta é seu: não se identifique no texto (nome, turma, apelido, detalhes que só você sabe).',
    ],
  },
  {
    pergunta: 'Em quanto tempo a escola responde?',
    resposta: ['Em até 30 dias. A direção pode prorrogar uma vez, por mais 30 dias, e explica o motivo para você ler pelo protocolo.'],
  },
  {
    pergunta: 'E o mural?',
    resposta: [
      'Só vai para o mural se você marcar a caixa no envio e a direção aprovar. Se a direção não aprovar, ela explica com base na lei ESCUTA 14.',
      'Você pode tirar do mural quando quiser, pelo protocolo. No mural, qualquer pessoa pode apoiar ou contestar, sem login.',
    ],
  },
];

export function Duvidas() {
  return (
    <details className="duvidas">
      <summary>Tem dúvida? Veja o passo a passo completo</summary>
      <div className="duvidas-corpo">
        {DUVIDAS.map((d) => (
          <section key={d.pergunta}>
            <h3>{d.pergunta}</h3>
            {d.resposta.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </details>
  );
}
