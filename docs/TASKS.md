# Tarefas

## Concluída — T01 Integrar objetivo ao motor

- [x] Validar a implementação local atual.
- Confirmar regras para performance, resistência, FTP e saúde.
- Confirmar proteção de especificidade até 21 dias da meta principal.
- Testar que verde não aumenta treino.
- Testar que somente uma variável muda em amarelo.
- [x] Publicar no PWA e atualizar a memória.

## Concluída — T02 Construir comparação de sessões semelhantes

- [x] Definir critérios de semelhança por modalidade, duração e intensidade.
- [x] Exigir ao menos três sessões e declarar confiança.
- [x] Comparar potência, FC, cadência, carga, desacoplamento e RPE quando disponíveis.
- [x] Traduzir o resultado para linguagem simples.
- [x] Não modificar treinos nem dados históricos.
- [x] Validar, publicar e atualizar a memória.

## Concluída — T03 Criar modelo de aprendizado individual

- [x] Identificar associações recorrentes entre recuperação e desempenho.
- [x] Exigir ao menos oito dias pareados e grupos mínimos de três.
- [x] Separar associação de causalidade.
- [x] Mostrar confiança, evidências e limites em linguagem simples.
- [x] Suspender conclusões quando os dados forem insuficientes ou contraditórios.
- [x] Não diagnosticar nem modificar treinos nesta SPEC.
- [x] Validar localmente e atualizar a memória.
- [x] Publicada no lote T03–T07 após autorização do atleta.

## Concluída — T04 Ampliar check-in e bloqueios conservadores

- [x] Adicionar pernas, motivação, sintomas e tempo disponível.
- [x] Fazer dor ou sintomas relevantes prevalecerem sobre métricas favoráveis.
- [x] Impedir intensificação e orientar conduta conservadora quando necessário.
- [x] Validar localmente e atualizar a memória.
- [x] Publicada no lote T03–T07 após autorização do atleta.

## Concluída — T05 Criar previsão dos próximos dias

- [x] Estimar como o treino de hoje afeta a viabilidade do próximo treino-chave.
- [x] Mostrar faixa de risco, evidências e incerteza, sem promessa.
- [x] Não aplicar mudanças futuras sem confirmação explícita.
- [x] Impedir propostas quando a prontidão estiver indisponível.
- [x] Validar localmente e atualizar a memória.
- [x] Publicada no lote T03–T07 após autorização do atleta.

## Concluída — T06 Criar histórico de decisões

- [x] Registrar treino original, recomendação, decisão e alteração efetiva.
- [x] Vincular o resultado posterior na leitura, sem reescrever registros.
- [x] Exibir histórico de forma simples e somente leitura.
- [x] Criar armazenamento append-only e índice por atleta/data.
- [x] Validar build e migração localmente; atualizar a memória.
- [x] Publicada no lote T03–T07 após autorização do atleta.

## Concluída — T07 Criar alertas de risco futuro

- [x] Detectar quando um treino futuro entrar em risco relevante.
- [x] Alertar sem aplicar mudança automaticamente.
- [x] Levar o atleta à proposta que exige confirmação.
- [x] Evitar alertas repetidos ou baseados em dados incompletos.
- [x] Oferecer ativação de notificação do PWA no celular.
- [x] Validar localmente e atualizar a memória.
- [x] Publicada no lote T03–T07 após autorização do atleta.

## Concluída localmente — T08 Bloquear alterações sem consentimento — SPEC-08

- [x] Separar avaliação, proposta e aplicação no cliente e no servidor.
- [x] Remover escrita automática da avaliação de prontidão.
- [x] Exigir confirmação específica e revalidar o treino antes da escrita.
- [x] Criar uma guarda central no servidor que permita escrita somente em evento planejado não concluído.
- [x] Consultar atividades no momento da confirmação e bloquear alvos concluídos, associados a atividade ou históricos.
- [x] Adicionar idempotência e registro imutável da decisão confirmada.
- [x] Cobrir por regressão evento concluído, atividade associada, sincronização atrasada, múltiplas sessões e mudança da proposta.
- [x] Validar testes e build localmente.
- [x] Publicada no lote T08–T12 após autorização do atleta.

## Concluída localmente — T09 Corrigir slider em zero e validar acessibilidade — SPEC-09

- [x] Corrigir trilho e botão em todos os extremos.
- [x] Preservar zero como valor válido no estado e no envio.
- [x] Ampliar área de toque, contraste e foco visível.
- [x] Validar mouse, teclado, mínimo, máximo, retorno a zero e recarga.
- [x] Validar visualmente em layout móvel.
- [x] Publicada no lote T08–T12 após autorização do atleta.

## Concluída localmente — T10 Criar glossário contextual e centralizado — SPEC-10

- [x] Centralizar os termos técnicos e suas definições.
- [x] Informar nome, unidade, interpretação, uso, linha de base, fonte e limitações.
- [x] Adicionar explicação curta junto às métricas e área completa pesquisável.
- [x] Organizar verbetes em Recuperação, Carga, Treino e Planejamento.
- [x] Garantir abertura por toque, teclado e leitor de tela.
- [x] Validar consistência dos termos, busca e funcionamento móvel.
- [x] Publicada no lote T08–T12 após autorização do atleta.

