# Memória do sistema — Pedal Pronto

Atualizado em: 2026-09-09

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

**Ponto de retomada (2026-09-09): T24 a T38 estão implementadas e validadas localmente, aguardando ordem de publicação — são 17 commits sem publicar, e a produção continua na versão 25 com o bug da T25 no ar. A T25 é a que mais urge. As duas questões que estavam em aberto foram decididas pelo atleta e fechadas: ACWR e rampa passaram a pesar na cor do dia (T33) e as tabelas sem uso saíram por migração (T36). Próximo passo combinado: auditar o que nunca foi olhado — fluxo OAuth do Polar, `public/sw.js`, glossário e a matemática da curva de potência em `app/api/performance/route.ts`.**

T19 foi concluída e publicada na versão 25 em 2026-09-08. A tela Hoje foi reduzida ao essencial: prontidão e treino permanecem visíveis; conexão saudável deixou de ocupar espaço; recuperação e check-in foram consolidados sob expansão; o gráfico de carga deixou de ser repetido nessa tela e continua em Evolução. Nenhuma regra de decisão ou escrita no Intervals.icu mudou.

T13 a T18 estão todas concluídas localmente (build e 75 testes), fechando o roteiro completo do esboço "Pedal Pronto 2.0" mais um ajuste de harmonização (T18) pedido pelo atleta depois. Resumo do que cada uma entregou:

- **T18** (depois da T17, a pedido do atleta): o campo "objetivo" (performance/resistência/ftp/saúde) parou de decidir qualquer coisa — vira puramente contexto narrativo na tela "Direção da temporada" (aba Evolução). "Especificidade protegida" (reduzir volume perto de um evento principal, calculada por data) foi removida por completo, sem substituto. O mapa manual de fases por ciclo/semana (`mesocycle_phases`, editado à mão) foi substituído por uma regra fixa e automática: semanas 1-3 do ciclo são fase de progressão ("build", protege intensidade), semana 4 é recuperação ("recovery", protege duração) — a fase nunca mais fica "desconhecida" a menos que não haja âncora configurada. `lib/readiness.ts` (o ajuste do treino de **hoje**, publicado) passou a considerar a fase do mesociclo pela primeira vez, usando a mesma função `preferVolumeReduction` que já era usada só para o motor adaptativo e o replanejamento futuro — as três decisões que antes divergiam (uma cega para fase) agora são uma só. `athlete_goals`/`/api/profile` continuam existindo exatamente como antes, incluindo o teto de rampa do CTL; só pararam de influenciar decisões de treino.

