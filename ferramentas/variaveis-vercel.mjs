// Copia variáveis do .env.local para o projeto na Vercel (ambiente Production) sem mostrar os
// valores na tela: cada valor vai pela entrada padrão do comando `vercel env add`.
//
// Uso (na pasta do projeto, com `npx vercel@65.2.0 login` e `link` feitos):
//   node ferramentas/variaveis-vercel.mjs NOME1 NOME2 ...
// Segredos (marcados abaixo) ficam como "Sensitive" na Vercel: nem o painel mostra depois.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SEGREDOS = new Set(['SUPABASE_SECRET_KEY', 'TURNSTILE_SECRET_KEY', 'SEGREDO_ANONIMATO', 'CRON_SECRET']);
const valores = {};
for (const linha of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) valores[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1');
}

for (const nome of process.argv.slice(2)) {
  const valor = valores[nome];
  if (!valor) {
    console.log(`${nome}: vazio no .env.local, pulei`);
    continue;
  }
  const r = spawnSync('npx', ['--yes', 'vercel@65.2.0', 'env', 'add', nome, 'production', '--force', SEGREDOS.has(nome) ? '--sensitive' : '--no-sensitive'], {
    input: valor,
    encoding: 'utf8',
    shell: true,
  });
  console.log(`${nome}: ${r.status === 0 ? 'ok' : 'FALHOU (' + (r.stderr || '').split('\n').find((l) => /error|erro/i.test(l)) + ')'}`);
}
