// Criar ou trocar a senha, depois de abrir o link do e-mail. Só com sessão (o proxy.ts confere).
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { clienteDaSessao } from '@/lib/sessao';
import { FormularioSenha } from './Formulario';

export const metadata: Metadata = { title: 'Criar senha', robots: { index: false, follow: false } };

export default async function DefinirSenha() {
  const banco = await clienteDaSessao();
  const {
    data: { user },
  } = await banco.auth.getUser();
  if (!user) redirect('/painel/entrar?motivo=link');
  return (
    <div className="wrap">
      <div className="enviar">
        <h1 className="h1">Criar senha</h1>
        <p className="lead">Conta: {user.email}. Use pelo menos 10 caracteres e não repita a senha de outro site.</p>
        <FormularioSenha />
      </div>
    </div>
  );
}
