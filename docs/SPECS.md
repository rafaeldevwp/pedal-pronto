# SPECs do produto

## SPEC-01 — Objetivo orienta decisões

Status: concluída

O objetivo, evento, data e prioridade devem influenciar qual estímulo preservar. FTP preserva intensidade quando possível; resistência preserva duração; saúde favorece consistência. Nas três semanas antes de uma meta principal, preservar especificidade e reduzir primeiro o volume. Nunca aumentar carga por prontidão verde.

Aceite: relatório explica o objetivo considerado; ajustes de hoje e propostas futuras usam a mesma regra; segurança sempre prevalece.

## SPEC-02 — Comparação de sessões semelhantes

Status: concluída

Comparar cada treino concluído com sessões pessoais semelhantes por estrutura, duração e intensidade. Traduzir potência, FC, cadência, desacoplamento, RPE e carga em linguagem simples.

Aceite: mostrar grupo de comparação, diferença relevante, confiança e limite dos dados.

## SPEC-03 — Aprendizado individual

Status: concluída

Aprender associações recorrentes entre sono, HRV, FC, carga e desempenho, sem diagnóstico e sem afirmar causalidade com pouca evidência.

Aceite: exigir amostra mínima, mostrar confiança e permitir que dados insuficientes suspendam conclusões.

## SPEC-04 — Check-in ampliado

Status: concluída

Adicionar pernas, motivação, sintomas e tempo disponível aos campos existentes. Sintomas ou dor relevante devem bloquear intensificação e favorecer recomendação conservadora.

## SPEC-05 — Previsão dos próximos dias

Status: concluída

Estimar como o treino de hoje afeta a viabilidade do próximo treino-chave. A previsão deve ser faixa de risco, não promessa.

## SPEC-06 — Histórico de decisões

Status: concluída

Registrar original, recomendação, decisão, alteração efetiva e resultado posterior. Nunca modificar o histórico.

## SPEC-07 — Alertas de risco futuro

Status: concluída

Notificar quando um treino futuro entrar em risco. O alerta não aplica mudança; oferece acesso à proposta para confirmação.

## SPEC-08 — Consentimento obrigatório antes de alterar o Intervals.icu

Status: concluída e publicada

Nenhuma avaliação, atualização manual, automação diária ou alerta pode modificar, substituir, cancelar ou criar um treino no Intervals.icu sem uma confirmação explícita do atleta para aquela mudança específica. A regra vale para hoje e para dias futuros e substitui a permissão automática anterior. A avaliação pode gerar uma proposta, mas deve permanecer somente leitura até a confirmação.

Atividades e treinos já concluídos no Intervals.icu são permanentemente somente leitura para o Pedal Pronto. Mesmo com confirmação do atleta, o app nunca pode editar, substituir, cancelar, apagar ou sobrescrever uma atividade realizada nem seus dados históricos. A adaptação só pode apontar para um evento planejado que ainda não foi executado.

Fluxo obrigatório:

- Mostrar `Programado → Recomendado`, mudança exata, duração, carga e justificativa.
- Exigir uma ação separada e inequívoca: `Confirmar e enviar ao Intervals.icu`.
- No servidor, separar os comandos de avaliar, propor e aplicar; atualizar dados ou executar a automação nunca pode alcançar o caminho de escrita.
- Revalidar a proposta e o treino original imediatamente antes da escrita. Se mudaram, cancelar a operação e pedir nova revisão.
- Antes de qualquer escrita, consultar novamente eventos e atividades do Intervals.icu e bloquear a operação se o treino já tiver sido concluído, tiver atividade associada ou tiver deixado de ser um evento futuro editável.
- Tornar a confirmação idempotente para impedir aplicação duplicada por toque repetido, repetição de rede ou atualização da página.
- Registrar proposta, consentimento e resultado no histórico imutável.
- Emitir `TREINO ALTERADO —` somente depois de o Intervals.icu confirmar a escrita.

Aceite:

- Atualizar prontidão, salvar check-in, abrir o PWA e executar a rotina agendada não alteram o calendário.
- Nenhuma requisição sem consentimento específico consegue executar `POST` ou `PUT` de treino.
- Uma proposta amarela/vermelha permanece pendente até confirmação.
- Cancelar, fechar ou ignorar a proposta mantém o treino original.
- Um treino concluído permanece byte a byte intocado, mesmo se ainda existir um evento planejado na mesma data ou se chegar uma confirmação atrasada.
- O servidor rejeita qualquer tentativa de escrita cujo alvo seja atividade, histórico ou evento já executado; a interface explica que somente treinos planejados podem ser adaptados.
- Testes regressivos cobrem verde, amarela, vermelha, descanso, dados incompletos, clique duplo e conflito com alteração feita diretamente no Intervals.icu.
- Testes regressivos adicionais cobrem atividade concluída antes da avaliação, concluída entre proposta e confirmação, dois treinos no mesmo dia e sincronização atrasada.

## SPEC-09 — Slider do check-in permanece utilizável em zero

Status: concluída e publicada

Todos os controles do check-in devem manter trilho, indicador, botão deslizante, valor e área de toque visíveis quando o valor for zero ou estiver em qualquer extremo. Zero é um valor válido e deve ser enviado e salvo como zero, nunca interpretado como ausente.

Aceite:

- Em zero, o botão não desaparece, não é cortado e continua arrastável.
- O controle funciona por toque, mouse e teclado em celular e desktop.
- Valores zero de fadiga, dor, estresse, pernas, motivação, sintomas e tempo disponível permanecem após salvar e reabrir o PWA.
- O valor mostrado coincide com o valor enviado ao motor de prontidão.
- Há contraste, foco visível, alvo de toque adequado e rótulo acessível.
- Testes regressivos cobrem mínimo, máximo, ida e volta ao zero, recarga da página e tamanhos de tela móvel.

## SPEC-10 — Glossário contextual de fisiologia e treinamento

Status: concluída e publicada

Criar um glossário em linguagem simples para todos os termos técnicos exibidos pelo Pedal Pronto. A explicação deve estar disponível no contexto em que a métrica aparece e também em uma área única de consulta. O objetivo é ajudar atletas leigos a entender o dado sem transformar a métrica isolada em diagnóstico ou ordem de treino.

Conteúdo inicial:

