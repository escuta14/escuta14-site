'use client';
// Formulário de entrada do painel: e-mail, senha e "esqueci a senha".
import { useActionState } from 'react';
import { entrar, esqueciSenha, type Estado } from './acoes';

export function FormularioEntrar({ motivo }: { motivo?: string }) {
  const [estado, acaoEntrar, entrando] = useActionState(entrar, {} as Estado);
  const [estadoSenha, acaoSenha, pedindo] = useActionState(esqueciSenha, {} as Estado);
  const aviso = motivo === 'sem-acesso' ? 'Esta conta não tem mais acesso.' : motivo === 'link' ? 'Esse link não vale mais. Peça outro em "Esqueci a senha".' : '';
  return (
    <form className="formulario vidro painel-entrar" action={acaoEntrar}>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" className="campo-painel" autoComplete="username" required />
      <label htmlFor="senha">Senha</label>
      <input id="senha" name="senha" type="password" className="campo-painel" autoComplete="current-password" required />
      {aviso || estado.erro ? (
        <p className="erro" role="alert">
          {estado.erro ?? aviso}
        </p>
      ) : null}
      <button className="btn btn-pri" type="submit" disabled={entrando}>
        {entrando ? 'Entrando…' : 'Entrar'}
      </button>
      <button className="link-botao" type="submit" formAction={acaoSenha} formNoValidate disabled={pedindo}>
        Esqueci a senha
      </button>
      {estadoSenha.erro || estadoSenha.aviso ? <p role="status">{estadoSenha.erro ?? estadoSenha.aviso}</p> : null}
    </form>
  );
}