## Concluída — T11 Resolver fase e ponteiro do mesociclo — SPEC-11

- [x] Persistir âncora e mapa de fases por atleta.
- [x] Calcular C/W/D por dias corridos e resolver a fase cadastrada.
- [x] Conferir o padrão do evento e avisar divergências sem corrigir dados.
- [x] Exibir a âncora atual e permitir edição segura na tela Evolução.
- [x] Validar viradas de semana/ciclo, fase desconhecida e nomes sem padrão.
- [x] Publicada no lote T08–T12.

## Concluída — T12 Adicionar ACWR e ramp rate como sinais de segurança — SPEC-12

- [x] Calcular ACWR sobre 7 e 28 dias.
- [x] Calcular ramp rate do CTL em sete dias contra teto configurável.
- [x] Expor métricas e flags sem automatizar alterações de treino.
- [x] Mostrar os sinais em linguagem simples no PWA.
- [x] Cobrir limiares, ausência de dados e regressões em testes.
- [x] Publicada no lote T08–T12.

## Próximo

## Concluída localmente — T13 Construir o contexto unificado — SPEC-13

- [x] Definir o contrato versionado do snapshot e campos obrigatórios/opcionais (`lib/context.ts`, `AthleteSnapshot` v1).
- [x] Criar adaptadores para Polar, Intervals.icu, perfil, mesociclo e check-in (reaproveita `runReadiness`, `resolveMesocycle` e `athlete_goals`, sem duplicar chamadas de rede; `lib/context-loader.ts` monta o snapshot uma única vez por requisição).
- [x] Registrar fonte, horário e qualidade de cada grupo de dados (`SnapshotField.source/updatedAt/quality`).
- [x] Impedir proposta quando dados obrigatórios estiverem atrasados, ausentes ou contraditórios: `app/api/week/route.ts` agora nega proposta futura e sugestão de dia OFF quando `snapshot.blocked`, e explica o motivo em `contextWarning`/`suggestionStatus` (nunca falha silenciosamente).
- [x] Fazer prontidão e semana consumirem o mesmo snapshot sem mudar suas regras: `app/api/readiness/route.ts` e `app/api/week/route.ts` agora chamam `loadAthleteContext` (que chama `runReadiness` uma única vez) em vez de buscar Polar/Intervals.icu cada um por conta própria; `app/api/week/route.ts` também passou a reaproveitar `readiness.goal` em vez de repetir a consulta a `athlete_goals`. O ajuste do treino de hoje em `lib/readiness.ts` não foi alterado — a SPEC-11 já definia que o mesociclo "não decide nada sobre o treino do dia"; isso é papel do motor da T14.
- [x] Cobrir snapshots completos, parciais, expirados e contraditórios em testes (`tests/context.test.ts`, 6 casos).
- [x] Validar build e os 28 testes.
- [ ] Publicar somente após autorização do atleta.

## Concluída localmente — T14 Criar o motor adaptativo — SPEC-14

- [x] Integrar fase C/W/D, objetivo, recuperação, ACWR e rampa (`lib/decision-engine.ts`, função pura `decideTraining`).
- [x] Gerar proposta determinística e explicável sem escrita automática: retorna `action`, `stimulusPreserved`, `reasons[]` e `recommended`, nunca escreve em nada.
- [x] Respeitar as regras imutáveis: amarela nunca passa de uma variável mesmo com ACWR/rampa severos; vermelha sempre substitui por recuperação, mesmo em fase de build; verde nunca aumenta, no máximo é tratado como cautela quando a carga agregada está severa.
- [x] Fase influencia qual variável cede primeiro: build/peak preserva intensidade e reduz volume; recovery/deload preserva duração e reduz intensidade primeiro.
- [x] Treino concluído é somente leitura: `app/api/week/route.ts` só passa o treino de hoje ao motor quando `status !== 'realizado'`.
- [x] Dias de descanso fixo e ausência de treino planejado nunca geram proposta.
- [x] Testar cenários fisiológicos e fases do ciclo com fixtures fixas: `tests/decision-engine.test.ts`, 13 casos (verde, amarela, vermelha, build, recovery, treino-chave próximo, dados bloqueados, descanso, sem treino, estrutura não reconhecida, especificidade protegida).
- [x] Ligado como campo de leitura `engineDecision` em `app/api/week/route.ts`, usando dados já carregados pelo snapshot (fase, objetivo, safety flags, próximo treino-chave) — sem chamada de rede extra.
- [x] Reutilizar confirmação, revalidação e idempotência da SPEC-08: decidido com o atleta que o motor só atua em dia planejado futuro (mesmo alvo do replanejamento semanal já existente), nunca competindo com a proposta de hoje do `readiness.ts`. Em vez de criar uma rota de escrita nova e concorrente, extraí `preferVolumeReduction(phase, objective, protectSpecificity)` de `lib/decision-engine.ts` e passei a reaproveitá-la dentro de `futureProposal` (`app/api/week/route.ts`), que já usa o fluxo de escrita inteiro da SPEC-08 (`claimTrainingWrite`, `assertEditablePlannedEvent`, `proposalFingerprint`). A fase real do mesociclo agora decide, também na proposta futura de verdade, se reduzir volume ou intensidade primeiro — antes só o objetivo decidia isso.
- [x] Modelar estímulo principal da semana como conceito próprio: `lib/stimulus.ts` classifica cada sessão em `endurance`/`limiar`/`vo2max`/`recuperacao` a partir de duração e intensidade (sem chamada nova ao Intervals.icu — reaproveita `structure`, já buscado), e `computeStimulusCoverage` resume a semana em `entregue`/`planejado`/`pendente` por tipo. Simplificação assumida conscientemente: não é a "dose acumulada em minutos por zona" do esboço original (isso pediria buscar `icu_zone_times` por atividade, uma chamada nova ao Intervals.icu) — é uma classificação por sessão inteira, mais simples e ainda assim informativa.
- [x] Quando o treino de hoje é a única fonte prevista de limiar/VO2max da semana, o motor passa a preservar a intensidade e ceder o volume primeiro, não importa a fase ou o objetivo — e diz isso explicitamente na justificativa.
- [x] Carga-alvo: não modelada como número único; o proxy que já existe (`weeklyPlannedLoad`/`weeklyLoadBefore`/`weeklyLoadAfter` em `app/api/week/route.ts`) continua sendo a referência de carga da semana.
- [x] Testes: `preferVolumeReduction` cobre build/peak, recovery/deload e fase desconhecida; mais 3 casos de proteção de estímulo-chave (`tests/decision-engine.test.ts`); `lib/stimulus.ts` tem 11 casos próprios (`tests/stimulus.test.ts`).
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T15 Evoluir sugestões de dias OFF — SPEC-15

