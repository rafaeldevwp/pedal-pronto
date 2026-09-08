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

## Concluída localmente (parcial) — T14 Criar o motor adaptativo — SPEC-14

- [x] Integrar fase C/W/D, objetivo, recuperação, ACWR e rampa (`lib/decision-engine.ts`, função pura `decideTraining`).
- [x] Gerar proposta determinística e explicável sem escrita automática: retorna `action`, `stimulusPreserved`, `reasons[]` e `recommended`, nunca escreve em nada.
- [x] Respeitar as regras imutáveis: amarela nunca passa de uma variável mesmo com ACWR/rampa severos; vermelha sempre substitui por recuperação, mesmo em fase de build; verde nunca aumenta, no máximo é tratado como cautela quando a carga agregada está severa.
- [x] Fase influencia qual variável cede primeiro: build/peak preserva intensidade e reduz volume; recovery/deload preserva duração e reduz intensidade primeiro.
- [x] Treino concluído é somente leitura: `app/api/week/route.ts` só passa o treino de hoje ao motor quando `status !== 'realizado'`.
- [x] Dias de descanso fixo e ausência de treino planejado nunca geram proposta.
- [x] Testar cenários fisiológicos e fases do ciclo com fixtures fixas: `tests/decision-engine.test.ts`, 13 casos (verde, amarela, vermelha, build, recovery, treino-chave próximo, dados bloqueados, descanso, sem treino, estrutura não reconhecida, especificidade protegida).
- [x] Ligado como campo de leitura `engineDecision` em `app/api/week/route.ts`, usando dados já carregados pelo snapshot (fase, objetivo, safety flags, próximo treino-chave) — sem chamada de rede extra.
- [x] Reutilizar confirmação, revalidação e idempotência da SPEC-08: decidido com o atleta que o motor só atua em dia planejado futuro (mesmo alvo do replanejamento semanal já existente), nunca competindo com a proposta de hoje do `readiness.ts`. Em vez de criar uma rota de escrita nova e concorrente, extraí `preferVolumeReduction(phase, objective, protectSpecificity)` de `lib/decision-engine.ts` e passei a reaproveitá-la dentro de `futureProposal` (`app/api/week/route.ts`), que já usa o fluxo de escrita inteiro da SPEC-08 (`claimTrainingWrite`, `assertEditablePlannedEvent`, `proposalFingerprint`). A fase real do mesociclo agora decide, também na proposta futura de verdade, se reduzir volume ou intensidade primeiro — antes só o objetivo decidia isso.
- [ ] Modelar estímulo principal da semana e carga-alvo como conceito próprio (taxonomia de estímulo — endurance/limiar/VO2max): ainda não existe; o motor de hoje decide por sessão isolada, sem saber quais estímulos a semana já entregou. Fica para quando a T15/T16 amadurecerem essa taxonomia.
- [x] Testes: `preferVolumeReduction` cobre build/peak, recovery/deload e fase desconhecida (3 casos novos em `tests/decision-engine.test.ts`).
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente (parcial) — T15 Evoluir sugestões de dias OFF — SPEC-15