- **T13**: `lib/context.ts` (puro) define o snapshot versionado (`AthleteSnapshot` v1); `lib/context-loader.ts` monta esse snapshot chamando `runReadiness`/`resolveMesocycle` uma única vez por requisição; `app/api/readiness/route.ts` e `app/api/week/route.ts` passam por `loadAthleteContext` em vez de buscar Polar/Intervals.icu cada um por conta própria; `snapshot.blocked` impede proposta futura e sugestão OFF quando os dados são contraditórios, sempre explicando o motivo.
- **T14**: `lib/decision-engine.ts` (`decideTraining`) decide fase+ACWR/rampa+objetivo de forma determinística. Por decisão do atleta, o motor só atua em dia planejado futuro — nunca no dia de hoje, que continua sob a proposta já publicada em `lib/readiness.ts` — reaproveitando `preferVolumeReduction` dentro de `futureProposal` (`app/api/week/route.ts`), que já tem todo o fluxo de escrita da SPEC-08. `lib/stimulus.ts` classifica cada sessão em endurance/limiar/vo2max/recuperação e resume a cobertura da semana; quando o dia sendo avaliado é a única fonte prevista de limiar/VO2max da semana, intensidade é preservada e volume cede primeiro, custe o que custar de fase/objetivo.
- **T15**: `lib/off-day-suggestions.ts` tem 5 categorias (antes 3, sem "descanso completo" como opção explícita), considera ACWR/rampa/fase/dor/sintomas (antes não considerava carga nem fase), evita repetir categoria sem motivo, e cita a lacuna de estímulo da semana na justificativa. Check-in e proximidade real do próximo treino-chave chegam de verdade em `app/api/week/route.ts`, sempre simétricos entre geração e revalidação da SPEC-08.
- **T16**: a maior parte já existia via T02/T06 (feedback recalculado a cada leitura, sem persistência — reprocessar não duplica nada). Único ajuste real: `feedback.signals` limitado a 3 evidências, como o aceite pedia.
- **T17**: `result.warning` — a razão específica de sessão expirada/dados atrasados/contraditórios, calculada há tempos no backend mas nunca exibida — agora aparece na aba Hoje, com botão "Reconectar Polar" quando é o caso. As abas que renderizavam vazio sem explicação quando os dados ainda não tinham chegado agora mostram a causa provável e a ação certa. A aba Semana mostra carga realizada vs. planejada (`weeklyLoadTarget`/`weeklyLoadDone`). Depois disso, a pedido explícito do atleta (aceitando não poder verificar visualmente), foi feito o redesenho de hierarquia que a SPEC pede: abas "Hoje" e "Recuperação" fundidas numa só (decisão, treino, recuperação, check-in e tendência de 7 dias numa rolagem só, sem trocar de aba); "Treinos" renomeada para "Semana"; aba Evolução reordenada para separar estado de hoje → tendência de adaptação → direção do ciclo, nessa ordem (antes estava fora de ordem). Navegação inferior passou de 5 para 4 abas.

Gap consciente que sobrou, sem bloquear as regras imutáveis: carga-alvo não é um número único à parte; o proxy `weeklyPlannedLoad`/`weeklyLoadTarget` continua sendo a referência. A T17 foi verificada visualmente no navegador local em 2026-09-08, incluindo Hoje, Semana, Evolução, Glossário e estados sem conexão. Navegação, foco, toque, telas estreitas e movimento reduzido foram corrigidos; os fluxos autenticados reais permanecem para conferência pós-publicação.

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
- SPEC-17/T17: experiência integrada de Hoje, Semana e Evolução, concluída, verificada visualmente no navegador local e autorizada para publicação em 2026-09-08.
- SPEC-18/T18: fase do mesociclo substitui objetivo como orientador de carga; especificidade protegida removida; mapa manual de fases removido em favor de regra fixa por semana. Concluída e autorizada para publicação em 2026-09-08.
- Todas as seis (T13–T18) foram implementadas nesta ordem; T17/T18 receberam ordem explícita de publicação após a validação local da interface.

## Diagnóstico de ambiguidade/redundância e SPECs propostas (2026-09-08)

**Situação em 2026-09-09: SPEC-20 e SPEC-21 já estão resolvidas no código; SPEC-22 só depende de uma decisão de schema.** Ver a seção "Correção de rumo: documentação desalinhada do código", abaixo. Os três diagnósticos ficam registrados aqui como histórico, porque explicam o porquê das decisões que hoje estão no código.

A pedido do atleta, foi feita uma auditoria de ambiguidade e redundância sobre o sistema já publicado/validado (T13–T19), sem alterar código. Achados viraram três SPECs propostas, cada uma com pelo menos uma decisão pendente do atleta antes de qualquer implementação — ver `docs/SPECS.md` (SPEC-20 a SPEC-22) e `docs/TASKS.md` (T20 a T22) para o detalhe completo:

- **SPEC-20/T20**: a regra "reduzir uma variável do treino" está implementada três vezes (`lib/readiness.ts` hoje, `lib/decision-engine.ts` prévia, `app/api/week/route.ts` futuro) e uma das cópias diverge de verdade das outras — regex de repetições diferente (`2x` vs `3x` mínimo) e tratamento de duração diferente ao reduzir repetições (corta ~10% em duas cópias, preserva 100% na terceira). Decisão pendente: qual das duas regras de duração fica valendo.
- **SPEC-21/T21**: a fase do mesociclo é calculada duas vezes por requisição (uma vez dentro de `runReadiness` para o treino de hoje, outra em `context-loader.ts` para o snapshot) — o "contexto unificado" da T13 não cobre esse caminho. `lib/context.ts` também infere a qualidade da prontidão fazendo substring-match no texto do aviso gerado por `readiness.ts`, um acoplamento frágil e silencioso. E "carga de ontem alta" tem duas fórmulas diferentes em `readiness.ts` e `week/route.ts`. Decisões pendentes: mudar a assinatura de `runReadiness` para receber a fase pronta, e escolher um único limiar de carga.
- **SPEC-22/T22**: limpeza menor sem efeito em decisão de treino — `stressed` calculado duas vezes com código idêntico dentro de `week/route.ts`; tipo `SafetyFlag` redefinido de forma idêntica em três arquivos; tabela `mesocycle_phases` sem uso desde a T18, ainda no schema. Decisão pendente: remover a tabela por migração ou deixá-la sem uso.

Nenhuma das três toca as regras imutáveis nem a trava de consentimento/idempotência (SPEC-08), que segue centralizada e consistente. São inconsistências de implementação entre caminhos que deveriam se comportar igual e não se comportam — a SPEC-20 é a mais capaz de gerar "por que hoje ele fez X mas na proposta futura fez Y" na prática.

## Correção de rumo: fase do mesociclo não deve vir de âncora manual (SPEC-23, 2026-09-08)

Ao revisar wireframes das telas com o atleta, surgiu um ponto mais sério que os achados de redundância acima: o atleta monta os ciclos de treino com apoio de IA e já deixa a progressão pronta no calendário do Intervals.icu — a alternância entre semanas de progressão e recuperação já está implícita na carga que ele mesmo planejou. `lib/mesocycle.ts`, porém, ignora isso e resolve a fase a partir de uma data-âncora cadastrada manualmente no Pedal Pronto (`mesocycle_anchor`) mais uma regra fixa e cega (todo ciclo tem 4 semanas, a 4ª é sempre recuperação) — sem nunca olhar a carga real planejada no Intervals.icu. Isso contraria o princípio de que "o Intervals.icu é a fonte oficial do plano", e desde a T18 essa fase potencialmente errada decide de verdade o ajuste do treino de hoje.

**Direção confirmada pelo atleta**: substituir a fonte da fase por uma inferência a partir da carga planejada real das últimas semanas no Intervals.icu (queda clara frente à média recente = recuperação; estável ou crescente = build), sem exigir cadastro manual. Virou a **SPEC-23/T23** em `docs/SPECS.md`/`docs/TASKS.md`, com decisões em aberto sobre janela de comparação, limiar de queda, comportamento sem histórico suficiente, e o que fazer com a âncora/ponteiro C/W/D (virar referência opcional ou sair da interface). Substitui a parte de resolução de fase da SPEC-11/SPEC-18 — o resto de ambas (função única `preferVolumeReduction`, regras imutáveis) continua válido.

## Correção de rumo: documentação desalinhada do código (2026-09-09)

Uma auditoria de fluxo feita nesta sessão (Claude Code), comparando `docs/SPECS.md`/`docs/TASKS.md` com o código real, encontrou uma contradição dentro do próprio repositório: o commit `5755724` ("Adicionando feature", 2026-09-08 19:41) implementou a SPEC-20 e a SPEC-21 **no mesmo commit** em que gravou o texto que as declarava "proposta — aguardando decisão do atleta". Quem lesse os documentos primeiro — inclusive uma sessão futura seguindo o `AGENTS.md`, que manda ler `PROJECT_MEMORY.md` e `docs/TASKS.md` antes de implementar — concluiria que as decisões seguiam em aberto, e gastaria tempo re-decidindo ou reimplementando o que já existe.

O que o código já tinha decidido, e que agora está registrado nas SPECs:

