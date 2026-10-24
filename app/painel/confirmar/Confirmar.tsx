'use client';
// Lê o acesso que veio no link do e-mail (no endereço ou depois do "#"), apaga do endereço na
// hora e entrega ao servidor, que cria a sessão. Depois leva para "Criar senha".
import { useEffect, useState } from 'react';
import { confirmarLink } from './acoes';

export function Confirmar() {
  const [erro, setErro] = useState(false);
  useEffect(() => {
    async function conferir() {
      const busca = new URLSearchParams(location.search);
      const fim = new URLSearchParams(location.hash.slice(1));
      // Tira o acesso do endereço antes de qualquer coisa (não fica no histórico do navegador).
      history.replaceState(null, '', location.pathname);
      const ok =
        !fim.get('error') &&
        !busca.get('error') &&
        (await confirmarLink({
          codigo: busca.get('code') ?? undefined,
          acesso: fim.get('access_token') ?? undefined,
          renovacao: fim.get('refresh_token') ?? undefined,
          tokenHash: busca.get('token_hash') ?? undefined,
          tipo: busca.get('type') ?? fim.get('type') ?? undefined,
        }));
      if (ok) location.replace('/painel/definir-senha');
      else setErro(true);
    }
    conferir();
  }, []);
  return erro ? (
    <p className="erro vidro aviso-painel" role="alert">
      Esse link não vale mais. Peça outro convite à direção ou use &quot;Esqueci a senha&quot; na <a href="/painel/entrar">entrada do painel</a>.
    </p>
  ) : (
    <p className="vidro aviso-painel" role="status">
      Conferindo o link…
    </p>
  );
}
