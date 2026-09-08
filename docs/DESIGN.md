# Design e experiência

## Princípios

- Falar com o atleta, não com o analista de dados.
- Decisão primeiro; métricas e detalhes sob expansão.
- Explicar sempre “por quê”, “o que mudou” e “qual o impacto”.
- Verde, amarelo e vermelho mantêm significado consistente.
- Nenhuma alteração futura silenciosa.
- Nenhuma alteração de hoje ou futura sem consentimento específico; avaliar e atualizar dados são sempre ações somente leitura.
- Atividade concluída é inviolável: aparece apenas para consulta e feedback, nunca oferece controles de alteração, substituição ou exclusão.
- ACWR e rampa do CTL são sinais explicativos de segurança. Nesta etapa eles não mudam a decisão nem aplicam alterações; o atleta mantém controle explícito sobre qualquer escrita.
- A âncora C1W1D1 é a fonte do ponteiro do mesociclo; códigos no nome do evento servem apenas para conferência e divergências aparecem como aviso.
- Incerteza deve aparecer como confiança limitada, não como falsa precisão.

## Padrões de interface

- Treino alterado: mostrar `Programado → Recomendado`.
- Proposta futura: selo “Requer confirmação” e impacto na carga semanal.
- Dados incompletos: ação desabilitada e orientação para sincronizar/autenticar.
- Feedback: título simples, explicação curta, próxima ação e confiança.
- Comparação pessoal: mostrar o grupo usado, a diferença combinada, evidências curtas, confiança e fatores externos que limitam a leitura.
- Aprendizado individual: falar em associação, mostrar quantos dias foram pareados e ocultar conclusões abaixo da amostra mínima.
- Check-in: explicar a direção de cada escala; destacar imediatamente quando dor ou sintomas ativarem conduta conservadora.
- Previsão: mostrar `Hoje → próximo treino-chave`, faixa de risco, evidências, orientação e aviso explícito de incerteza.
- Histórico: linha do tempo expansível, `Programado → decisão efetiva`, justificativa e resultado posterior; sempre somente leitura.
- Alerta futuro: um alerta por risco relevante, acesso direto à proposta, opção de notificação no celular e texto explícito de que nada foi alterado.
- Confirmação de escrita: `Programado → Recomendado`, impacto e botão explícito; fechar ou cancelar preserva o original.
- Alvo concluído entre proposta e confirmação: retirar a ação, preservar a atividade e mostrar “Treino já realizado — nenhuma alteração aplicada”.
- Sliders: extremos sempre visíveis e tocáveis; zero é valor válido, persistente e nunca equivale a dado ausente.
- Glossário: explicação curta junto à métrica e verbete completo pesquisável; abrir por toque, teclado ou leitor de tela, sem depender de hover.
- Verbete técnico: `o que é → como usamos → como interpretar → limitações → fonte`, sempre priorizando a linha de base individual.
- Objetivo: visível como contexto da decisão, nunca como incentivo automático a treinar mais.

## Visão-alvo do produto

O Pedal Pronto evolui de um painel de métricas para um copiloto de execução do plano. O percurso principal é:

`Estado de hoje → treino planejado → recomendação explicada → confirmação do atleta → execução → feedback → impacto na semana`.

As telas atuais são reaproveitadas. A modernização muda a hierarquia e conecta os dados; não cria um produto paralelo nem substitui o Intervals.icu.

## Arquitetura de experiência

- **Hoje:** decisão e ação. Mostra prontidão, C/W/D/fase, treino previsto, eventual comparação `Programado → Recomendado` e recuperação prioritária.
- **Semana:** continuidade do plano. Mostra carga-alvo, realizada e prevista, estímulos-chave, alterações confirmadas e riscos futuros.
- **Evolução:** direção. Distingue condição do dia, tendência das últimas semanas, fase atual e progresso em relação ao objetivo.
- **Detalhes técnicos:** métricas, gráficos, método e glossário aparecem por expansão, sem bloquear a leitura simples.
- **Navegação móvel:** quatro destinos fixos — Hoje, Semana, Evolução e Glossário — com alvo mínimo de toque, foco visível e indicação semântica da página ativa.
- **Responsividade:** comparações em colunas viram fluxo vertical em telas estreitas; texto essencial permanece legível e animações respeitam a preferência por movimento reduzido.

## Contrato de decisão

- Toda recomendação nasce de um snapshot identificado e datado.
- A interface distingue fato, interpretação e proposta.
- Sinal isolado não determina decisão; conflitos reduzem confiança.
- A proposta informa o que preserva, o que muda e por quê.
- Confirmar é uma ação separada; atualizar dados nunca equivale a confirmar.
- Após confirmação, o servidor revalida snapshot, evento e ausência de atividade concluída.

## Estados essenciais

- **Atualizado:** fontes dentro da janela esperada; decisão disponível.
- **Aguardando sincronização:** exibe último valor e idade, mas suspende escrita.
- **Sessão expirada:** orienta reconexão e não produz decisão incompleta.
- **Contradição:** explica quais fontes divergem e mantém o plano intacto.
- **Treino realizado:** feedback somente leitura; nenhum controle de alteração.
- **Proposta pendente:** comparação clara e confirmação específica.
- **Proposta expirada:** bloqueada até nova avaliação.

## Progressão sem platô

O app não combate platô adicionando carga em um dia verde. Ele acompanha tendência de carga, resposta individual, fase e objetivo e sinaliza quando a progressão planejada parece insuficiente ou excessiva. Qualquer redistribuição é uma proposta de planejamento, limitada e confirmada pelo atleta.

## Vocabulário

Preferir: “esforço do coração”, “carga da semana”, “recuperação”, “treino exigente”.

Detalhes como CTL, ATL, HRV e desacoplamento podem aparecer em segundo nível com explicação.

Nunca apresentar “alto/baixo” como universal quando a interpretação depende do padrão individual, do contexto ou da qualidade da medição.

## Fora de escopo por enquanto

- Diagnóstico médico.
- Geração irrestrita de semanas completas.
- Alterações automáticas de vários dias.
- Gamificação baseada em acumular carga.
- Substituir o calendário oficial do Intervals.icu.
- Diagnóstico causal ou prescrição baseada apenas em literatura populacional.
- Agente generativo livre com permissão direta de escrita no calendário.