- Recuperação: HRV, frequência cardíaca de repouso, ANS Charge, Nightly Recharge, duração do sono, qualidade do sono, interrupções e regularidade.
- Carga: fitness/CTL, fadiga/ATL, forma, rampa, carga cardiovascular, carga do treino e carga acumulada.
- Treino: potência média, potência normalizada/ponderada, intensidade, cadência, RPE, eficiência potência–coração e desacoplamento aeróbico/cardíaco.
- Planejamento: prontidão verde/amarela/vermelha, treino-chave, especificidade, volume, intensidade, densidade, endurance e recuperação ativa.

Cada verbete deve informar:

- Nome completo, sigla e unidade quando houver.
- O que representa em linguagem cotidiana.
- Como o Pedal Pronto usa a informação.
- O que geralmente significa subir, cair ou permanecer estável, deixando claro quando “maior” não significa necessariamente “melhor”.
- Por que a linha de base individual e a tendência importam mais que um valor isolado.
- Fonte do dado: Polar, Intervals.icu, cálculo do app ou percepção do atleta.
- Limitações, fatores que podem distorcer a medida e aviso médico quando pertinente.

Aceite:

- Todo termo técnico visível possui acesso ao verbete por ícone de informação, toque ou link “Entenda”.
- Tooltips são curtos; a área completa oferece busca, categorias e referências cruzadas.
- O glossário funciona por toque, teclado e leitor de tela e não depende de hover.
- As explicações usam exemplos pessoais sem criar faixas universais ou diagnóstico.
- Termos e definições são centralizados em uma única fonte para evitar textos divergentes entre telas.
- Ausência de dado, unidade ou fonte é apresentada explicitamente, sem inferência inventada.
- Testes verificam abertura no celular, foco, busca, links contextuais e consistência de cada termo usado no produto.

## SPEC-11 — Fase do mesociclo e ponteiro de estado C/W/D

Status: concluída e publicada

Resolver a fase do mesociclo (base, build, peak, recovery ou outra nomenclatura) e a posição atual dentro do plano (ciclo, semana, dia) sem depender só do nome do evento no Intervals.icu. Hoje a semana em `app/api/week/route.ts` é agrupada apenas por data corrida, de segunda a domingo; não existe parser de `C{n}W{n}D{n}` nem vínculo com mesociclo ou fase.

Duas tabelas novas no D1, no mesmo padrão de `athlete_goals`: `mesocycle_phases` (uma linha por ciclo e semana, com a fase correspondente) e `mesocycle_anchor` (uma linha por atleta, com a data em que C1W1D1 começou). Uma rota nova, `app/api/mesocycle/route.ts`, segue o mesmo contrato de leitura e escrita por atleta de `app/api/profile/route.ts`.

Um módulo novo, `lib/mesocycle.ts`, calcula o ciclo/semana/dia de hoje a partir da âncora e da contagem de dias corridos, considerando quatro semanas de sete dias por ciclo, resolve a fase consultando o mapa cadastrado, e faz a conferência cruzada com o `C{n}W{n}D{n}` extraído do nome do evento do dia quando existir. Divergência entre o valor calculado e o extraído do evento nunca é corrigida automaticamente — apenas retornada como aviso explícito, preservando a regra do produto de nunca alterar nada sem confirmação. Ausência de fase cadastrada para o ciclo e semana atuais resulta em fase desconhecida explícita, nunca em uma fase assumida por padrão.

Esta SPEC entrega apenas o dado resolvido — ciclo, semana, dia, fase e aviso de divergência quando houver. Não decide nada sobre o treino do dia; isso pertence ao motor de decisão que ainda vai consumir esse dado.

Aceite:

- Dado um valor de âncora e uma data de hoje conhecida, `lib/mesocycle.ts` calcula ciclo, semana e dia corretamente, incluindo virada de semana e de ciclo.
- Dado um mapa de fases cadastrado, a fase resolvida bate com o ciclo e a semana calculados.
- Evento com nome no padrão `C{n}W{n}D{n}` batendo com o valor calculado não gera aviso de divergência.
- Evento com nome no padrão mas valor divergente gera aviso de divergência, sem qualquer alteração automática.
- Evento sem o padrão no nome, como folga ou descanso, segue apenas com o valor calculado, sem erro.
- Ciclo e semana sem fase cadastrada retornam fase desconhecida explícita.
- `GET` e `PUT` de `app/api/mesocycle/route.ts` seguem o mesmo contrato de autenticação e escopo por atleta de `app/api/profile/route.ts`.
- Nenhuma mudança de comportamento em `app/api/week/route.ts` ou em qualquer decisão de treino existente; a SPEC é só aditiva.
- A âncora atual permanece visível de forma proeminente na tela de edição, não só editável, para um desvio ser notado rapidamente.

## SPEC-12 — ACWR e ramp rate do CTL como checagem de segurança

Status: concluída e publicada

Hoje o ramp rate já é lido em `lib/readiness.ts` e exposto em `metrics`, mas nunca entra na função que acumula os flags de severidade — é puramente decorativo, sem peso na classificação verde, amarela ou vermelha.

Calcular o ACWR, razão entre a soma de TSS dos últimos sete dias e a média semanal dos últimos vinte e oito dias, e o ramp rate do CTL, variação do CTL na janela de referência comparada a um teto configurável com padrão entre cinco e oito por semana conforme a literatura de referência, e somar dois novos flags à função `flag(...)`: um para ACWR elevado, com severidade moderada entre 1.3 e 1.5 e severa acima de 1.5, e um para ramp rate acima do teto configurado. Os dois participam da composição de severidade do semáforo do mesmo jeito que os flags já existentes hoje — somam, não substituem. Ambos os valores calculados passam a ser expostos em `metrics`, ao lado do que já é exposto hoje.

Fica fora desta SPEC qualquer ajuste automático de treino a partir desses flags — isso pertence ao motor de decisão que ainda vai consumir esses valores como entrada, incluindo qualquer regra que condicione antecipação de carga em dia verde ao teto de ramp rate.

Aceite:

- Dado um histórico de TSS de vinte e oito dias conhecido, o ACWR calculado bate com a fórmula de referência.
- Um dia com ACWR acima de 1.3 gera o flag correspondente com a severidade correta.
- Um dia com ramp rate acima do teto configurado gera o flag correspondente.
- ACWR e ramp rate aparecem no payload de `metrics` sem quebrar o schema existente.
- Nenhuma mudança de comportamento na decisão de treino do dia; a SPEC só adiciona sinal.
- Dias sem violação de ACWR ou de ramp rate mantêm o semáforo e os flags existentes idênticos aos de hoje.
- O teto de ramp rate é parametrizável, não fixo no código, prevendo calibração pessoal futura.