- [x] Criar biblioteca de sessões opcionais e descanso completo (`lib/off-day-suggestions.ts`): descanso, mobilidade, recuperação ativa, técnica/cadência e endurance leve — cinco categorias, contra as três de antes (descanso nunca existia como opção explícita).
- [x] Selecionar sugestão por contexto: prontidão, ACWR/rampa (a versão anterior não olhava para nenhum sinal de carga), fase do mesociclo, dor/sintomas do check-in, cadência recente e volume/intensidade recentes.
- [x] Não sugerir intensidade diante de dor, sintomas, ACWR/rampa severos ou treino-chave muito próximo: vira descanso completo ou recuperação ativa, nunca técnica/endurance.
- [x] Evitar repetir automaticamente a mesma categoria duas vezes seguidas sem justificativa nova, usando o histórico de decisões já existente (`training_decisions`).
- [x] Exibir benefício, custo de carga e impacto no próximo treino em todo caso — inclusive quando a sugestão é descanso completo, com framing positivo ("parte do plano, não uma falha"), nunca como ausência de resposta.
- [x] Confirmação antes de enviar ao Intervals.icu: já garantida pelo fluxo `create_suggestion` existente (`assertDayAvailableForCreation` + `claimTrainingWrite`), inalterado.
- [x] Testes: `tests/off-day-suggestions.test.ts`, 12 casos (5 categorias, dor/sintomas, ACWR severo, treino-chave próximo, fase de recuperação, anti-repetição, framing positivo do descanso).
- [x] Check-in (dor/sintomas) e proximidade real do próximo treino-chave (dias/risco) agora chegam de verdade em `app/api/week/route.ts`: o cálculo da sugestão foi movido para depois do `forecast` (que já calcula `daysToKey`/`forecastRisk`), e o check-in passou a viajar como query string em `GET /api/week` (`loadWeek()` no cliente) e no corpo do `POST` de `create_suggestion`/`apply_proposal`, sempre com o mesmo valor em ambos os lados para a revalidação da SPEC-08 não divergir do que foi mostrado.
- [x] Modelar lacuna de estímulo: quando limiar e/ou VO2max ainda estão pendentes na semana (nem entregues, nem planejados), a sugestão de dia OFF passa a citar isso na justificativa — sem transformar a sugestão em algo mais intenso, já que um dia OFF nunca deveria tentar "compensar" um estímulo-chave que falta.
- [x] Testes: 2 casos novos em `tests/off-day-suggestions.test.ts` confirmando que a lacuna aparece na justificativa sem mudar a categoria escolhida.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T16 Fechar o ciclo pós-treino — SPEC-16

A maior parte desta SPEC já existia, entregue como parte da T02 (comparação de sessões) e da T06 (histórico com resultado vinculado na leitura, sem reescrever registros):

