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

T13 a T18 estão todas concluídas localmente (build e 75 testes), fechando o roteiro completo do esboço "Pedal Pronto 2.0" mais um ajuste de harmonização (T18) pedido pelo atleta depois. Resumo do que cada uma entregou:

- **T18** (depois da T17, a pedido do atleta): o campo "objetivo" (performance/resistência/ftp/saúde) parou de decidir qualquer coisa — vira puramente contexto narrativo na tela "Direção da temporada" (aba Evolução). "Especificidade protegida" (reduzir volume perto de um evento principal, calculada por data) foi removida por completo, sem substituto. O mapa manual de fases por ciclo/semana (`mesocycle_phases`, editado à mão) foi substituído por uma regra fixa e automática: semanas 1-3 do ciclo são fase de progressão ("build", protege intensidade), semana 4 é recuperação ("recovery", protege duração) — a fase nunca mais fica "desconhecida" a menos que não haja âncora configurada. `lib/readiness.ts` (o ajuste do treino de **hoje**, publicado) passou a considerar a fase do mesociclo pela primeira vez, usando a mesma função `preferVolumeReduction` que já era usada só para o motor adaptativo e o replanejamento futuro — as três decisões que antes divergiam (uma cega para fase) agora são uma só. `athlete_goals`/`/api/profile` continuam existindo exatamente como antes, incluindo o teto de rampa do CTL; só pararam de influenciar decisões de treino.

- **T13**: `lib/context.ts` (puro) define o snapshot versionado (`AthleteSnapshot` v1); `lib/context-loader.ts` monta esse snapshot chamando `runReadiness`/`resolveMesocycle` uma única vez por requisição; `app/api/readiness/route.ts` e `app/api/week/route.ts` passam por `loadAthleteContext` em vez de buscar Polar/Intervals.icu cada um por conta própria; `snapshot.blocked` impede proposta futura e sugestão OFF quando os dados são contraditórios, sempre explicando o motivo.
- **T14**: `lib/decision-engine.ts` (`decideTraining`) decide fase+ACWR/rampa+objetivo de forma determinística. Por decisão do atleta, o motor só atua em dia planejado futuro — nunca no dia de hoje, que continua sob a proposta já publicada em `lib/readiness.ts` — reaproveitando `preferVolumeReduction` dentro de `futureProposal` (`app/api/week/route.ts`), que já tem todo o fluxo de escrita da SPEC-08. `lib/stimulus.ts` classifica cada sessão em endurance/limiar/vo2max/recuperação e resume a cobertura da semana; quando o dia sendo avaliado é a única fonte prevista de limiar/VO2max da semana, intensidade é preservada e volume cede primeiro, custe o que custar de fase/objetivo.
- **T15**: `lib/off-day-suggestions.ts` tem 5 categorias (antes 3, sem "descanso completo" como opção explícita), considera ACWR/rampa/fase/dor/sintomas (antes não considerava carga nem fase), evita repetir categoria sem motivo, e cita a lacuna de estímulo da semana na justificativa. Check-in e proximidade real do próximo treino-chave chegam de verdade em `app/api/week/route.ts`, sempre simétricos entre geração e revalidação da SPEC-08.
- **T16**: a maior parte já existia via T02/T06 (feedback recalculado a cada leitura, sem persistência — reprocessar não duplica nada). Único ajuste real: `feedback.signals` limitado a 3 evidências, como o aceite pedia.
- **T17**: `result.warning` — a razão específica de sessão expirada/dados atrasados/contraditórios, calculada há tempos no backend mas nunca exibida — agora aparece na aba Hoje, com botão "Reconectar Polar" quando é o caso. As abas que renderizavam vazio sem explicação quando os dados ainda não tinham chegado agora mostram a causa provável e a ação certa. A aba Semana mostra carga realizada vs. planejada (`weeklyLoadTarget`/`weeklyLoadDone`). Depois disso, a pedido explícito do atleta (aceitando não poder verificar visualmente), foi feito o redesenho de hierarquia que a SPEC pede: abas "Hoje" e "Recuperação" fundidas numa só (decisão, treino, recuperação, check-in e tendência de 7 dias numa rolagem só, sem trocar de aba); "Treinos" renomeada para "Semana"; aba Evolução reordenada para separar estado de hoje → tendência de adaptação → direção do ciclo, nessa ordem (antes estava fora de ordem). Navegação inferior passou de 5 para 4 abas.

