// Testes das regras (Vitest). Rodam sem banco e sem internet: só as funções puras de lib/.
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { include: ['testes/**/*.test.ts'], environment: 'node' },
});
