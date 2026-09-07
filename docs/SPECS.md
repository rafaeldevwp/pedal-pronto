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

Status: próxima — correção crítica

Nenhuma avaliação, atualização manual, automação diária ou alerta pode modificar, substituir, cancelar ou criar um treino no Intervals.icu sem uma confirmação explícita do atleta para aquela mudança específica. A regra vale para hoje e para dias futuros e substitui a permissão automática anterior. A avaliação pode gerar uma proposta, mas deve permanecer somente leitura até a confirmação.

Fluxo obrigatório:

- Mostrar `Programado → Recomendado`, mudança exata, duração, carga e justificativa.
- Exigir uma ação separada e inequívoca: `Confirmar e enviar ao Intervals.icu`.
- No servidor, separar os comandos de avaliar, propor e aplicar; atualizar dados ou executar a automação nunca pode alcançar o caminho de escrita.
- Revalidar a proposta e o treino original imediatamente antes da escrita. Se mudaram, cancelar a operação e pedir nova revisão.
- Tornar a confirmação idempotente para impedir aplicação duplicada por toque repetido, repetição de rede ou atualização da página.
- Registrar proposta, consentimento e resultado no histórico imutável.
- Emitir `TREINO ALTERADO —` somente depois de o Intervals.icu confirmar a escrita.

Aceite:

- Atualizar prontidão, salvar check-in, abrir o PWA e executar a rotina agendada não alteram o calendário.
- Nenhuma requisição sem consentimento específico consegue executar `POST` ou `PUT` de treino.
- Uma proposta amarela/vermelha permanece pendente até confirmação.
- Cancelar, fechar ou ignorar a proposta mantém o treino original.
- Testes regressivos cobrem verde, amarela, vermelha, descanso, dados incompletos, clique duplo e conflito com alteração feita diretamente no Intervals.icu.

## SPEC-09 — Slider do check-in permanece utilizável em zero

Status: planejada — correção de interface

Todos os controles do check-in devem manter trilho, indicador, botão deslizante, valor e área de toque visíveis quando o valor for zero ou estiver em qualquer extremo. Zero é um valor válido e deve ser enviado e salvo como zero, nunca interpretado como ausente.

Aceite:

- Em zero, o botão não desaparece, não é cortado e continua arrastável.
- O controle funciona por toque, mouse e teclado em celular e desktop.
- Valores zero de fadiga, dor, estresse, pernas, motivação, sintomas e tempo disponível permanecem após salvar e reabrir o PWA.
- O valor mostrado coincide com o valor enviado ao motor de prontidão.
- Há contraste, foco visível, alvo de toque adequado e rótulo acessível.
- Testes regressivos cobrem mínimo, máximo, ida e volta ao zero, recarga da página e tamanhos de tela móvel.
