# Memória do sistema — Pedal Pronto

Atualizado em: 2026-09-07

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
- Dados ausentes, atrasados, contraditórios ou sessão expirada: não alterar treino.
- Verde mantém o plano; boa prontidão nunca aumenta a sessão automaticamente.
- Amarela altera no máximo uma variável.
- Vermelha prioriza recuperação, endurance leve ou descanso.
- Quarta, sexta e domingo são descanso.
- Limites: segunda 1h; terça 1h20; quinta 1h20; sábado conforme o longo.
- Alteração de hoje pode ser automática pelas regras existentes.
- Alteração futura exige confirmação explícita no PWA.
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

## Estado exato de retomada

`NEXT`: revisar e publicar o lote T03–T07 somente quando o atleta ordenar.

A T03 até a T07 estão implementadas e validadas apenas localmente. A T07 mostra um alerta no app somente quando há risco moderado/alto e uma proposta revisável, nunca com dados incompletos. O atleta pode ativar notificação do PWA no celular; o mesmo alerta não é repetido e abre diretamente a proposta, que continua exigindo confirmação.

A versão online permanece na T02. Não publicar o lote T03–T07 até solicitação explícita do atleta.

O repositório privado `rafaeldevwp/pedal-pronto` foi criado e a integração recebeu acesso somente a ele. O envio inicial do conteúdo foi interrompido e deve ser retomado separadamente; não confundir isso com a publicação do PWA pelo Sites.

## Arquitetura curta

- `app/page.tsx`: interface principal do PWA.
- `app/api/readiness/route.ts` + `lib/readiness.ts`: decisão diária e ajuste de hoje.
- `app/api/week/route.ts`: semana, feedback, sugestão OFF e propostas futuras.
- `app/api/performance/route.ts`: evolução e potência.
- `app/api/profile/route.ts`: objetivo da temporada.
- `lib/polar.ts`: ambiente, identidade e estrutura D1.
- `drizzle/0002_training_decisions.sql`: histórico imutável de decisões.
- `.openai/hosting.json`: projeto hospedado e D1.

## Publicação

Projeto Sites privado, proprietário único. Antes de publicar: build, commit, envio da fonte, pacote com `dist` + hosting + migrations, salvar versão, publicar versão privada e confirmar sucesso.
