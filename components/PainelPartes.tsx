// Peças do painel: etiqueta de situação (sempre texto e cor; design.md), aviso de resultado e o
// cartão de cada manifestação na lista.
import Link from 'next/link';
import { CATEGORIAS, SEGMENTOS, TEMAS } from '@/lib/opcoes';
import { ANDAMENTOS, erroDoPainel, prazoNaLista, PUBLICACOES } from '@/lib/painel';

export const NOME: Record<string, string> = Object.fromEntries([...CATEGORIAS, ...TEMAS, ...SEGMENTOS]);

type Tom = 'azul' | 'verde' | 'laranja' | 'neutra';
const TOM_ANDAMENTO: Record<string, Tom> = { nova: 'azul', em_analise: 'neutra', respondida: 'verde', arquivada: 'neutra' };
const TOM_PUBLICACAO: Record<string, Tom> = { privada: 'neutra', aguardando: 'azul', publicada: 'verde', recusada: 'laranja', retirada: 'laranja', desistida: 'neutra' };

export function Etiqueta({ tom, children }: { tom: Tom; children: React.ReactNode }) {
  return <span className={`tag tom-${tom}`}>{children}</span>;
}

export function Situacao({ andamento, publicacao }: { andamento: string; publicacao: string }) {
  return (
    <>
      <Etiqueta tom={TOM_ANDAMENTO[andamento]}>{ANDAMENTOS[andamento as keyof typeof ANDAMENTOS]}</Etiqueta>
      <Etiqueta tom={TOM_PUBLICACAO[publicacao]}>{PUBLICACOES[publicacao as keyof typeof PUBLICACOES]}</Etiqueta>
    </>
  );
}

const FEITO: Record<string, string> = {
  resposta: 'Resposta salva. Quem enviou já pode ler pelo protocolo.',
  andamento: 'Andamento mudado.',
  tema: 'Tema corrigido.',
  avaliacao: 'Pronto.',
  mural: 'Mural atualizado.',
  prorrogar: 'Prazo prorrogado.',
  excluir: 'Manifestação excluída (continua guardada no banco).',
  equipe: 'Equipe atualizada.',
  convite: 'Convite enviado. A pessoa recebe um e-mail para criar a senha.',
  providencia: 'Providência publicada em “A escola ouviu”.',
  providencia_mudou: 'Pronto. A página “A escola ouviu” já mostra a mudança.',
};

export function Resultado({ feito, erro }: { feito?: string; erro?: string }) {
  if (erro) return <p className="erro vidro aviso-painel" role="alert">{erroDoPainel(erro)}</p>;
  if (feito && FEITO[feito]) return <p className="ok-painel vidro aviso-painel" role="status">{FEITO[feito]}</p>;
  return null;
}

export type Linha = {
  id: string;
  categoria: string;
  tema: string;
  segmento: string;
  texto: string;
  andamento: string;
  publicacao: string;
  pedido_avaliacao: boolean;
  demonstracao: boolean;
  criada_em: string;
  resposta: string | null;
  excluida_em: string | null;
};

export function CartaoLista({ m }: { m: Linha }) {
  const prazo = prazoNaLista(m.criada_em, !!m.resposta);
  return (
    <li>
      <Link className="cartao-painel vidro" href={`/painel/manifestacao/${m.id}`}>
        <span className="etiquetas">
          <span className="tag cat">{NOME[m.categoria]}</span>
          <span className="tag">{NOME[m.tema]}</span>
          <span className="tag">{NOME[m.segmento]}</span>
          <Situacao andamento={m.andamento} publicacao={m.publicacao} />
          {m.pedido_avaliacao ? <Etiqueta tom="laranja">Pede avaliação da direção</Etiqueta> : null}
          {m.demonstracao ? <Etiqueta tom="neutra">Demonstração</Etiqueta> : null}
          {m.excluida_em ? <Etiqueta tom="laranja">Excluída</Etiqueta> : null}
          {prazo ? <Etiqueta tom={prazo.urgente ? 'laranja' : 'neutra'}>{prazo.texto}</Etiqueta> : null}
        </span>
        <span className="previa">{m.texto.length > 180 ? m.texto.slice(0, 180) + '…' : m.texto}</span>
        <span className="data-painel">{new Date(m.criada_em).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
      </Link>
    </li>
  );
}