Gaps conscientes que sobraram, nenhum bloqueante para as regras imutáveis: carga-alvo não é um número único à parte (o proxy `weeklyPlannedLoad`/`weeklyLoadTarget` continua sendo a referência); e a T17 **nunca foi verificada visualmente num navegador** — este ambiente não tem credenciais reais de Polar/Intervals.icu nem o cabeçalho de usuário da hospedagem. Isso vale especialmente agora, com a fusão de abas e a reordenação da Evolução: são mudanças estruturais nunca vistas renderizadas. Conferir isso no ambiente real é o passo que falta antes de publicar.

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
- `lib/mesocycle.ts` + `app/api/mesocycle/route.ts`: fase do mesociclo (calculada automaticamente pela semana do ciclo, sem mapa manual desde a T18) e ponteiro C/W/D (SPEC-11).
- `lib/load-safety.ts`: ACWR e ramp rate do CTL como sinais de segurança (SPEC-12).
- `lib/context.ts` (puro) + `lib/context-loader.ts` (I/O) + `app/api/context/route.ts`: snapshot unificado com fonte/horário/qualidade por campo, consumido por prontidão e semana (SPEC-13).
- `lib/decision-engine.ts`: motor adaptativo puro (`decideTraining`, `preferVolumeReduction`) — fase, ACWR/rampa e estímulo-chave decidem a proposta; objetivo não entra mais nessa decisão desde a T18 (SPEC-14).
- `lib/off-day-suggestions.ts`: biblioteca de 5 categorias de sugestão para dias OFF, contextual e sem repetição sem motivo (SPEC-15).
- `lib/stimulus.ts`: classifica sessões em endurance/limiar/vo2max/recuperação e resume a cobertura semanal — usado por T14 e T15.
- `drizzle/0002_training_decisions.sql`: histórico imutável de decisões.
- `drizzle/0003_training_write_operations.sql`: controle idempotente das confirmações de escrita.
- `.openai/hosting.json`: projeto hospedado e D1.

## Publicação

Projeto Sites privado, proprietário único. Antes de publicar: build, commit, envio da fonte, pacote com `dist` + hosting + migrations, salvar versão, publicar versão privada e confirmar sucesso.

O lote T08–T12 foi publicado com sucesso em 2026-09-08.

## Planejamento ainda não publicado

- SPEC-13/T13: snapshot unificado, versionado e com qualidade/proveniência dos dados. Concluída localmente.
- SPEC-14/T14: motor adaptativo orientado por fase, objetivo, carga e estímulo-chave, sempre como proposta confirmável. Concluída localmente.
- SPEC-15/T15: sugestões OFF variadas, contextuais e compatíveis com o plano. Concluída localmente.
- SPEC-16/T16: feedback pós-treino, atualização de carga e impacto futuro. Concluída localmente.
- SPEC-17/T17: experiência integrada de Hoje, Semana e Evolução. Concluída localmente, mas nunca verificada visualmente num navegador e sem o redesenho completo de hierarquia que a SPEC pede.
- SPEC-18/T18: fase do mesociclo substitui objetivo como orientador de carga; especificidade protegida removida; mapa manual de fases removido em favor de regra fixa por semana. Concluída localmente.
- Todas as seis (T13–T18) foram implementadas nesta ordem; publicar somente mediante ordem explícita — e, no caso da T17/T18, só depois de conferir a interface no ambiente real.
