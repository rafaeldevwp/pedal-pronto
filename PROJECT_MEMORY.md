# Memória do sistema — Pedal Pronto

Atualizado em: 2026-09-08

## Produto

PWA pessoal de ciclismo que cruza recuperação do Polar com carga e calendário do Intervals.icu. O objetivo é traduzir dados em decisões simples, adaptar treinos com segurança e preservar a evolução da temporada.

Site: https://pedal-pronto-rafael.rafiusic.chatgpt.site/
GitHub privado: https://github.com/rafaeldevwp/pedal-pronto

## Fontes de verdade

- Polar: sono, Nightly Recharge/ANS, HRV e FC de repouso.
- Intervals.icu: atividades, calendário, carga, fitness, fadiga e potência.
- D1: conexão Polar, execuções de prontidão e objetivo do atleta.
- O Intervals.icu continua sendo a fonte oficial do plano.

## Regras imutáveis

- Nunca apagar atividades ou alterar dados históricos.
- Treino ou atividade concluída no Intervals.icu é permanentemente somente leitura, mesmo com confirmação; adaptações só podem atingir eventos planejados ainda não executados.
- Dados ausentes, atrasados, contraditórios ou sessão expirada: não alterar treino.
- Verde mantém o plano; boa prontidão nunca aumenta a sessão automaticamente.
- Amarela altera no máximo uma variável.
- Vermelha prioriza recuperação, endurance leve ou descanso.
- Quarta, sexta e domingo são descanso.
- Limites: segunda 1h; terça 1h20; quinta 1h20; sábado conforme o longo.
- Nenhuma alteração, criação, substituição ou cancelamento de treino pode ocorrer sem confirmação explícita do atleta para a mudança específica; isso vale para hoje e para dias futuros.
- Dor ou doença exigem conduta conservadora, sem diagnóstico médico.

## O que está publicado

- Prontidão verde/amarela/vermelha e atualização manual.
- Ajuste do treino de hoje no Intervals.icu.
- Semana expansível com blocos e feedback pós-treino simples.
- Recuperação, carga de 7 dias, potência e coração × potência.
- Sugestões variáveis para dias OFF.
- Objetivo da temporada persistido.
- Proposta de replanejamento futuro com comparação e confirmação.
- Comparação pós-treino com até oito sessões pessoais semelhantes dos últimos 120 dias, amostra mínima, evidências e confiança.
- Aprendizado individual com amostra mínima e limites explícitos.
- Check-in ampliado e bloqueios conservadores para dor e sintomas.
- Previsão do impacto sobre o próximo treino-chave.
- Histórico imutável de decisões e resultados posteriores.
- Alertas de risco futuro no PWA e no celular, sem mudanças automáticas.

## Estado exato de retomada

`NEXT`: T14 — motor adaptativo orientado por fase, objetivo e carga. Depois: T15 sugestões OFF, T16 ciclo pós-treino e T17 experiência integrada.

T13 (contexto unificado) foi concluída e validada localmente (build e 28 testes, incluindo `tests/context.test.ts`). `lib/context.ts` (puro) define o contrato versionado do snapshot (`AthleteSnapshot` v1); `lib/context-loader.ts` monta esse snapshot chamando `runReadiness` e `resolveMesocycle` uma única vez por requisição. `app/api/readiness/route.ts`, `app/api/week/route.ts` e `app/api/context/route.ts` agora passam todos por `loadAthleteContext`, então prontidão e semana leem exatamente o mesmo cálculo em vez de cada um buscar Polar/Intervals.icu por conta própria. `snapshot.blocked`/`blockReasons` agora impede proposta futura e sugestão de dia OFF em `app/api/week/route.ts` quando os dados são contraditórios (ex.: divergência de mesociclo), sempre explicando o motivo em `contextWarning`/`suggestionStatus` — nunca silenciosamente. O ajuste do treino de hoje em `lib/readiness.ts` continua sem saber de mesociclo/ACWR de propósito: a SPEC-11 já definia que isso não decide nada sobre o treino do dia; isso é o papel do motor da T14.

A T03 até a T07 foram integradas, validadas e publicadas em um único lote após autorização do atleta.

A versão online contém as SPECs T01–T07.

Dois bugs foram especificados após uso real: o treino de hoje foi alterado sem consentimento e o botão do slider desaparece em zero. A T08 foi implementada e validada localmente: avaliar/check-in são somente leitura; propostas de hoje, futuras e de dia OFF exigem confirmação específica; o servidor revalida evento e atividades; treinos concluídos são bloqueados; a operação é idempotente e o histórico só registra a escrita confirmada. Ela ainda não foi publicada por ordem do atleta, portanto a versão online continua sendo a versão anterior. A automação diária ativa foi atualizada em 2026-09-07 para operar somente em leitura e apresentar propostas sem escrever no Intervals.icu.

A T09 foi implementada e validada localmente: botão e trilho permanecem visíveis nos extremos, a área de toque foi ampliada, há foco acessível e zero é preservado no estado e no armazenamento. A T10 também foi implementada localmente, com glossário centralizado, busca, categorias, explicações contextuais e navegação acessível.

O repositório privado `rafaeldevwp/pedal-pronto` foi criado e a integração recebeu acesso somente a ele. O envio inicial do conteúdo foi interrompido e deve ser retomado separadamente; não confundir isso com a publicação do PWA pelo Sites.

## Arquitetura curta

- `app/page.tsx`: interface principal do PWA.
- `app/api/readiness/route.ts` + `lib/readiness.ts`: decisão diária e ajuste de hoje.
- `app/api/week/route.ts`: semana, feedback, sugestão OFF e propostas futuras.
- `app/api/performance/route.ts`: evolução e potência.
- `app/api/profile/route.ts`: objetivo da temporada.
- `lib/polar.ts`: ambiente, identidade e estrutura D1.
- `lib/training-safety.ts` + `lib/training-safety-core.ts`: consentimento, revalidação e idempotência de escritas de treino.
- `lib/mesocycle.ts` + `app/api/mesocycle/route.ts`: fase do mesociclo e ponteiro C/W/D (SPEC-11).
- `lib/load-safety.ts`: ACWR e ramp rate do CTL como sinais de segurança (SPEC-12).
- `lib/context.ts` (puro) + `lib/context-loader.ts` (I/O) + `app/api/context/route.ts`: snapshot unificado com fonte/horário/qualidade por campo, consumido por prontidão e semana (SPEC-13).
- `drizzle/0002_training_decisions.sql`: histórico imutável de decisões.
- `drizzle/0003_training_write_operations.sql`: controle idempotente das confirmações de escrita.
- `.openai/hosting.json`: projeto hospedado e D1.

## Publicação

Projeto Sites privado, proprietário único. Antes de publicar: build, commit, envio da fonte, pacote com `dist` + hosting + migrations, salvar versão, publicar versão privada e confirmar sucesso.

O lote T08–T12 foi publicado com sucesso em 2026-09-08.

## Planejamento ainda não publicado

- SPEC-13/T13: snapshot unificado, versionado e com qualidade/proveniência dos dados.
- SPEC-14/T14: motor adaptativo orientado por fase, objetivo e carga, sempre como proposta confirmável.
- SPEC-15/T15: sugestões OFF variadas, contextuais e compatíveis com o plano.
- SPEC-16/T16: feedback pós-treino, atualização de carga e impacto futuro.
- SPEC-17/T17: experiência integrada de Hoje, Semana e Evolução.
- Ordem de implementação: T13 → T14 → T15 → T16 → T17; publicar somente mediante ordem explícita.