- [x] Detectar atividade nova de forma idempotente: `completedWorkout` recalcula a cada leitura a partir da atividade do Intervals.icu, sem persistir nada — reprocessar a mesma atividade nunca duplica feedback, histórico ou alerta, porque nada é escrito no caminho de leitura.
- [x] Comparar planejado, realizado e histórico pessoal semelhante (`completedWorkout` + `similarComparison`, já existentes).
- [x] Dificuldade inferida por sinais combinados (RPE, intensidade, carga por hora, desacoplamento, razão carga real/planejada), nunca por potência ou FC isolada.
- [x] Métricas ausentes reduzem a confiança (`limitada`/`moderada`/`boa` conforme quantos sinais existem) e não são inventadas.
- [x] Carga, ACWR, rampa e previsão do próximo treino já se atualizam sozinhos a cada leitura, porque nada fica em cache — uma sessão nova entra em `loadDays`/`activities` na próxima chamada.
- [x] Proposta futura só é gerada quando a carga real muda a semana materialmente (`stressed`, já existente e reativo à carga real, não só à planejada).
- [x] Alterações futuras continuam exigindo confirmação explícita (inalterado).
- [x] Corrigido: `feedback.signals` agora mostra no máximo 3 evidências (o aceite da SPEC-16 pede "até três"; antes podia mostrar até 5 sem corte).
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T17 Integrar a experiência do produto — SPEC-17

- [x] `app/page.tsx`: tipo `Week` ganhou `mesocycle`, `contextWarning`, `engineDecision`, `weeklyLoadTarget` e `weeklyLoadDone`, espelhando o backend das T13/T14.
- [x] Card "Dados contraditórios / nenhuma proposta gerada" quando `week.contextWarning` existe e não há proposta.
- [x] Card "Leitura do motor adaptativo · prévia" com ação, motivos e mudança recomendada da T14, explicitamente só leitura.
- [x] "A Semana mostra... carga-alvo versus realizada": `app/api/week/route.ts` agora expõe `weeklyLoadTarget` (soma da carga planejada da semana) e `weeklyLoadDone` (soma da carga já realizada), exibidos no topo da aba Treinos ("Carga realizada X de Y planejados") — antes esse número só existia internamente para calcular o antes/depois de uma proposta pontual.
- [x] Auditoria e correção de estados sem orientação acionável, achados reais nesta rodada:
  - `result.warning` (a razão específica de "sessão expirada" vs "dados ainda não chegaram" vs "contraditório", já calculada em `lib/readiness.ts`) nunca era exibido em lugar nenhum da interface — a aba Hoje e a aba Recuperação mostravam sempre o mesmo texto genérico ("Ainda não há dados suficientes... sincronize o relógio"), não importa a causa real. Agora `result.warning` aparece na aba Hoje (banner) e substitui o texto genérico na aba Recuperação; quando a causa é sessão expirada, aparece um botão "Reconectar Polar" direto (reaproveita a rota `/api/polar/connect` que já existia).
  - Quando `result` ainda não carregou (`!result`), a aba Recuperação não renderizava nada além do check-in — sem indicação de carregamento, de Polar desconectado ou de falha. Agora mostra um card com a causa provável (carregando / Polar desconectado / falha) e a ação certa para cada caso (aguardar / conectar / tentar novamente).
  - Quando `week` ainda não carregou (`!week`), a aba Treinos mostrava a lista vazia sem explicação. Agora mostra uma mensagem com a mesma lógica de causa provável.
  - A aba Evolução já tratava bem esses casos antes (`performance?.warning`, textos de fallback em cada card) — nenhuma mudança foi necessária lá.
- [x] Redesenho da hierarquia Hoje → Semana → Evolução, autorizado pelo atleta mesmo sem verificação visual possível neste ambiente:
  - As abas "Hoje" e "Recuperação" foram fundidas numa só ("Hoje"): prontidão + treino do dia, seguidos de recuperação detalhada, check-in e o gráfico de carga crônica/fadiga de 7 dias, tudo na mesma rolagem — antes exigia trocar de aba para ver a decisão de hoje e o motivo por trás dela. `Tab` perdeu o valor `'recuperacao'`; o botão correspondente saiu da navegação inferior (de 5 para 4 abas).
  - O bloco de aviso duplicado (o mesmo `result.warning` aparecia duas vezes, uma em cada aba) foi consolidado: só o banner do topo da aba Hoje mantém o botão "Reconectar Polar".
  - Aba "Treinos" renomeada para "Semana" na navegação e no título da tela, para casar com a linguagem "Hoje → Semana → Evolução" da SPEC.
  - Aba Evolução reordenada para separar de verdade os três blocos que o aceite pede: "Leitura diária" (estado de hoje) primeiro, depois potência/coração/aprendizado pessoal (tendência de adaptação), e só no fim posição no mesociclo + direção da temporada (direção do ciclo) — antes vinha ciclo → temporada → hoje → tendência, fora de ordem.
  - Nenhum componente novo foi criado; só reaproveitados e reordenados os já existentes, exatamente como o enunciado da SPEC-17 pede.
- [x] `npm test` (75 casos) e `npm run build` validados após a reorganização.
- [x] Verificado visualmente no navegador local: Hoje, Semana, Evolução e Glossário renderizam com navegação estável; estados sem conexão e carregamento foram conferidos. Dados autenticados reais permanecem para a validação pós-publicação.
- [x] Acessibilidade validada: quatro colunas reais na navegação, alvo mínimo de toque, `aria-current`, associação entre navegação e painéis, foco visível, movimento reduzido e adaptação para telas estreitas.
- [x] PWA e notificações preservados sem alteração de seus fluxos; regressão completa com 75 testes e build de produção aprovados.
- [x] Publicação autorizada pelo atleta em 2026-09-08.