## SPEC-13 — Contexto unificado e explicável do atleta

Status: aprovada; pronta para implementação

Criar um snapshot diário único que reúna, sem duplicar as fontes existentes: prontidão e tendência do Polar; atividades, calendário, CTL, ATL, forma, TSS e carga do Intervals.icu; objetivo da temporada; posição C/W/D e fase do mesociclo; ACWR e rampa; check-in e disponibilidade do atleta. Cada campo deve carregar valor, data da última atualização, fonte e estado de qualidade (`válido`, `atrasado`, `ausente` ou `contraditório`).

O snapshot será a entrada comum dos módulos de decisão, feedback e interface. Ele não modifica treino, não preenche lacunas com valores inventados e suspende recomendações quando faltar um dado obrigatório para aquela decisão. O Intervals.icu continua sendo a fonte oficial do plano e atividades.

Aceite:

- Uma mesma execução usa um único snapshot versionado, evitando que telas ou decisões combinem horários diferentes.
- O payload informa proveniência e atualização de Polar, Intervals.icu, D1 e check-in.
- Âncora/fase ausente, sessão expirada e sincronização atrasada aparecem explicitamente.
- Dados contraditórios geram aviso e impedem proposta de escrita.
- O snapshot é somente leitura, testável com fixtures e reutilizado pelos módulos seguintes.
- Nenhuma regressão nas proteções da SPEC-08.

## SPEC-14 — Motor adaptativo orientado por fase, objetivo e carga

Status: planejada; depende da SPEC-13

Transformar o snapshot em uma proposta de decisão que preserve a intenção do plano. O motor deve compreender o papel do treino dentro da fase do mesociclo, o estímulo principal da semana, o próximo treino-chave, a carga-alvo e o objetivo da temporada. Ele pode propor manter, reduzir uma variável, substituir conservadoramente ou redistribuir uma sessão futura, mas nunca escrever no Intervals.icu sem confirmação específica.

Verde mantém o treino do dia; boa prontidão isolada não aumenta a sessão. Amarela altera no máximo uma variável. Vermelha favorece recuperação, endurance leve ou descanso. ACWR, rampa e fase são sinais combinados, nunca ordens isoladas. A proteção contra platô deve atuar no planejamento progressivo, não como licença para aumentar carga diariamente.

Aceite:

- A resposta mostra `Programado → Recomendado`, estímulo preservado, mudança exata, duração, carga e efeito esperado na semana.
- A justificativa cita os sinais determinantes, a fase e o objetivo, em linguagem simples.
- O motor distingue risco agudo de recuperação de necessidade crônica de progressão.
- Dias e limites fixos do atleta continuam preservados.
- Treino concluído é somente leitura e proposta expirada exige nova avaliação.
- Aplicação depende do fluxo idempotente de consentimento da SPEC-08.
- Cenários fixos cobrem verde, amarela, vermelha, deload, build, treino-chave e dados incompletos.

## SPEC-15 — Sugestões OFF variadas e compatíveis com o plano

Status: planejada; depende das SPECs 13 e 14

Substituir a sugestão repetitiva dos dias OFF por uma biblioteca de sessões opcionais e um seletor contextual. A sugestão deve considerar fase, estímulos realizados e planejados, lacunas recentes, recuperação, tempo disponível, carga semanal e proximidade do próximo treino-chave. Descanso completo permanece uma recomendação válida e nunca deve ser apresentado como falha.

Aceite:

- Sugestões variam entre descanso, mobilidade, recuperação ativa, técnica/cadência e endurance leve conforme o contexto.
- O app explica benefício provável, custo de carga e possível impacto no próximo treino.
- Não sugere intensidade em dia de descanso diante de fadiga, dor, sintomas, ACWR/rampa elevados ou treino-chave próximo.
- Evita repetir automaticamente a mesma sessão sem justificativa contextual.
- `Fazer este treino` abre comparação e confirmação antes de criar o evento no Intervals.icu.
- Ignorar a sugestão não altera o plano nem gera mensagem de culpa.

## SPEC-16 — Ciclo pós-treino: feedback, atualização e impacto futuro

Status: planejada; depende da SPEC-13

Ao detectar uma nova atividade concluída, atualizar os dados usados pelo PWA e produzir feedback simples sobre como o treino foi absorvido e executado. Comparar realizado versus planejado e histórico pessoal semelhante usando carga, potência, frequência cardíaca, cadência, RPE, eficiência e desacoplamento quando disponíveis. Depois, recalcular o risco do próximo treino-chave e gerar apenas uma proposta caso a nova carga mude materialmente a semana.

Aceite:

- A atividade concluída recebe rótulo claro de `Realizado` e permanece imutável.
- O feedback prioriza uma conclusão simples, até três evidências e uma orientação prática.
- Dificuldade é inferida por sinais combinados e percepção, nunca por potência ou FC isolada.
- Métricas ausentes reduzem a confiança e não são inventadas.
- Uma sessão extra ou mais pesada atualiza carga, ACWR, rampa e previsão do próximo treino.
- Alterações futuras continuam sendo propostas explícitas e dependem de confirmação.
- Processamento repetido da mesma atividade não duplica feedback, histórico ou alertas.

## SPEC-17 — Experiência integrada “Hoje → Semana → Evolução”

Status: concluída, validada e autorizada para publicação em 2026-09-08

Reorganizar a experiência para que o atleta atravesse um fluxo único: entender seu estado hoje, ver o treino e a eventual adaptação, compreender o efeito sobre a semana e acompanhar a evolução. Reaproveitar os componentes atuais de prontidão, recuperação, treinos, evolução e glossário, reduzindo repetição e mantendo detalhes técnicos em segundo nível.

Aceite:

- A tela Hoje apresenta decisão, treino, contexto da fase e ação principal sem exigir navegação técnica.
- A Semana mostra original, recomendado e efetivo com carga-alvo versus realizada.
- Evolução separa estado de hoje, tendência de adaptação e direção do ciclo.
- Toda métrica técnica possui explicação contextual centralizada no glossário.
- Estados de carregamento, dados atrasados, sem conexão e conflito têm orientação acionável.
- A interface móvel preserva acessibilidade, instalação PWA e notificações já existentes.
- Nenhum componente introduz um segundo calendário ou uma segunda fonte de verdade.

