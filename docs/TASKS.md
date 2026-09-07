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

## Concluída localmente — T03 Criar modelo de aprendizado individual

- [x] Identificar associações recorrentes entre recuperação e desempenho.
- [x] Exigir ao menos oito dias pareados e grupos mínimos de três.
- [x] Separar associação de causalidade.
- [x] Mostrar confiança, evidências e limites em linguagem simples.
- [x] Suspender conclusões quando os dados forem insuficientes ou contraditórios.
- [x] Não diagnosticar nem modificar treinos nesta SPEC.
- [x] Validar localmente e atualizar a memória.
- [ ] Publicar somente após solicitação explícita do atleta.

## Concluída localmente — T04 Ampliar check-in e bloqueios conservadores

- [x] Adicionar pernas, motivação, sintomas e tempo disponível.
- [x] Fazer dor ou sintomas relevantes prevalecerem sobre métricas favoráveis.
- [x] Impedir intensificação e orientar conduta conservadora quando necessário.
- [x] Validar localmente e atualizar a memória.
- [ ] Publicar somente após solicitação explícita do atleta.

## Concluída localmente — T05 Criar previsão dos próximos dias

- [x] Estimar como o treino de hoje afeta a viabilidade do próximo treino-chave.
- [x] Mostrar faixa de risco, evidências e incerteza, sem promessa.
- [x] Não aplicar mudanças futuras sem confirmação explícita.
- [x] Impedir propostas quando a prontidão estiver indisponível.
- [x] Validar localmente e atualizar a memória.
- [ ] Publicar somente após solicitação explícita do atleta.

## Concluída localmente — T06 Criar histórico de decisões

- [x] Registrar treino original, recomendação, decisão e alteração efetiva.
- [x] Vincular o resultado posterior na leitura, sem reescrever registros.
- [x] Exibir histórico de forma simples e somente leitura.
- [x] Criar armazenamento append-only e índice por atleta/data.
- [x] Validar build e migração localmente; atualizar a memória.
- [ ] Publicar somente após solicitação explícita do atleta.

## Concluída localmente — T07 Criar alertas de risco futuro

- [x] Detectar quando um treino futuro entrar em risco relevante.
- [x] Alertar sem aplicar mudança automaticamente.
- [x] Levar o atleta à proposta que exige confirmação.
- [x] Evitar alertas repetidos ou baseados em dados incompletos.
- [x] Oferecer ativação de notificação do PWA no celular.
- [x] Validar localmente e atualizar a memória.
- [ ] Publicar somente após solicitação explícita do atleta.

## NEXT — Revisão e publicação do lote

- Revisar T03 a T07 em conjunto quando solicitado.
- Publicar somente após comando explícito do atleta.
- Depois da publicação, definir novas SPECs antes de implementar outras funções.

Regra: trabalhar somente na tarefa marcada como `NEXT`.
