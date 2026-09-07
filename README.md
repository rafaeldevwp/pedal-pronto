# Pedal Pronto

PWA pessoal de prontidão e adaptação segura de treinos de ciclismo. Cruza recuperação do Polar com calendário, carga e desempenho do Intervals.icu.

## Princípios

- Intervals.icu permanece como fonte oficial do plano.
- Boa prontidão nunca aumenta automaticamente o treino.
- Dados incompletos não autorizam alterações.
- Alterações futuras exigem confirmação.
- Atividades realizadas e dados históricos nunca são modificados.

## Desenvolvimento

Requisitos: Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Para validar a versão:

```bash
npm run build
```

## Configuração

As integrações dependem de variáveis de ambiente fornecidas pela hospedagem:

- `POLAR_CLIENT_ID`
- `POLAR_CLIENT_SECRET`
- `POLAR_REDIRECT_URI`
- `INTERVALS_API_KEY`
- `INTERVALS_ATHLETE_ID`

Nunca salve valores reais no repositório. Arquivos `.env*` são ignorados.

## Continuidade

Antes de implementar, leia `PROJECT_MEMORY.md` e `docs/PREFLIGHT.md`. A fila objetiva está em `docs/TASKS.md` e as especificações em `docs/SPECS.md`.

