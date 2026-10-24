'use client';
// Formulário de criar senha (convite ou "esqueci a senha").
import { useActionState } from 'react';
import { definirSenha, type EstadoSenha } from './acoes';

export function FormularioSenha() {
  const [estado, acao, salvando] = useActionState(definirSenha, {} as EstadoSenha);
  return (
    <form className="formulario vidro painel-entrar" action={acao}>
      <label htmlFor="senha">Nova senha</label>
      <input id="senha" name="senha" type="password" className="campo-painel" autoComplete="new-password" minLength={10} required />
      <label htmlFor="repetir">Repita a senha</label>
      <input id="repetir" name="repetir" type="password" className="campo-painel" autoComplete="new-password" minLength={10} required />
      {estado.erro ? (
        <p className="erro" role="alert">
          {estado.erro}
        </p>
      ) : null}
      <button className="btn btn-pri" type="submit" disabled={salvando}>
        {salvando ? 'Salvando…' : 'Salvar senha e entrar'}
      </button>
    </form>
  );
}