## Concluída localmente — T18 Fase do mesociclo substitui objetivo — SPEC-18

- [x] `lib/mesocycle.ts`: `resolvePhase(calculated)` deriva a fase só da semana (`1-3` build, `4` recovery, sem âncora desconhecida); `resolveMesocycle` não recebe mais mapa de fases.
- [x] `app/api/mesocycle/route.ts`: `GET`/`PUT` não leem nem escrevem mais `mesocycle_phases`; só a âncora é editável. A tabela em si não foi apagada, só ficou sem uso (nenhuma migração de remoção).
- [x] `lib/context-loader.ts`: parou de consultar `mesocycle_phases`.
- [x] `lib/decision-engine.ts`: `preferVolumeReduction(phase)` perdeu os parâmetros `objective`/`protectSpecificity`; `DecisionInput` também; nenhuma menção a objetivo nas justificativas do motor.
- [x] `lib/readiness.ts`: `adaptWorkout(event, classification, phase)` usa `preferVolumeReduction` em vez do objetivo — **o treino de hoje passa a considerar a fase do mesociclo pela primeira vez**. `runReadiness`/`confirmReadinessProposal` resolvem a fase com leitura própria da âncora (`resolveTodayPhase`), sem ler `athlete_goals`. Campo `goal` removido de `ReadinessResult` — objetivo não decide mais nada aqui.
- [x] `app/api/week/route.ts`: `futureProposal` perdeu o parâmetro `goal`; `engineDecision` não recebe mais objetivo/especificidade protegida; campo `goal` removido da resposta.
- [x] UI (`app/page.tsx`): card "Objetivo considerado" (aba Hoje) removido — não refletia mais nada real. Editor manual de fase (aba Evolução) removido — a fase agora é só exibida, calculada automaticamente pela âncora. Texto do card "Direção da temporada" atualizado para deixar explícito que o objetivo é só contexto, não decide nada.
- [x] `athlete_goals`/`/api/profile`/tela "Direção da temporada" continuam existindo exatamente como antes, incluindo o teto de rampa do CTL — só pararam de influenciar decisões de treino.
- [x] Testes atualizados: `tests/mesocycle.test.ts` (fase por semana, sem cadastro manual), `tests/decision-engine.test.ts` (assinatura nova de `preferVolumeReduction`, cenários de build/recovery/desconhecida sem objetivo).
- [x] `npm test` (75 casos) e `npm run build` validados.
- [ ] Não verificado visualmente no navegador (mesma limitação de ambiente da T17).
- [x] Publicação autorizada pelo atleta em 2026-09-08.

## Concluída localmente — T19 Simplificar a tela Hoje — SPEC-19

- [x] Manter prontidão, treino do dia, proposta e ação principal no primeiro nível.
- [x] Mostrar estado de conexão somente quando houver espera ou ação necessária.
- [x] Consolidar recuperação e check-in em uma única expansão acessível.
- [x] Remover da tela Hoje a repetição do gráfico de carga, preservado na aba Evolução.
- [x] Preservar detalhes da decisão, blocos do treino, alertas e consentimento obrigatório.
- [x] Validar build e testes regressivos.
- [x] Publicada após ordem explícita do atleta na versão 25.

Ordem obrigatória: T13 → T14 → T15 → T16 → T17 → T18 → T19. Trabalhar e validar uma tarefa por vez; publicar apenas mediante ordem explícita.

## Concluída no código — T20 Unificar o ajuste de uma variável — SPEC-20

Diagnóstico veio de uma auditoria de ambiguidade/redundância pedida pelo atleta em 2026-09-08 sobre o sistema já publicado/validado (T13–T19). A implementação entrou no commit `5755724`, no mesmo commit que gravou o texto declarando a tarefa pendente; esta lista foi corrigida em 2026-09-09 para refletir o código real.

- [x] Decisão aplicada: ao reduzir repetições, corta duração (~10%) e carga (~16%) — a regra que era do treino de hoje.
- [x] Decisão aplicada: piso de repetições reconhecido é `2x` (regex único `/\b([2-9]|[1-9]\d)x\b/i`).
- [x] Função única `adjustWorkoutPlan` em `lib/decision-engine.ts`, com um único regex de cada tipo e um único template de recuperação leve (`recoveryRecommendation`).
- [x] `lib/readiness.ts` (`adaptWorkout`) chama essa função em vez de reimplementá-la.
- [x] `app/api/week/route.ts` (`futureProposal`) chama essa função em vez de reimplementá-la.
- [x] Teste de regressão sobre a função compartilhada em `tests/decision-engine.test.ts`. Ressalva registrada na SPEC: os três caminhos não são exercitados ponta a ponta, porque dois deles fazem I/O; a concordância é estrutural.
- [x] `npm test` e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta. Estado de publicação não confirmado a partir deste ambiente — a versão 25 saiu antes deste commit.

## Concluída no código — T21 Fechar o contexto unificado — SPEC-21

Mesmo caso da T20: implementada no commit `5755724`, lista corrigida em 2026-09-09.