## SPEC-18 — Fase do mesociclo substitui objetivo como orientador de carga

Status: concluída, validada e autorizada para publicação em 2026-09-08

Status: concluída localmente

Hoje o "objetivo" da temporada (`performance`/`resistência`/`ftp`/`saúde`, salvo em `athlete_goals` junto com evento, data e prioridade) decide, em três lugares independentes, qual variável do treino cede primeiro quando a prontidão pede cautela — reduzir intensidade ou reduzir repetições/volume. Os três lugares divergem entre si: `lib/readiness.ts` (`adaptWorkout`), que decide de fato a adaptação do treino de hoje, usa só objetivo e "especificidade protegida" (dias até o evento principal) e não sabe nada sobre a fase do mesociclo; `lib/decision-engine.ts` (`preferVolumeReduction`), usado pela prévia do motor adaptativo e pelo replanejamento futuro que já escreve no Intervals.icu, cruza fase do mesociclo com objetivo; e o texto "objetivo de X considerado" mais o mapa de nomes do objetivo (`objectiveNames`) estão copiados em três arquivos, sem fonte única.

Decisões do atleta que fecham esta SPEC:

1. **Objetivo vira puramente narrativo.** O campo "objetivo" (e evento/data/prioridade) continua existindo só na tela "Direção da temporada" (aba Evolução), como contexto da temporada — deixa de influenciar qualquer decisão de treino. `lib/readiness.ts`, `lib/decision-engine.ts` e `futureProposal` param de ler `objetivo` para decidir intensidade vs. volume, e o texto associado a ele some das justificativas de treino (ele nunca foi, de qualquer forma, uma "incentivo automático a treinar mais" — ver `docs/DESIGN.md`, seção Vocabulário — então isso só reforça o princípio já declarado).
2. **"Especificidade protegida" é removida por completo.** Não vira uma fase nomeada nem continua como cálculo separado por data de evento — o conceito inteiro (reduzir volume antes da intensidade nos 21 dias antes de um evento principal) deixa de existir.
3. **A fase deixa de ser cadastrada manualmente.** O mapa de fases por ciclo/semana (`mesocycle_phases`, editado à mão na tela Evolução) é substituído por uma regra fixa e automática, aplicada a partir da semana do ciclo (`W`, sempre 1 a 4, já calculada pela âncora): semanas 1, 2 e 3 são fase de progressão ("build" — protege intensidade, cede volume primeiro); semana 4 é fase de recuperação ("recovery" — protege duração, cede intensidade primeiro). Fase só continua "desconhecida" quando não há âncora configurada (não há como calcular a semana); a partir do momento em que existe âncora, a fase é sempre determinística — nunca mais bloqueia nem pede cadastro manual.
4. **O teto de rampa do CTL (`rampRateLimit`, SPEC-12) não muda** — continua na mesma tabela/tela, independente de tudo isso.

Regra final: existe uma única função, `preferVolumeReduction(phase)`, chamada por `lib/readiness.ts` (treino de hoje, que passa a considerar fase pela primeira vez), `lib/decision-engine.ts` (prévia do motor) e `futureProposal` (replanejamento futuro aplicado) — hoje são três decisões independentes, com apenas uma delas enxergando fase. `objectiveNames` e toda menção a objetivo somem dessas três funções, não são só deduplicadas.

Aceite:

- `lib/mesocycle.ts` calcula a fase (`build`/`recovery`/`desconhecida`) a partir só da semana do ciclo, sem tabela de fases cadastrada manualmente; `mesocycle_phases` para de ser lida ou escrita em qualquer rota (a tabela em si não é apagada, só fica sem uso).
- A tela de mesociclo (aba Evolução) perde o campo de edição manual de fase; a fase aparece só como informação calculada.
- `preferVolumeReduction` passa a receber só `phase`, sem objetivo nem especificidade protegida.
- `lib/readiness.ts` (`adaptWorkout`, `runReadiness`, `confirmReadinessProposal`) usa a fase do mesociclo (calculada com uma leitura própria da âncora) para decidir intensidade vs. volume no treino de hoje — antes disso, o treino de hoje nunca soube de mesociclo.
- Nenhuma leitura de `athlete_goals` acontece mais em `lib/readiness.ts`, `lib/decision-engine.ts` ou `futureProposal`; a rota `/api/profile` e a tela "Direção da temporada" continuam existindo e funcionando exatamente como hoje, só que sem efeito em nenhuma decisão de treino.
- O card "Objetivo considerado" que aparecia na aba Hoje some, porque deixou de refletir algo real.
- Testes cobrem: `resolveMesocycle`/fase por semana (1-3 build, 4 recovery, sem âncora desconhecida); `preferVolumeReduction(phase)` com a assinatura nova; `adaptWorkout`/`runReadiness` decidindo por fase, não por objetivo.
- `npm test` e `npm run build` validados.

Dependências: SPEC-11 (fase e ponteiro do mesociclo) e SPEC-14 (motor adaptativo, onde `preferVolumeReduction` já existe) já concluídas; esta SPEC consolida, remove a divergência entre elas e o caminho de hoje (`lib/readiness.ts`), e desfaz parte da SPEC-01 (uso de objetivo para decidir carga) e da SPEC-11 (mapa manual de fases).

## SPEC-19 — Tela Hoje essencial e progressiva

Status: concluída e publicada na versão 25 em 2026-09-08

A tela Hoje deve permitir decidir em poucos segundos sem repetir recuperação, carga e histórico que já aparecem em outros níveis do produto. O primeiro nível mostra somente prontidão, treino de hoje, eventual mudança proposta e a ação correspondente. Recuperação detalhada e check-in ficam disponíveis sob expansão; tendências permanecem na aba Evolução.

Aceite:

- Conexões saudáveis não ocupam um card; o aviso aparece apenas quando a conexão ainda está sendo verificada ou exige ação.
- Prontidão e treino de hoje continuam visíveis sem interação.
- Dados da decisão, estrutura do treino, recuperação e check-in permanecem acessíveis sob expansão.
- O gráfico de carga de sete dias não é repetido na tela Hoje; sua leitura permanece em Evolução.
- Alertas, propostas e confirmação explícita para escrita no Intervals.icu não são removidos nem escondidos.
- Build e testes regressivos permanecem aprovados.

## SPEC-20 — Unificar o ajuste de uma variável (intensidade x repetições)

