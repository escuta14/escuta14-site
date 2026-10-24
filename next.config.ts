// Configuração do Next.js. O principal aqui são os cabeçalhos de segurança, que valem para
// todas as páginas: o navegador só carrega o que vem do próprio site e do antispam da
// Cloudflare (Turnstile), e nenhum outro site consegue mostrar o ESCUTA 14 dentro de um quadro.
import type { NextConfig } from 'next';

const emDesenvolvimento = process.env.NODE_ENV !== 'production';

// Política de conteúdo (CSP). 'unsafe-eval' só no computador de quem programa, porque o modo de
// desenvolvimento do Next precisa dele. O Turnstile precisa de script, quadro e conexão próprios.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${emDesenvolvimento ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  'frame-src https://challenges.cloudflare.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:caminho*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Nenhum endereço do ESCUTA 14 vai para outro site quando alguém clica num link.
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default config;