- [x] Decisão aplicada: `runReadiness(owner, checkin, phase)` recebe a fase pronta; não consulta mais `mesocycle_anchor`.
- [x] Decisão aplicada: o limiar de "carga de ontem alta" é `Math.max(70, ctl * 1.5)`.
- [x] `lib/context-loader.ts` resolve a fase uma única vez por requisição e repassa a `runReadiness`.
- [x] `ReadinessResult` ganhou `reasonCode` (`atrasado`/`ausente`/`contraditorio`/`sessao_expirada`); `lib/context.ts` parou de inspecionar texto de `warning`.
- [x] `isYesterdayLoadHigh` em `lib/load-safety.ts`, reaproveitada por `readiness.ts` e `week/route.ts`.
- [x] Testes: `reasonCode` nos três casos de indisponibilidade (`tests/context.test.ts`); limiar único de carga (`tests/load-safety.test.ts`). A resolução única da fase por requisição é garantia estrutural, não coberta por teste.
- [x] `npm test` e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta. Estado de publicação não confirmado a partir deste ambiente.

## Parcialmente concluída — T22 Limpeza estrutural menor — SPEC-22

Os dois itens de código foram feitos em 2026-09-09. O único item restante é uma decisão do atleta sobre schema em produção.

- [ ] **Decisão do atleta, em aberto**: manter `mesocycle_phases` sem uso ou remover por migração?
- [x] `stressed` calculado uma única vez por requisição em `app/api/week/route.ts`, reaproveitado por `planOutlook` e `proposalBuilt`.
- [x] `SafetyFlag` definido uma única vez em `lib/load-safety.ts` (`LoadSafetyFlag`), importado por `lib/decision-engine.ts` e por `lib/off-day-suggestions.ts`, sem redefinição local.
- [ ] Decisão sobre `mesocycle_phases` registrada e, se for o caso, migração criada.
- [x] `npm test` e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta.

## Cancelada — T23 Fase inferida da carga planejada real — SPEC-23

**Substituída pela T28/SPEC-28 em 2026-09-09.** A intenção era a mesma — tirar a fase da âncora manual —, mas o caminho ficou melhor: em vez de inferir por tendência de carga planejada (que exigiria escolher janela de comparação e limiar de queda), a fase passou a ser lida do código `C{n}W{n}D{n}` que o atleta já escreve no nome do treino. Nenhuma das quatro decisões abaixo precisa mais ser tomada.

Direção original, registrada em 2026-09-08: ele monta os ciclos com apoio de IA e deixa a progressão pronta no calendário do Intervals.icu — a fase já está implícita na carga planejada, não precisa de âncora manual nem de regra fixa de 4 semanas.

- [ ] Decisão do atleta: quantas semanas anteriores entram na média de referência da carga planejada (ex.: 3 ou 4)?
- [ ] Decisão do atleta: qual limiar percentual de queda caracteriza semana de recuperação?
- [ ] Decisão do atleta: sem histórico suficiente, a fase fica "desconhecida" (bloqueia) ou assume "build" por padrão?
- [ ] Decisão do atleta: a âncora manual e o ponteiro C/W/D viram referência pessoal opcional na Evolução, ou saem da interface? `mesocycle_anchor` fica sem uso ou é removida?
- [ ] `lib/mesocycle.ts` ganha função pura (ex. `resolvePhaseFromLoad`) que decide a fase a partir da série de cargas planejadas semanais.
- [ ] Busca da carga planejada histórica no Intervals.icu entra no snapshot unificado (`lib/context-loader.ts`), uma única vez por requisição.
- [ ] `lib/readiness.ts`, `lib/decision-engine.ts` e `futureProposal` passam a receber a fase pela nova origem, sem mudar a assinatura de `preferVolumeReduction`.
- [ ] Interface atualizada conforme a decisão sobre âncora/C-W-D.
- [ ] Testes: queda clara de carga, carga estável/crescente, histórico insuficiente, limiares escolhidos.
- [ ] `npm test` e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta.

Estado em 2026-09-09: T20 e T21 concluídas no código; T22 só depende da decisão sobre `mesocycle_phases`; **T23 foi cancelada e substituída pela T28**, que resolve o mesmo problema lendo o código do nome do treino — as quatro decisões listadas acima não precisam mais ser tomadas.

## Concluída localmente — T24 Identidade visual em branco e lilás — SPEC-24

Pedida pelo atleta em 2026-09-09 a partir de uma referência visual, aprovada depois de ver uma proposta com as telas reais do app.

- [x] Paleta nova em `app/globals.css`: lilás como cor de interface, quase-preto para texto, fundo `#f1f1f5`.
- [x] Verde/amarela/vermelha restritas à prontidão, ao estado do dia e a avisos de risco — nunca decorativas.
- [x] Todos os gradientes removidos; preenchimento chapado em todo card.
- [x] Raio de canto padronizado: 24px card grande, 18px linha, 14px caixa interna.
- [x] `Programado → Recomendado` com o único preenchimento lilás forte da tela.
- [x] Duas cores de série do Recharts em `app/page.tsx` atualizadas (únicas cores fixas fora do CSS).
- [x] `themeColor` (`app/layout.tsx`), `theme_color`/`background_color` (`app/manifest.ts`) e `public/icon.svg` na paleta nova.
- [x] **Bug pré-existente corrigido**: `font-family` estava no `html`, mas `--font-manrope` é definida no `body` — o app renderizava em Times New Roman desde sempre. Movida para `body`; Manrope confirmada no navegador.
- [x] `npm test` (78) e `npm run build` validados.
- [x] Verificado visualmente no navegador local nas quatro abas (Hoje, Semana, Evolução, Glossário).
- [ ] Estados com dados reais (proposta pendente, sessões da semana, gráficos, histórico) não verificados — sem credenciais neste ambiente.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T25 O check-in não desaparece da avaliação — SPEC-25