Status: concluída no código pelo commit `5755724` (2026-09-08); documentação sincronizada em 2026-09-09

Aviso de leitura: o commit `5755724` implementou esta SPEC no mesmo commit em que gravou o texto que a declarava "aguardando decisão do atleta". O texto abaixo foi corrigido depois do fato para refletir o código real; o diagnóstico fica registrado como histórico.

Diagnóstico (histórico, já corrigido): a regra "amarela reduz só uma variável do treino" está implementada três vezes de forma independente, e uma das cópias diverge de verdade das outras duas: `lib/readiness.ts` (`adaptWorkout`, treino de hoje), `lib/decision-engine.ts` (`reduceIntensity`/`reduceRepetitions`, prévia do motor) e `app/api/week/route.ts` (`futureProposal`, replanejamento futuro). O regex de repetições em `futureProposal` exige `[3-9]x` enquanto os outros dois aceitam `[2-9]x` — a mesma estrutura de treino gera proposta de ajuste hoje mas não gera proposta futura. Ao reduzir repetições, `readiness.ts`/`decision-engine.ts` cortam duração (~10%) e carga (~16%); `futureProposal` preserva a duração inteira e só corta a carga proporcionalmente à razão de repetições (piso 0,72). Também existe uma quarta duplicação menor: o template de "recuperação leve" (nome, 30 min, carga 18, estrutura "10m 45% / 15m 50% / 5m 40%") está escrito à mão tanto no branch vermelha de `adaptWorkout` quanto em `recoveryRecommendation` (`decision-engine.ts`), com nomes ligeiramente diferentes.

Decisões efetivamente aplicadas no código (registradas ao sincronizar esta SPEC):

1. **Duração ao reduzir repetições**: venceu a regra que era do treino de hoje — corta duração ~10% (`durationMinutes * 0.9`) e carga ~16% (`load * 0.84`). A regra do replanejamento futuro (duração intacta, carga proporcional com piso 0,72) deixou de existir.
2. **Piso de repetições reconhecido**: `2x`. O regex único é `/\b([2-9]|[1-9]\d)x\b/i`; o `[3-9]x` que valia só para o replanejamento futuro foi eliminado.
3. **Casa da função única**: `lib/decision-engine.ts`, como `adjustWorkoutPlan(workout, classification, phase, forceVolumeFirst)`, chamada por `lib/readiness.ts` (`adaptWorkout`), por `decideTraining` e por `futureProposal` em `app/api/week/route.ts`.

Regra final (após a decisão): existe uma única função exportada de `lib/decision-engine.ts` que recebe treino, fase e classificação e devolve reduzir intensidade, reduzir repetições ou substituir por recuperação leve — com um único regex de repetições, um único regex de intensidade, uma única regra de fator e um único template de recuperação leve. `lib/readiness.ts` (hoje) e `app/api/week/route.ts` (`futureProposal`) passam a chamar essa função em vez de reimplementá-la.

Aceite:

- [x] Um único regex de repetições e um único de intensidade usados nos três pontos de chamada — os três chamam `adjustWorkoutPlan`, que é dona dos dois regex.
- [x] Uma única regra de fator de duração/carga ao reduzir repetições, aplicada igualmente nos três.
- [x] Template de recuperação leve definido uma vez só (`recoveryRecommendation`), reaproveitado por `readiness.ts` e `decision-engine.ts`.
- [x] Teste de regressão sobre a regra unificada: `tests/decision-engine.test.ts`, "função única reconhece 2x e reduz duração e carga pela mesma regra" e "template de recuperação é único para qualquer caminho vermelho".
- [x] `npm test` e `npm run build` validados.

Limitação conhecida do teste: como `lib/readiness.ts` e `app/api/week/route.ts` fazem I/O, o teste exercita a função compartilhada, não os três caminhos ponta a ponta. A garantia de que os três concordam é estrutural (chamam a mesma função), não observada em teste.

Dependências: nenhuma SPEC concluída bloqueia esta. Fazer depois da SPEC-21 simplifica a implementação, porque `readiness.ts` passaria a receber a fase já resolvida em vez de calculá-la sozinho — mas não é obrigatório.

## SPEC-21 — Fechar o contexto unificado (fase e qualidade de dados)

Status: concluída no código pelo commit `5755724` (2026-09-08); documentação sincronizada em 2026-09-09

Aviso de leitura: mesmo caso da SPEC-20 — o commit que implementou também gravou o texto que a declarava pendente. O texto abaixo foi corrigido depois do fato.

Diagnóstico (histórico, já corrigido): a SPEC-13 unificou o snapshot do atleta, mas dois caminhos ainda escapam dela. Primeiro, a fase do mesociclo é calculada duas vezes por requisição: `lib/context-loader.ts` monta o snapshot chamando `resolveMesocycle`, mas antes disso `lib/readiness.ts` já fez sua própria leitura de `mesocycle_anchor` e seu próprio cálculo via `resolveTodayPhase()`, só para decidir o treino de hoje — mesma tabela, mesma conta, duas consultas e duas chamadas de função por request. Segundo, `lib/context.ts` (`readinessQuality`) decide se a prontidão está atrasada, ausente ou contraditória testando substrings (`warning.includes('expirou')`, `warning.includes('ainda não chegaram')`) contra o texto livre que `lib/readiness.ts` gera em `unavailable()`; se o texto mudar, a classificação cai em silêncio no caso genérico, sem erro. Terceiro, "carga de ontem foi alta para o fitness atual" tem duas fórmulas diferentes: `readiness.ts` usa `yesterdayLoad > ctl * 1.5`, `week/route.ts` usa `yesterdayLoad > Math.max(70, ctl * 1.5)` — o mesmo julgamento responde diferente dependendo de qual arquivo pergunta.

Decisões efetivamente aplicadas no código (registradas ao sincronizar esta SPEC):

1. **Fase por parâmetro**: `runReadiness(owner, checkin, phase = 'desconhecida')` recebe a fase já resolvida; `lib/context-loader.ts` chama `resolveMesocycle` uma única vez e repassa. `lib/readiness.ts` não importa mais nada de `lib/mesocycle.ts`.
2. **`reasonCode` explícito**: `ReadinessResult.reasonCode?: 'atrasado' | 'ausente' | 'contraditorio' | 'sessao_expirada'` (sem acento em `contraditorio`, como está no código). `lib/context.ts` classifica por ele, sem inspecionar texto.
3. **Limiar de "carga de ontem alta"**: venceu `Math.max(70, ctl * 1.5)`, a regra que era de `week/route.ts`, agora em `isYesterdayLoadHigh` (`lib/load-safety.ts`) e usada pelos dois consumidores.