- **SPEC-20**: função única `adjustWorkoutPlan` em `lib/decision-engine.ts`, chamada pelos três caminhos (hoje, prévia do motor, replanejamento futuro). Piso de repetições `2x`; ao reduzir repetições corta duração ~10% e carga ~16% — venceu a regra que era do treino de hoje, e a do replanejamento futuro (duração intacta, carga proporcional) deixou de existir.
- **SPEC-21**: `runReadiness` recebe a fase por parâmetro e não lê mais `mesocycle_anchor`; `ReadinessResult.reasonCode` substituiu o teste de substring em `lib/context.ts`; `isYesterdayLoadHigh` (`lib/load-safety.ts`), com o limiar `Math.max(70, ctl * 1.5)`, é a única fonte de "carga de ontem alta".

Fechado nesta sessão, a parte de código da T22: `stressed` passou a ser calculado uma única vez em `app/api/week/route.ts` (as duas cópias eram idênticas e nenhuma dependia do item do laço), e `lib/off-day-suggestions.ts` passou a importar `LoadSafetyFlag` de `lib/load-safety.ts` em vez de redefinir o tipo. Nenhuma decisão de treino muda por causa disso; 78 testes e o build seguem verdes.

Continua em aberto, dependendo do atleta: o destino da tabela `mesocycle_phases` (T22) e as quatro decisões da SPEC-23. Nenhuma migração foi criada e nada do schema foi tocado.

## Revisão da tela Evolução e da origem dos números (SPEC-27 a SPEC-29, 2026-09-09)

Ao usar o app, o atleta apontou que a aba Evolução está poluída e que ela pede dados que ele já mantém no Intervals.icu. A auditoria confirmou e rendeu três frentes, com as decisões dele já tomadas em duas:

**Situação: T27, T28 e T29 implementadas e validadas localmente em 2026-09-09.**

- **SPEC-27/T27 (concluída)**: sete cards no mesmo nível visual, dois deles formulários, nada sob expansão — contra o próprio `docs/DESIGN.md`. Faz para a Evolução o que a SPEC-19 fez para a tela Hoje. Decisões fechadas: o card "Direção da temporada" sai por completo (o objetivo não decide nada desde a T18) e o teto de rampa do CTL vira a constante 6, deixando de ser campo — era o único limiar do sistema que pedia opinião do atleta, e ninguém tem como saber o próprio teto.
- **SPEC-28/T28 (concluída)**: a fase do mesociclo passa a vir do padrão `C{n}W{n}D{n}` no nome do treino, que o atleta já usa. Descoberta que fechou o caso: `parseCyclePointer` já existia e sabia ler esse padrão, mas `resolveMesocycle` era chamada com dois argumentos e o nome do evento nunca chegava — o parser estava pronto e ocioso, servindo só para um aviso de divergência que jamais podia disparar. Sem código no nome, herda o último ciclo conhecido avançando a contagem desde o último treino codificado. `mesocycle_anchor` ficou sem uso e a rota perdeu o `PUT`. **Substitui a SPEC-23**.
- **SPEC-29/T29 (concluída)**: o ACWR passa a vir do Intervals.icu como `atl / ctl`, com o cálculo local de média móvel 7/28 como reserva explícita e a fonte informada em `acwrSource`. Os limiares não mudaram: 1,3 e 1,5 são os convencionais para a métrica nas duas formas de cálculo, então a régua ficou igual e só a origem mudou. A rampa segue local — a janela e a unidade do `rampRate` do Intervals.icu não puderam ser verificadas daqui (domínio bloqueado no proxy), e aplicar o teto de 6 sobre escala desconhecida trocaria uma divergência por um erro. Removido o `?? ramp`, que fazia `metrics.ramp` carregar duas definições conforme o dia. Risco dimensionado no código: esses flags não entram na classificação verde/amarela/vermelha nem em caminho de escrita — alimentam a prévia do motor, as sugestões de dia OFF e os textos.

Aberto também: o gráfico coração × potência aparece vazio. Exige potência e FC na mesma atividade, tipo Ride, nos últimos 42 dias. Falta saber se é dado ausente ou leitura errada de campo antes de virar SPEC.

