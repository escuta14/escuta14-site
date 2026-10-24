// Equipe do painel: só a direção. Pedagogos entram e saem todo ano e a direção muda de tempos
// em tempos (pedido da Mariane, 24/10): aqui se convida, troca o papel, desativa e reativa.
// Ninguém tira o próprio acesso de direção; na troca, a direção nova desativa a antiga.
import { Resultado } from '@/components/PainelPartes';
import { exigirEquipe } from '@/lib/equipe';
import { PAPEIS } from '@/lib/painel';
import { bancoDoServidor } from '@/lib/supabase-servidor';
import { convidar, mudar } from './acoes';

const ERROS_CONVITE: Record<string, string> = {
  dados: 'Confira o nome, o e-mail e o papel.',
  existe: 'Esse e-mail já tem conta. Se a pessoa foi desativada, reative na lista.',
  convite: 'Não deu para mandar o convite agora. Tente de novo.',
};

export default async function Equipe({ searchParams }: { searchParams: Promise<{ feito?: string; erro?: string }> }) {
  const aviso = await searchParams;
  const { banco, usuarioId } = await exigirEquipe(true);
  const { data: equipe } = await banco.from('equipe').select('usuario_id, nome, papel, ativo, criado_em').order('ativo', { ascending: false }).order('nome');
  // O e-mail fica no Supabase Auth, que só o servidor lê.
  const { data: contas } = await bancoDoServidor().auth.admin.listUsers({ perPage: 200 });
  const emails = Object.fromEntries((contas?.users ?? []).map((u) => [u.id, u.email]));

  return (
    <div className="painel-corpo">
      <h1 className="h2">Equipe</h1>
      {aviso.erro && ERROS_CONVITE[aviso.erro] ? (
        <p className="erro vidro aviso-painel" role="alert">
          {ERROS_CONVITE[aviso.erro]}
        </p>
      ) : (
        <Resultado feito={aviso.feito} erro={aviso.erro} />
      )}
      <p className="aviso-mural">
        No começo de cada ano letivo, confira esta lista: desative quem saiu da escola e convide quem chegou. Quem é desativado perde o acesso na hora, e o que fez continua no histórico.
      </p>

      <ul className="lista-equipe">
        {(equipe ?? []).map((p) => (
          <li key={p.usuario_id} className={`vidro bloco-painel ${p.ativo ? '' : 'desativada'}`}>
            <p>
              <strong>{p.nome}</strong> · {PAPEIS[p.papel as keyof typeof PAPEIS]}
              {p.ativo ? '' : ' · desativada'}
              {p.usuario_id === usuarioId ? ' · você' : ''}
            </p>
            <p className="nota">
              {emails[p.usuario_id] ?? 'e-mail não encontrado'} · desde {new Date(p.criado_em).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
            {p.usuario_id !== usuarioId ? (
              <div className="acoes-linha">
                <form action={mudar}>
                  <input type="hidden" name="usuario" value={p.usuario_id} />
                  <input type="hidden" name="papel" value={p.papel === 'direcao' ? 'atendimento' : 'direcao'} />
                  <input type="hidden" name="ativo" value={p.ativo ? 'sim' : 'nao'} />
                  <button className="btn btn-sec" type="submit">
                    Passar para {p.papel === 'direcao' ? 'atendimento' : 'direção'}
                  </button>
                </form>
                <form action={mudar}>
                  <input type="hidden" name="usuario" value={p.usuario_id} />
                  <input type="hidden" name="papel" value={p.papel} />
                  <input type="hidden" name="ativo" value={p.ativo ? 'nao' : 'sim'} />
                  <button className="btn btn-sec" type="submit">
                    {p.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <form className="vidro bloco-painel form-justificativa" action={convidar}>
        <h2 className="pergunta-painel">Convidar alguém</h2>
        <p className="nota">A pessoa recebe um e-mail para criar a própria senha. Use o e-mail dela, de preferência o institucional.</p>
        <label className="filtro">
          Nome
          <input name="nome" className="campo-painel" required minLength={2} maxLength={120} />
        </label>
        <label className="filtro">
          E-mail
          <input name="email" type="email" className="campo-painel" required />
        </label>
        <label className="filtro">
          Papel
          <select name="papel" defaultValue="atendimento">
            <option value="atendimento">Atendimento (pedagogos, secretaria)</option>
            <option value="direcao">Direção</option>
          </select>
        </label>
        <button className="btn btn-pri" type="submit">
          Mandar convite
        </button>
      </form>
    </div>
  );
}