- [x] Criar biblioteca de sessões opcionais e descanso completo (`lib/off-day-suggestions.ts`): descanso, mobilidade, recuperação ativa, técnica/cadência e endurance leve — cinco categorias, contra as três de antes (descanso nunca existia como opção explícita).
- [x] Selecionar sugestão por contexto: prontidão, ACWR/rampa (a versão anterior não olhava para nenhum sinal de carga), fase do mesociclo, dor/sintomas do check-in, cadência recente e volume/intensidade recentes.
- [x] Não sugerir intensidade diante de dor, sintomas, ACWR/rampa severos ou treino-chave muito próximo: vira descanso completo ou recuperação ativa, nunca técnica/endurance.
- [x] Evitar repetir automaticamente a mesma categoria duas vezes seguidas sem justificativa nova, usando o histórico de decisões já existente (`training_decisions`).
- [x] Exibir benefício, custo de carga e impacto no próximo treino em todo caso — inclusive quando a sugestão é descanso completo, com framing positivo ("parte do plano, não uma falha"), nunca como ausência de resposta.
- [x] Confirmação antes de enviar ao Intervals.icu: já garantida pelo fluxo `create_suggestion` existente (`assertDayAvailableForCreation` + `claimTrainingWrite`), inalterado.
- [x] Testes: `tests/off-day-suggestions.test.ts`, 12 casos (5 categorias, dor/sintomas, ACWR severo, treino-chave próximo, fase de recuperação, anti-repetição, framing positivo do descanso).
- [x] Check-in (dor/sintomas) e proximidade real do próximo treino-chave (dias/risco) agora chegam de verdade em `app/api/week/route.ts`: o cálculo da sugestão foi movido para depois do `forecast` (que já calcula `daysToKey`/`forecastRisk`), e o check-in passou a viajar como query string em `GET /api/week` (`loadWeek()` no cliente) e no corpo do `POST` de `create_suggestion`/`apply_proposal`, sempre com o mesmo valor em ambos os lados para a revalidação da SPEC-08 não divergir do que foi mostrado.
- [ ] Modelar lacuna de estímulo (endurance/limiar/VO2max já entregues na semana): depende da mesma taxonomia de estímulo pendente da T14.
- [ ] Não publicar sem nova ordem do atleta.

## Concluída localmente (parcial) — T16 Fechar o ciclo pós-treino — SPEC-16

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

## Concluída localmente (parcial, não verificada visualmente) — T17 Integrar a experiência do produto — SPEC-17

Escopo pequeno e aditivo nesta rodada — não é o redesenho completo pedido pela SPEC-17:

- [x] `app/page.tsx`: tipo `Week` ganhou `mesocycle`, `contextWarning` e `engineDecision`, espelhando o backend das T13/T14.
- [x] Card novo "Dados contraditórios / nenhuma proposta gerada" quando `week.contextWarning` existe e não há proposta — antes disso, um bloqueio por divergência de mesociclo não tinha nenhuma explicação na tela de Semana.
- [x] Card novo "Leitura do motor adaptativo · prévia" mostrando a ação, os motivos e a mudança recomendada da T14, deixando explícito que é somente leitura ("Só leitura", sem botão de ação) — não introduz um segundo calendário nem uma segunda fonte de verdade, é só uma anotação em cima do que já existe.
- [x] CSS novo (`.context-warning-card`, `.engine-preview-card`) seguindo o padrão visual já usado por `.proposal-card`/`.forecast-card`.
- [x] `npm run build` validado (compila e gera as rotas normalmente).
- [ ] **Não verificado visualmente no navegador**: tentei subir `npm run dev` e abrir no Browser pane, mas o ambiente local não tem credenciais reais de Polar/Intervals.icu nem o cabeçalho de usuário autenticado da hospedagem — o atleta confirmou que não valeria a pena insistir nisso aqui. Ou seja, o build passou, mas ninguém olhou a tela de verdade. Isso precisa ser conferido no ambiente real antes de publicar.
- [ ] Redesenho completo da hierarquia Hoje/Semana/Evolução: não feito. As telas continuam com a estrutura de antes; só ganharam os dois cards acima.
- [ ] Auditoria completa de estados de carregamento, ausência, atraso, conflito e erro em todas as telas: não feito — só o caso específico de `snapshot.blocked` ganhou orientação nova.
- [ ] Validação de acessibilidade, PWA e notificações após as mudanças: não feito, depende da verificação visual acima.
- [ ] Não publicar sem nova ordem do atleta.

Ordem obrigatória: T13 → T14 → T15 → T16 → T17. Trabalhar e validar uma tarefa por vez; publicar apenas mediante ordem explícita.

Regra: trabalhar somente na tarefa marcada como `NEXT`.