## Correção de segurança: o check-in sumia da avaliação e do histórico (T25/SPEC-25, 2026-09-09)

O achado mais sério de toda a auditoria, encontrado quando o atleta perguntou se podia confiar no sistema. Duas metades somadas:

A tela **revertia sozinha para uma leitura mais permissiva**. O refresh automático — abertura do app, `visibilitychange` e um `setInterval` de 3 minutos — chamava `GET /api/readiness`, que avaliava **sem o check-in**. Como dor, sintomas e fadiga entram na contagem de flags, a avaliação sem check-in classifica sistematicamente mais verde. Na prática: dor 8 relatada, tela vermelha com proposta conservadora, e três minutos depois verde sem proposta, sem o atleta tocar em nada. Contraria a regra imutável de conduta conservadora para dor/doença.

A trava de consentimento segurou o dano — confirmar recalculava com o check-in, o fingerprint divergia e a escrita era recusada com `PROPOSAL_CHANGED`. **Nenhum treino errado foi escrito no Intervals.icu.** Mas o atleta via a leitura errada e levava um erro confuso ao confirmar.

E o **histórico do dia era sobrescrito**: `runReadiness` gravava em `readiness_runs` a cada chamada, inclusive nas leituras, e `performance/route.ts` lê `MAX(id)` por dia — então o último refresh sem check-in virava "a avaliação do dia" para o aprendizado individual (SPEC-03).

Corrigido: leitura não grava mais; `recordReadinessRun` grava explicitamente uma linha por dia; o check-in viaja em toda avaliação; e `checkinRef` eliminou uma defasagem de closure que deixaria o timer preso ao valor inicial para sempre. Sem mudança de schema.

Lacuna consciente na época: a suíte não alcançava isso — os testes cobriam só os núcleos puros, e `lib/readiness.ts` depende do D1 e do alias `@/`, que o runner não resolve. A verificação foi estrutural mais navegador. **Fechada na T38/SPEC-38**: `npm run test:workers` roda dentro do workerd com um D1 real, e o comportamento do check-in tem teste que falha se alguém o desfizer.

## Identidade visual: verde-floresta dá lugar a branco e lilás (T24/SPEC-24, 2026-09-09)

O atleta pediu uma interface moderna a partir de uma referência visual concreta e aprovou a direção depois de ver uma proposta com as telas reais do app. O tema verde-floresta (`#165c45`) com acento amarelo (`#edc961`) e cards em gradiente saiu inteiro; entrou uma paleta clara com lilás como cor de interface.

A decisão que estrutura o resto: **o lilás é a interface, e verde/amarela/vermelha ficam exclusivos da prontidão**. O `docs/DESIGN.md` exige que o semáforo mantenha significado consistente — se essas cores também enfeitassem botões e ícones, perderiam força. Hoje elas aparecem só no selo de prontidão, no anel do score, no estado de cada dia e em avisos de risco. Junto vieram: fim de todo gradiente, raio de canto padronizado (24/18/14px) e o `Programado → Recomendado` como o único preenchimento lilás forte da tela, por ser a única coisa que pede decisão.

Nenhuma regra de decisão, texto ou fluxo de consentimento mudou — só a camada visual. `app/page.tsx` só teve duas cores de série do Recharts trocadas; todo o resto foi CSS.

**Bug pré-existente encontrado e corrigido no caminho**: `app/globals.css` declarava `font-family:var(--font-manrope)` no `html`, mas `next/font` define essa variável na classe do `<body>`. Como variável CSS não sobe na árvore, a declaração era inválida e o app renderizava em **Times New Roman desde sempre** — nunca em Manrope. Conferido no navegador antes e depois da correção.

Verificado visualmente no Chromium local nas quatro abas. Ressalva: sem credenciais de Polar/Intervals.icu neste ambiente, só os estados desconectados foram vistos; telas com dados reais seguem para conferência pós-publicação.

## Aviso operacional: edição concorrente do repositório