Achado em auditoria pedida pelo atleta em 2026-09-09 ("posso confiar no sistema?").

- [x] `runReadiness` parou de gravar em `readiness_runs`; leitura não escreve histórico.
- [x] `recordReadinessRun` grava explicitamente, uma linha por atleta por dia (`UPDATE`, `INSERT` só se não existir), chamada só pelo `POST` de avaliação.
- [x] `loadReadiness` usa `POST` com o check-in em todos os casos — antes o refresh automático (abertura, `visibilitychange` e timer de 3 min) usava `GET` sem check-in e a tela revertia para uma leitura mais permissiva.
- [x] `checkinRef` elimina a defasagem de closure nos carregadores que rodam dentro de efeitos com dependências fixas.
- [x] Os três caminhos de confirmação usam a mesma referência, mantendo a simetria que a revalidação da SPEC-08 exige.
- [x] Verificado no navegador: carregamento e refresh automático enviam o check-in real do `localStorage`, não os defaults.
- [x] `npm test` (78) e `npm run build` validados.
- [ ] Sem cobertura automatizada: o runner não alcança `lib/readiness.ts` (depende do D1 e do alias `@/`). Um duplo de D1 nos testes fica como tarefa própria.
- [ ] Linhas duplicadas de dias anteriores não foram reescritas — não há como saber qual refletia o check-in real.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T26 Uma avaliação por requisição e um teste que pode falhar — SPEC-26

- [x] `context()` em `app/api/week/route.ts` aceita o contexto do atleta já carregado; o `POST` avalia a prontidão uma vez só (era duas), caindo de ~16 para ~11 chamadas externas por confirmação. `GET` inalterado.
- [x] Teste tautológico substituído pela invariante real: mesmo treino como `description` e como `structure` deve produzir o mesmo ajuste.
- [x] Teste validado por mutação — quebrando a leitura de `structure` ele falha; restaurando, passa.
- [x] `npm test` (79) e `npm run build` validados.
- [ ] **Pergunta em aberto para o atleta**: no piso de `2x` a justificativa diz "Repetições reduzidas de 2 para 2" sem reduzir repetição alguma. `2x` deveria cair para redução de intensidade? Contraria a decisão 2 da SPEC-20, por isso não foi mexido.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T27 Evolução essencial e progressiva — SPEC-27

Pedida pelo atleta em 2026-09-09: "a tela de evolução está muito poluída". Eram sete cards no mesmo nível, dois deles formulários, nada sob expansão.

- [x] Card "Direção da temporada" removido da aba Evolução, junto com o estado, `loadGoal`, `saveGoal` e o tipo `AthleteGoal`.
- [x] Teto de rampa fixado em `CTL_RAMP_LIMIT = 6` (`lib/load-safety.ts`); `lib/readiness.ts` parou de consultar `athlete_safety_settings` — uma consulta a menos por avaliação.
- [x] Perfil dos 42 dias virou uma linha dentro da leitura diária; o card próprio saiu.
- [x] "Posição no plano" subiu para o primeiro nível. O formulário da âncora continua ali até a T28.
- [x] Potências, coração × potência e padrão pessoal agrupados sob a expansão "Ver números e gráficos", reaproveitando o padrão visual da SPEC-19.
- [x] Ressalva sobre tendências movida para o rodapé da expansão.
- [x] Verificado no navegador: 3 blocos no primeiro nível (eram 7), 1 expansão, formulário de objetivo ausente, nenhum erro de página.
- [x] `npm test` (79) e `npm run build` validados.
- [ ] `/api/profile` e `athlete_goals` continuam existindo sem interface. Remover a rota e a tabela é decisão à parte, não feita aqui.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente — T28 A fase do mesociclo vem do nome do treino — SPEC-28

Substitui a T23/SPEC-23, que ia inferir a fase pela carga planejada.

- [x] Decisão do atleta: sem o código `C{n}W{n}D{n}` no nome, herda o último ciclo conhecido.
- [x] `resolveMesocycleFromEvents` e `anchorFromEvent` em `lib/mesocycle.ts`, puras e testadas. `parseCyclePointer` já sabia ler o padrão — só nunca era alimentado.
- [x] `lib/context-loader.ts` busca 28 dias de eventos uma única vez por requisição e resolve a fase daí; parou de ler `mesocycle_anchor`.
- [x] `app/api/mesocycle/route.ts` virou somente leitura, sem `PUT`.
- [x] Formulário de âncora removido da tela; no lugar, de qual treino a fase foi lida e se a contagem foi herdada.
- [x] Testes: código hoje, herança com virada de semana, ausência total de código, eventos futuros ignorados.
- [x] `npm test` (85) e `npm run build` validados; verificado no navegador.
- [ ] `mesocycle_anchor` fica sem uso, como `mesocycle_phases`. Remover por migração é a mesma decisão em aberto da T22.
- [ ] Não publicar sem nova ordem do atleta.

