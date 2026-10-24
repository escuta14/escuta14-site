'use client';
// Widget do Cloudflare Turnstile (antispam). Carrega o script da Cloudflare uma vez, desenha o
// widget e avisa quando há um token. O token é conferido no servidor (lib/antispam.ts).
import { useEffect, useRef } from 'react';

type Api = {
  render: (el: HTMLElement, opcoes: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Api;
    aoCarregarTurnstile?: () => void;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=aoCarregarTurnstile';

function carregar(): Promise<Api> {
  return new Promise((resolver) => {
    if (window.turnstile) return resolver(window.turnstile);
    window.aoCarregarTurnstile = () => resolver(window.turnstile!);
    if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      document.head.appendChild(s);
    }
  });
}

export function Turnstile({ chave, aoMudar, reiniciar }: { chave: string; aoMudar: (token: string) => void; reiniciar: number }) {
  const caixa = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const aviso = useRef(aoMudar);
  useEffect(() => {
    aviso.current = aoMudar;
  });

  useEffect(() => {
    let ativo = true;
    carregar().then((api) => {
      if (!ativo || !caixa.current || id.current) return;
      id.current = api.render(caixa.current, {
        sitekey: chave,
        language: 'pt-br',
        callback: (t: string) => aviso.current(t),
        'expired-callback': () => aviso.current(''),
        'error-callback': () => aviso.current(''),
      });
    });
    return () => {
      ativo = false;
      if (id.current && window.turnstile) window.turnstile.remove(id.current);
      id.current = null;
    };
  }, [chave]);

  // Depois de um envio (com sucesso ou não), o token já foi usado: pede outro.
  useEffect(() => {
    if (reiniciar > 0 && id.current && window.turnstile) {
      window.turnstile.reset(id.current);
      aviso.current('');
    }
  }, [reiniciar]);

  return <div ref={caixa} className="antispam" />;
}