Em 2026-09-08, durante esta sessão (Claude Code), foi detectado que o mesmo repositório estava sendo editado em paralelo por outra via — provavelmente o atleta interagindo diretamente pelo ambiente ChatGPT/Codex/Sites que originou o projeto (`.openai/hosting.json`, `@openai/sites-vite-plugin`, domínio `chatgpt.site`). A T19 ("Tela Hoje essencial e progressiva", SPEC-19) foi implementada, publicada na versão 25 e registrada no `docs/TASKS.md`/`docs/SPECS.md` sem que esta sessão soubesse — uma leitura anterior desses arquivos, na mesma conversa, não continha T19. Isso causou uma colisão real de numeração ao propor as SPECs de consolidação (a numeração planejada como SPEC-19/20/21 teve que virar SPEC-20/21/22 depois de reconciliar os arquivos).

Implicação prática: antes de propor ou implementar qualquer tarefa nova neste projeto, releia `docs/TASKS.md` e `docs/SPECS.md` na hora (não confie em leitura de início de sessão), porque o atleta pode estar trabalhando em paralelo por outra ferramenta no mesmo repositório. O Claude Code também não tem acesso ao mecanismo real de publicação no Sites (sem CLI, sem remote `sites` configurado, sem credenciais) — só consegue validar build/testes localmente e (com autorização) empurrar para o GitHub privado (`origin`).

## Segunda leva de correções e a primeira rede de proteção (T31 a T38, 2026-09-09)

Oito tarefas seguidas, todas por decisão explícita do atleta em resposta a perguntas curtas. O fio condutor: o sistema tinha razões escritas nas SPECs que o código não cumpria, e telas que mostravam mais do que ajudava.

**O que saiu da tela.** A aba Evolução tinha um campo de ciclo e um objetivo de temporada que duplicavam informação que o atleta já mantém em outro lugar — o código `C{n}W{n}D{n}` no nome do treino e a meta no próprio Intervals.icu. Os dois saíram. Números e gráficos técnicos foram para trás de "Ver números e gráficos"; a leitura da semana, para trás de "Ver leitura da semana". A prévia do motor adaptativo (T35) saiu inteira: mostrava uma decisão que nada consumia.

**O que passou a valer.** ACWR e rampa de CTL só apareciam como texto — a SPEC-12 descrevia num parágrafo que deveriam pesar na cor do dia, e o aceite da mesma SPEC dizia o contrário. O atleta decidiu: pesam (T33). No piso de duas séries, a redução passou a cortar intensidade em vez de não fazer nada (T34). As tabelas de mesociclo sem uso saíram por migração (T36).

**Dois vieses na comparação com pedais semelhantes (T37).** Desacoplamento zero era descartado da linha de base como se fosse sensor ausente, quando é o melhor resultado possível; e a confiança do veredito contava métricas que *variaram* em vez de métricas *comparáveis*, então repetir o próprio padrão derrubava a confiança relatada. Corrigir a mediana não bastou: os três consumidores logo abaixo também tratavam linha de base zero como ausência. Foi o teste que apontou a metade que faltava.

**A rede de proteção (T38).** `lib/readiness.ts` — o arquivo que decide a cor do dia — estava sem teste porque importa `cloudflare:workers`. Agora há dois runners: `npm test` (84 testes puros) e `npm run test:workers` (10 testes dentro do workerd, com D1 real). Cada mudança recente tem um teste que falha se alguém a desfizer, verificado por mutação.

**Observação registrada, ainda sem decisão do atleta:** um único sinal percebido no check-in nunca muda a cor do dia — fadiga 9/10 sozinha, sem nenhum outro flag, dá verde, porque a classificação exige dois flags para amarela ou dois severos para vermelha. Dor e sintomas escapam disso por terem override próprio. Pode ser o desenho certo (um sinal isolado é ruído), mas é uma escolha que nunca foi discutida.

Módulos novos: `lib/week-plan.ts` (pareamento atividade↔planejado), `lib/intervals.ts`, `lib/activity-comparison.ts`. Os três existem porque as rotas importam `cloudflare:workers` e não carregam no runner — extrair código puro é o que o torna testável.