Aceite:

- [x] `lib/context-loader.ts` resolve a fase do mesociclo uma única vez por requisição e repassa para `runReadiness`; `lib/readiness.ts` não lê mais `mesocycle_anchor` diretamente (garantia estrutural: o arquivo não importa mais `lib/mesocycle.ts`).
- [x] `lib/context.ts` classifica a qualidade da prontidão pelo `reasonCode` explícito, sem inspecionar texto.
- [x] Uma única função em `lib/load-safety.ts` decide "carga de ontem alta", reaproveitada por `readiness.ts` e `week/route.ts`, com o mesmo limiar nos dois lugares.
- [x] Testes: `reasonCode` nos três casos de indisponibilidade (`tests/context.test.ts`) e limiar único de carga de ontem (`tests/load-safety.test.ts`, "carga de ontem usa um único piso conservador de 70").
- [x] `npm test` e `npm run build` validados.

Dependências: nenhuma SPEC concluída bloqueia esta; toca `lib/readiness.ts`, `lib/context-loader.ts`, `lib/context.ts`, `lib/load-safety.ts` e `app/api/week/route.ts`.

## SPEC-22 — Limpeza estrutural menor

Status: parcialmente concluída em 2026-09-09 — os dois itens de código estão fechados; resta apenas a decisão do atleta sobre `mesocycle_phases`

Diagnóstico: três achados menores, sem efeito em decisão de treino. Em `app/api/week/route.ts`, a variável `stressed` ("a semana está sob estresse de carga/prontidão?") é calculada duas vezes com o código idêntico — uma vez dentro do `.map()` de `planOutlook` (recalculada a cada item do laço apesar de não depender do item) e de novo fora, para `proposalBuilt`. O tipo `SafetyFlag`/`LoadSafetyFlag` (`{ id: 'acwr_high' | 'ramp_rate_exceeded'; severity: 'moderada' | 'severa' }`) está definido de forma idêntica em três arquivos (`lib/load-safety.ts`, `lib/decision-engine.ts`, `lib/off-day-suggestions.ts`) sem fonte única. E a tabela `mesocycle_phases`, sem uso desde a SPEC-18, continua no schema.

Decisão que o atleta ainda precisa tomar:

1. A tabela `mesocycle_phases` deve continuar existindo sem uso (mais simples, reversível) ou ser removida por migração (mais limpo, mas é uma alteração de schema em produção)? **Em aberto** — nada foi alterado no schema, porque uma migração em produção não é reversível sem custo e não cabe decidir isso por conta própria. A tabela segue no `drizzle/0004_mesocycle.sql`, sem leitura nem escrita em nenhuma rota.

Aceite:

- [x] `stressed` calculado uma única vez por requisição em `app/api/week/route.ts`, reaproveitado por `planOutlook` e `proposalBuilt`. Comportamento idêntico: nenhuma das duas cópias dependia do item do laço.
- [x] `SafetyFlag` definido uma única vez em `lib/load-safety.ts` (`LoadSafetyFlag`). `lib/decision-engine.ts` já o importava; `lib/off-day-suggestions.ts` passou a importar também. Como nada fora desses arquivos consumia o nome `SafetyFlag`, o alias local foi removido em vez de mantido — `OffDayInput.safetyFlags` usa `LoadSafetyFlag` diretamente.
- [ ] Decisão sobre `mesocycle_phases` registrada e, se for o caso, migração de remoção criada.
- [x] `npm test` e `npm run build` validados.

Dependências: nenhuma; independente da SPEC-20 e da SPEC-21, pode ser feita em qualquer ordem, inclusive isolada.

## SPEC-23 — Fase do mesociclo inferida da carga planejada real, sem âncora manual

Status: proposta — direção confirmada pelo atleta em 2026-09-08; detalhes de implementação em aberto (ver abaixo)

Diagnóstico: o atleta monta os ciclos de treino com apoio de IA antes e deixa a progressão pronta no calendário do Intervals.icu — ou seja, a alternância entre semanas de progressão e semanas de recuperação já está implícita na carga/intensidade que ele mesmo planejou semana a semana. `lib/mesocycle.ts` ignora isso completamente: resolve a fase a partir de uma data-âncora cadastrada manualmente pelo atleta dentro do Pedal Pronto (`mesocycle_anchor`) e de uma regra fixa e cega — todo ciclo tem exatamente 4 semanas, a semana 4 é sempre recuperação — sem nunca olhar a carga real planejada no Intervals.icu. O único elo com o Intervals.icu é `parseCyclePointer`, que lê o padrão `C{n}W{n}D{n}` do nome do evento apenas para emitir um aviso de divergência, nunca para corrigir. Isso contraria o princípio já registrado em `PROJECT_MEMORY.md` ("O Intervals.icu continua sendo a fonte oficial do plano") e, desde a T18/SPEC-18, essa fase potencialmente errada decide de verdade o ajuste do treino de hoje (`lib/readiness.ts`) e a proposta futura (`futureProposal`).

Direção confirmada pelo atleta: substituir a fonte da fase. Em vez de âncora manual + regra fixa de 4 semanas, a fase passa a ser inferida comparando a carga planejada da semana atual com a carga planejada das semanas anteriores, já reais no calendário do Intervals.icu — sem exigir nenhum cadastro do atleta.

Decisões que o atleta precisa tomar antes da implementação:

1. **Janela de comparação**: quantas semanas anteriores entram na média de referência (ex.: últimas 3? últimas 4?) — precisa ser grande o suficiente para não confundir uma semana de descanso pontual com o fim de um bloco, mas pequena o suficiente para acompanhar blocos curtos.
2. **Limiar de queda**: que percentual de queda da carga planejada da semana atual frente à média de referência caracteriza "recuperação" (ex.: abaixo de 70%? 80%?) — abaixo disso é "build"/progressão.
3. **Sem histórico suficiente** (início de temporada, poucas semanas cadastradas no Intervals.icu): a fase deve cair em "desconhecida" (bloqueia como hoje) ou assumir "build" por padrão, na mesma lógica de segurança já usada quando não havia âncora (regra padrão de progressão)?
4. **O que fazer com a âncora manual e o ponteiro C/W/D**: viram só uma referência pessoal opcional exibida na aba Evolução (sem decidir mais nada), ou saem completamente da interface? A tabela `mesocycle_anchor` fica sem uso (como `mesocycle_phases` na SPEC-22) ou é removida?
5. Confirmar que a carga planejada das semanas anteriores é buscada uma única vez por requisição e entra no snapshot unificado (`lib/context.ts`/`lib/context-loader.ts`), reaproveitada por prontidão e semana — em vez de cada consumidor buscar por conta própria.