## Pendência — unificar a chamada ao Intervals.icu

`lib/intervals.ts` nasceu na T28 como casa compartilhada, mas `lib/readiness.ts`, `app/api/week/route.ts` e `app/api/performance/route.ts` mantêm cópias próprias do mesmo helper, anteriores a ele.

- [ ] Migrar os três para `intervalsFetch`, sem mudar comportamento.

## Concluída localmente — T29 ACWR vem do Intervals.icu — SPEC-29

- [x] Decisão do atleta: manter o Intervals.icu como fonte de verdade.
- [x] Limiares mantidos em 1,3 e 1,5 — são os convencionais para a métrica nas duas formas de cálculo, então a régua não mudou junto com a origem.
- [x] `acwrFromIntervals(atl, ctl)` em `lib/load-safety.ts`; `evaluateLoadSafety` usa esse valor e informa a fonte em `acwrSource`.
- [x] Cálculo local de média móvel mantido como reserva explícita para quando faltar `atl` ou `ctl`.
- [x] Rampa segue local; removido o `?? ramp` que fazia `metrics.ramp` carregar duas definições conforme o dia.
- [x] Testes cobrindo razão, entradas inválidas, precedência da fonte externa e queda para a reserva.
- [x] `npm test` (88) e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta.

## Pergunta de produto em aberto — ACWR e rampa deveriam mexer na prontidão?

O texto da SPEC-12 se contradiz: um parágrafo diz que os dois flags participam da composição de severidade do semáforo, o aceite da mesma SPEC diz que nada muda na decisão do dia. O código seguiu o aceite — os flags são sinal, não entram em `flag(...)`.

- [ ] Decisão do atleta: ACWR e rampa elevados deveriam puxar a prontidão do dia para amarela, ou continuam apenas explicando?

## Concluída localmente — T30 O gráfico vazio explica a própria ausência — SPEC-30

O atleta perguntou por que coração × potência aparece vazio se o histórico existe no Intervals.icu. Em vez de depender de uma investigação com as credenciais dele, o app passou a se autodiagnosticar.

- [x] `app/api/performance/route.ts` expõe `cardioCoverage`: total de pedais dos últimos 42 dias, quantos têm potência, quantos têm FC e quantos têm as duas na mesma atividade.
- [x] O estado vazio diz o número exato de cada caso em vez de repetir a exigência genérica.
- [x] Frase construída para não quebrar concordância no singular ("1 com potência", não "1 têm potência").
- [x] Verificado no navegador com cenário simulado; `npm test` (88) e `npm run build` validados.
- [ ] Não publicar sem nova ordem do atleta.

## Fora de alcance com a infraestrutura atual — cobertura de `lib/readiness.ts`

Levantado ao tentar fechar a lacuna de teste da SPEC-25. Não é uma melhoria pequena, é decisão de infraestrutura:

- `lib/polar.ts` importa `cloudflare:workers`, módulo que só existe no runtime do Workers. Sob `node --test` o import falha antes de qualquer teste rodar.
- `runtime = env` é o binding do Workers, não um objeto injetável — não dá para substituir `runtime.DB` por um duplo sem reestruturar `polar.ts`.
- Um duplo de D1 exigiria adotar `vitest` + `@cloudflare/vitest-pool-workers` (nenhum dos dois está no projeto) e conviver com dois runners, ou migrar os 79 testes.
- Decisão do atleta necessária antes de qualquer coisa: vale adotar essa infraestrutura?

Regra: trabalhar somente na tarefa marcada como `NEXT`.

## Concluída localmente — T31 Semana: o que pede ação fica; o que explica recolhe — SPEC-31

Auditoria da aba Semana pedida em 2026-09-09, depois da faxina da Evolução. São até onze cards no mesmo nível — mais que os sete da Evolução antes da T27.

- [x] Primeiro nível: resumo e lista da semana, mais os blocos que pedem ação — proposta, alerta de risco, sugestão de dia OFF e aviso de dados contraditórios. Seis blocos no cenário mais cheio, contra até onze.
- [x] Expansão única "Ver leitura da semana": previsão, prévia do motor e histórico de decisões.
- [x] Card de panorama removido. `stressed` é booleano da semana inteira, não por sessão — o card repetia a mesma condição em três linhas. Virou uma frase.
- [x] Verificado no navegador com proposta e alerta ativos: os dois visíveis sem abrir nada; previsão e histórico recolhidos.
- [x] `npm test` (88) e `npm run build` validados.
- [ ] **Pergunta ainda aberta**: a prévia do motor adaptativo deve ser removida de vez? Ela recolheu para a expansão porque a resposta ("sim") não distinguiu entre remover e recolher, e recolher é reversível.
- [ ] Não publicar sem nova ordem do atleta.
