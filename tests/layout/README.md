# Auditoria de layout

Script da auditoria da SPEC-45 a SPEC-50. Não roda no `npm test` nem no `npm run test:workers` —
precisa do app no ar e de um Chromium. É a base da **SPEC-50**, que propõe transformá-lo em
verificação com aprovação/reprovação.

```
npm run dev                       # em outro terminal
node tests/layout/audit.mjs
```

Abre as quatro abas em sete larguras (320 a 1440), com as rotas de API interceptadas por
`fixtures.mjs` para que as telas apareçam com dados realistas em vez do estado desconectado.
Mede no DOM: estouro horizontal, alvos abaixo de 44×44, texto abaixo de 12px e comprimento de
linha. Grava capturas em `shots/` e os números em `report.json` — os dois ficam fora do git.

O caminho do Playwright está fixo no ambiente onde a auditoria foi feita; ajuste o `import` se
o seu for outro.
