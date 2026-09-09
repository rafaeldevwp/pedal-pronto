import path from 'node:path';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

// Runner separado, só para o que não roda no `node --test`.
//
// `lib/readiness.ts` é o arquivo mais crítico do projeto: é ele que decide a cor do dia. Mas ele
// importa `lib/polar.ts`, que importa `cloudflare:workers` — um módulo que só existe dentro do
// runtime da Cloudflare. O runner padrão não consegue carregá-lo, então até aqui o arquivo estava
// sem teste nenhum. Este pool roda os testes dentro do workerd de verdade, com um D1 real.
//
// Os 84 testes puros continuam em `npm test`, sem mudança. Este é o `npm run test:workers`.
export default defineWorkersConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, '.') },
  },
  test: {
    include: ['tests/workers/**/*.test.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        miniflare: {
          compatibilityDate: '2026-05-15',
          compatibilityFlags: ['nodejs_compat'],
          d1Databases: ['DB'],
          bindings: {
            POLAR_CLIENT_ID: 'test-client',
            POLAR_CLIENT_SECRET: 'test-secret',
            POLAR_REDIRECT_URI: 'http://localhost/api/polar/callback',
            INTERVALS_API_KEY: 'test-key',
            INTERVALS_ATHLETE_ID: 'i1',
          },
        },
      },
    },
  },
});
