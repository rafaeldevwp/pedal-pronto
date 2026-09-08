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
- [ ] Publicar somente após autorização do atleta.

## Concluída localmente — T09 Corrigir slider em zero e validar acessibilidade — SPEC-09

- [x] Corrigir trilho e botão em todos os extremos.
- [x] Preservar zero como valor válido no estado e no envio.
- [x] Ampliar área de toque, contraste e foco visível.
- [x] Validar mouse, teclado, mínimo, máximo, retorno a zero e recarga.
- [x] Validar visualmente em layout móvel.
- [ ] Publicar somente após autorização do atleta.

## Concluída localmente — T10 Criar glossário contextual e centralizado — SPEC-10

- [x] Centralizar os termos técnicos e suas definições.
- [x] Informar nome, unidade, interpretação, uso, linha de base, fonte e limitações.
- [x] Adicionar explicação curta junto às métricas e área completa pesquisável.
- [x] Organizar verbetes em Recuperação, Carga, Treino e Planejamento.
- [x] Garantir abertura por toque, teclado e leitor de tela.
- [x] Validar consistência dos termos, busca e funcionamento móvel.
- [ ] Publicar somente após autorização do atleta.

## Próximo

## Concluída localmente — T11 Resolver fase e ponteiro do mesociclo — SPEC-11

- [x] Persistir âncora e mapa de fases por atleta.
- [x] Calcular C/W/D por dias corridos e resolver a fase cadastrada.
- [x] Conferir o padrão do evento e avisar divergências sem corrigir dados.
- [x] Exibir a âncora atual e permitir edição segura na tela Evolução.
- [x] Validar viradas de semana/ciclo, fase desconhecida e nomes sem padrão.
- [ ] Publicar no lote T08–T12.

## NEXT — T12 Adicionar ACWR e ramp rate como sinais de segurança — SPEC-12

- [ ] Calcular ACWR sobre 7 e 28 dias.
- [ ] Calcular ramp rate do CTL em sete dias contra teto configurável.
- [ ] Expor métricas e flags sem automatizar alterações de treino.
- [ ] Mostrar os sinais em linguagem simples no PWA.
- [ ] Cobrir limiares, ausência de dados e regressões em testes.
- [ ] Publicar no lote T08–T12.

Regra: trabalhar somente na tarefa marcada como `NEXT`.
