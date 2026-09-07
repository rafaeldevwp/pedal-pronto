# Memória do sistema — Pedal Pronto

Atualizado em: 2026-09-07

## Produto

PWA pessoal de ciclismo que cruza recuperação do Polar com carga e calendário do Intervals.icu. O objetivo é traduzir dados em decisões simples, adaptar treinos com segurança e preservar a evolução da temporada.

Site: https://pedal-pronto-rafael.rafiusic.chatgpt.site/

## Fontes de verdade

- Polar: sono, Nightly Recharge/ANS, HRV e FC de repouso.
- Intervals.icu: atividades, calendário, carga, fitness, fadiga e potência.
- D1: conexão Polar, execuções de prontidão e objetivo do atleta.
- O Intervals.icu continua sendo a fonte oficial do plano.

## Regras imutáveis

- Nunca apagar atividades ou alterar dados históricos.
- Dados ausentes, atrasados, contraditórios ou sessão expirada: não alterar treino.
- Verde mantém o plano; boa prontidão nunca aumenta a sessão automaticamente.
- Amarela altera no máximo uma variável.
- Vermelha prioriza recuperação, endurance leve ou descanso.
- Quarta, sexta e domingo são descanso.
- Limites: segunda 1h; terça 1h20; quinta 1h20; sábado conforme o longo.
- Alteração de hoje pode ser automática pelas regras existentes.
- Alteração futura exige confirmação explícita no PWA.
- Dor ou doença exigem conduta conservadora, sem diagnóstico médico.

## O que está publicado

- Prontidão verde/amarela/vermelha e atualização manual.
- Ajuste do treino de hoje no Intervals.icu.
- Semana expansível com blocos e feedback pós-treino simples.
- Recuperação, carga de 7 dias, potência e coração × potência.
- Sugestões variáveis para dias OFF.
- Objetivo da temporada persistido.
- Proposta de replanejamento futuro com comparação e confirmação.

## Estado exato de retomada

`NEXT`: concluir a integração do objetivo ao motor de decisão.

A implementação está no diretório de trabalho, ainda não validada nem publicada. Arquivos modificados: `lib/readiness.ts`, `app/api/week/route.ts`, `app/page.tsx` e `app/globals.css`. Ela faz o objetivo definir qual variável preservar e protege especificidade nas três semanas antes de uma meta principal.

## Arquitetura curta

- `app/page.tsx`: interface principal do PWA.
- `app/api/readiness/route.ts` + `lib/readiness.ts`: decisão diária e ajuste de hoje.
- `app/api/week/route.ts`: semana, feedback, sugestão OFF e propostas futuras.
- `app/api/performance/route.ts`: evolução e potência.
- `app/api/profile/route.ts`: objetivo da temporada.
- `lib/polar.ts`: ambiente, identidade e estrutura D1.
- `.openai/hosting.json`: projeto hospedado e D1.

## Publicação

Projeto Sites privado, proprietário único. Antes de publicar: build, commit, envio da fonte, pacote com `dist` + hosting + migrations, salvar versão, publicar versão privada e confirmar sucesso.

