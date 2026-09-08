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

Status: concluída e validada localmente; publicação pendente

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