Regra final (após as decisões 1 e 2): uma função pura em `lib/mesocycle.ts` (ex. `resolvePhaseFromLoad(weeklyPlannedLoads)`) recebe a carga planejada das últimas N semanas (incluindo a atual) e devolve `build`, `recovery` ou `desconhecida`. A busca da carga planejada histórica no Intervals.icu (I/O) fica em `lib/context-loader.ts`, fora da função pura. `lib/readiness.ts`, `lib/decision-engine.ts` e `futureProposal` continuam chamando `preferVolumeReduction(phase)` sem mudança de assinatura — só a origem da `phase` muda.

Aceite:

- `lib/mesocycle.ts` ganha uma função pura testável que decide a fase a partir de uma série de cargas planejadas semanais, sem ler âncora nem tabela de fases.
- A busca da carga planejada das semanas anteriores acontece uma única vez por requisição, dentro do snapshot unificado, sem chamada duplicada entre prontidão e semana.
- Nenhuma decisão de treino (hoje ou futura) usa mais a âncora manual para determinar a fase.
- Decisão sobre a âncora/ponteiro C/W/D (item 4) registrada e refletida na interface.
- Testes cobrem: queda clara de carga (recuperação), carga estável ou crescente (build), histórico insuficiente (comportamento definido pela decisão 3), e os limiares exatos escolhidos nas decisões 1 e 2.
- `npm test` e `npm run build` validados.

Dependências: substitui a parte de resolução de fase da SPEC-11 e da SPEC-18 (que continuam válidas em tudo o mais — regras imutáveis, consentimento, `preferVolumeReduction` como função única). Fazer depois da SPEC-21 é natural, já que as duas mexem em como o contexto unificado busca e resolve a fase.

## SPEC-24 — Identidade visual clara, em branco e lilás

Status: implementada e validada localmente em 2026-09-09; **não publicada**

O atleta pediu uma interface moderna a partir de uma referência visual concreta (app de reserva de espaços: cards brancos arredondados, acento lilás, quase-preto para texto, preenchimentos chapados). O visual anterior era verde-floresta (`#165c45`) com acento amarelo (`#edc961`), cards em gradiente e raios de canto variando de 8 a 25px sem regra.

Decisões de design que fecham esta SPEC:

1. **O lilás é a interface; verde, amarela e vermelha são exclusivos da prontidão.** O `docs/DESIGN.md` exige que as três cores do semáforo mantenham significado consistente. Se o lilás fosse só mais uma cor entre elas, o semáforo perderia força — então nenhum botão, ícone ou card decorativo usa verde/amarela/vermelha. O lilás (`#8b5cf0` forte, `#b388f5` claro, `#f2e9fe` suave) assume ações, estados ativos, destaques e ênfase; o semáforo aparece só no selo de prontidão, no anel do score, no estado de cada dia da semana e nos avisos de risco.
2. **Nada de gradiente.** Todos os `linear-gradient`/`radial-gradient` saíram em favor de preenchimento chapado, como na referência. O card de prontidão deixou de ser verde-escuro com texto branco e passou a ser lilás claro com texto escuro — o que também melhora contraste em tela pequena.
3. **Raio de canto vira regra**: 24px em card grande, 18px em linha/painel, 14px em caixa interna, 12px ou menos em chip.
4. **O `Programado → Recomendado` é o único preenchimento lilás forte da tela**, porque é a única coisa que pede uma decisão do atleta (`.recommended-workout` e `.proposal-comparison>div:last-child`).

Bug pré-existente corrigido junto: `app/globals.css` declarava `html { font-family:var(--font-manrope),... }`, mas `--font-manrope` é definida por `next/font` na classe do `<body>`. Variáveis CSS não sobem na árvore, então a declaração era inválida e **o app inteiro renderizava em Times New Roman** — nunca em Manrope, desde sempre. A declaração foi movida para `body`. Confirmado no navegador antes e depois.

Aceite:

- [x] Nenhum valor da paleta antiga (`#165c45`, `#edc961`, tintas verdes) e nenhum gradiente restam em `app/globals.css`.
- [x] Todos os seletores existentes foram preservados; nenhuma mudança de marcação em `app/page.tsx` além das duas cores de série do Recharts.
- [x] Verde, amarela e vermelha aparecem apenas em estado de prontidão, estado do dia e risco — nunca como enfeite.
- [x] `themeColor`, `background_color`/`theme_color` do manifesto e `public/icon.svg` acompanham a paleta nova.
- [x] Manrope realmente aplicada, verificada por `getComputedStyle` no navegador.
- [x] `npm test` (78) e `npm run build` validados.
- [x] Verificado visualmente no navegador local (Chromium) nas quatro abas.

Limitação da verificação: este ambiente não tem credenciais do Polar nem do Intervals.icu, então só os **estados desconectados** foram vistos. Telas com dados reais — proposta pendente, lista de sessões da semana, gráficos de potência e carga, histórico de decisões — não foram verificadas visualmente e continuam para conferência pós-publicação.

Fora de escopo: nenhuma regra de decisão, texto de justificativa, hierarquia de tela ou fluxo de consentimento mudou. A SPEC-19 (Hoje essencial) e a SPEC-08 (consentimento) seguem valendo sem alteração.

## SPEC-25 — O check-in não pode desaparecer da avaliação nem do histórico

Status: implementada e validada localmente em 2026-09-09; **não publicada**

Diagnóstico, encontrado em auditoria a pedido do atleta. O problema tinha duas metades que se somavam:

**1. A tela voltava atrás sozinha.** `loadReadiness(false)` fazia `GET /api/readiness`, e o `GET` (`route.ts:9`) chamava `loadAthleteContext(owner)` **sem check-in**. Esse caminho rodava na abertura do app, a cada `visibilitychange` e **a cada 3 minutos** por `setInterval`. Como dor, sintomas, fadiga, pernas e motivação entram na contagem de flags de `runReadiness`, a avaliação sem check-in produz sistematicamente uma classificação **mais permissiva**. Na prática: o atleta relatava dor 8, via vermelha e uma proposta de sessão conservadora; três minutos depois, sem tocar em nada, a tela mostrava verde e a proposta sumia. Isso contraria a regra imutável "dor ou doença exigem conduta conservadora" — o app falhava para o lado permissivo.

