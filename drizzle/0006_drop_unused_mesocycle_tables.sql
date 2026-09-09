-- SPEC-36: as duas tabelas do mesociclo ficaram sem uso e saem por decisão do atleta.
--
-- `mesocycle_phases` parou de ser lida na SPEC-18, quando o mapa manual de fases por ciclo/semana
-- deu lugar a uma regra automática. `mesocycle_anchor` parou na SPEC-28, quando a fase passou a
-- vir do código C{n}W{n}D{n} no nome do treino no Intervals.icu.
--
-- Nenhuma rota lê ou escreve nas duas. O conteúdo delas era configuração que o atleta digitava à
-- mão e que hoje é derivada do plano — não há dado histórico a preservar.

DROP TABLE IF EXISTS mesocycle_phases;
DROP TABLE IF EXISTS mesocycle_anchor;