A trava de consentimento continha o dano: confirmar usava o check-in, `confirmReadinessProposal` recalculava com ele, o fingerprint não batia e a escrita era recusada com `PROPOSAL_CHANGED`. Nenhum treino errado foi escrito no Intervals.icu — mas o atleta via a leitura errada e recebia um erro confuso ao tentar confirmar.

**2. O histórico do dia era sobrescrito.** `runReadiness` gravava em `readiness_runs` a **cada chamada**, inclusive nas leituras. `app/api/performance/route.ts:93` lê `MAX(id) GROUP BY run_date` — a última linha do dia vence. Então qualquer refresh posterior substituía a avaliação com check-in por uma sem, e o aprendizado individual (SPEC-03) passava a associar o dia a uma classificação que ignorava a dor relatada.

Correção:

1. **Leitura não escreve histórico.** `runReadiness` não grava mais. A gravação virou `recordReadinessRun(owner, result)`, explícita, chamada só pelo `POST` de avaliação. `GET /api/readiness` continua existindo e respondendo, mas não toca no histórico.
2. **Uma linha por dia.** `recordReadinessRun` faz `UPDATE` por `(owner_id, run_date)` e só insere se não houver linha — em vez de acumular uma por carregamento. Resultados `indisponível` não são gravados, como já acontecia antes. Nenhuma mudança de schema.
3. **O check-in viaja sempre.** `loadReadiness` passou a usar `POST` com o check-in em todos os casos; o parâmetro booleano agora só decide se a Semana também recarrega.
4. **Fim da defasagem de closure.** Os carregadores rodam dentro de efeitos com dependências fixas (`[]` e `[polarConnected]`), então liam o `checkin` do closure — que ficaria preso ao valor inicial para sempre, inclusive no timer de 3 minutos. Passaram a ler de `checkinRef`. Os três caminhos de confirmação (`confirm_today`, `create_suggestion`, `apply_proposal`) usam a mesma referência, para a revalidação da SPEC-08 enxergar exatamente o check-in que gerou a proposta.

Aceite:

- [x] Nenhum caminho de leitura grava em `readiness_runs`.
- [x] No máximo uma linha por atleta por dia; a última avaliação do dia é a que vale.
- [x] Toda avaliação de prontidão carrega o check-in, inclusive a automática.
- [x] Carregamento inicial e refresh automático verificados no navegador: `POST` com `dor=8, sintomas=6, fadiga=9` vindos do `localStorage`, não os defaults — provando que a referência resolveu a defasagem.
- [x] `npm test` (78) e `npm run build` validados.

Limitação registrada: a suíte não alcança esta correção. Os testes do projeto cobrem só os núcleos puros (`training-safety-core.ts`, `context.ts`, `decision-engine.ts`); `lib/readiness.ts` depende do D1 e do alias `@/`, que o runner (`node --experimental-strip-types`) não resolve. A verificação foi estrutural mais navegador, não automatizada. Fechar essa lacuna pediria um duplo de D1 nos testes — vale como tarefa própria, não foi feito aqui.

Não corrigido de propósito: linhas duplicadas de dias **anteriores** continuam no banco. Não há como saber retroativamente qual delas refletia o check-in real, então nada foi reescrito.

## SPEC-26 — Uma avaliação por requisição e um teste que pode falhar

Status: implementada e validada localmente em 2026-09-09; **não publicada**

Duas melhorias menores levantadas na auditoria, sem efeito em nenhuma decisão de treino.

**1. `POST /api/week` avaliava a prontidão duas vezes.** A rota chamava `context()` uma vez para validar a proposta e de novo para devolver a semana atualizada depois da escrita. Como `context()` chama `loadAthleteContext` (e portanto `runReadiness`), cada requisição de confirmação custava ~16 chamadas externas a Polar/Intervals.icu, sendo 10 só de prontidão.

`context()` ganhou um terceiro parâmetro opcional (`athlete`) e o `POST` carrega o contexto uma vez, repassando-o às duas chamadas. Passou a ~11 chamadas. Isso é correto, não só mais barato: a escrita altera um **evento planejado** no Intervals.icu — não muda Polar, CTL/ATL nem o check-in —, então recalcular a prontidão depois dela chegaria ao mesmo resultado. Eventos e atividades continuam sendo rebuscados, que é o que de fato muda. O `GET` não mudou: segue carregando tudo fresco.

**2. Um teste que não podia falhar.** `tests/decision-engine.test.ts` tinha o caso "função única reconhece 2x…", que chamava `adjustWorkoutPlan` duas vezes com argumentos idênticos e comparava os resultados sob os nomes `today`/`future`. Sendo a mesma chamada, a comparação era tautológica — não verificava a concordância entre caminhos que o nome prometia.

Foi substituído pela invariante real: os três caminhos entregam o treino em formatos diferentes (`readiness.ts` manda `description`, `decideTraining` manda `structure`, `futureProposal` manda os dois) e `reduceIntensity`/`reduceRepetitions` leem `workout.description ?? structure.join('\n')`. O teste novo aplica o mesmo treino nos dois formatos e exige resultado idêntico. Verificado por mutação: quebrando a leitura de `structure`, o teste falha; restaurando, passa.

Aceite:

- [x] Uma única avaliação de prontidão por requisição em `POST /api/week`; `GET` inalterado.
- [x] Teste de concordância entre `description` e `structure`, comprovadamente capaz de falhar.
- [x] Comportamento de decisão idêntico; nenhuma regra tocada.
- [x] `npm test` (79) e `npm run build` validados.

Achado registrado, **não corrigido**: no piso de `2x`, `Math.max(2, from - 1)` devolve `2` e a justificativa mostrada ao atleta vira "Repetições reduzidas de 2 para 2", sem redução real de repetições — só duração e carga cedem. Corrigir pediria decidir se `2x` deve cair para redução de intensidade em vez de ser tratado como estrutura redutível, e isso contraria a decisão 2 da SPEC-20, tomada pelo atleta. Fica como pergunta em aberto, com o comportamento atual documentado em teste.
