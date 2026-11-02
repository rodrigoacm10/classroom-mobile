# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

<!-- Recorded as the closest schema value: one Locus identity shared across iOS and Android (confirmed), while native conventions (safe areas, gestures, touch targets, Reduce Motion) are respected per OS. -->

## Users
Alunos de instituições de ensino superior e técnico que usam o app Locus Classroom no celular: abrem o app em sala (para confirmar presença em uma chamada ao vivo) e entre as aulas (para conferir a própria frequência). Escopo deste arquivo: somente `classroom-app` (aluno); o `PRODUCT.md` da raiz descreve o dashboard web do professor/admin.

## Product Purpose
Permitir que o aluno confirme presença física via geofence (raio da sala + código do dia) e acompanhe a própria frequência por turma, com alerta quando se aproxima do limite de faltas (abaixo de 75% = em risco). Sucesso: o aluno sabe, sem pedir a ninguém, se sua presença foi registrada e se está em risco.

## Positioning
Presença validada por geofence dinâmico, sem hardware (catraca/biometria), com feedback transparente ao aluno sobre o resultado de cada chamada, inclusive quando a validação marca a presença como irregular.

## Operating Context
App Expo / React Native (expo-router, NativeWind) consumindo a API FastAPI multi-tenant. Abas do aluno: Turmas, Chamada, Histórico, Perfil. Dados do aluno hoje: `/members/me/subject-classes` (frequência, total de sessões e faltas por turma), `/members/me/metrics` (turmas, frequência média, turmas em risco) e `/attendance-sessions/active/me` (chamadas abertas e status do registro). Estados de registro na API: `regular`, `irregular` (aguarda revisão do professor), `approved`, `rejected`. Estados de sessão: `open`, `closed`, `cancelled`.

## Capabilities and Constraints
- Histórico integrado via `GET /attendance-sessions/history/me`.
- Geolocalização nativa do aluno obtida via `expo-location` (alta precisão / GPS) para validação contra o raio de tolerância da sala cadastrada.
- Falta = sessão encerrada sem registro do aluno (não existe registro "ausente" persistido). "Justificada" não existe na API; não exibir.
- Limite de risco: frequência abaixo de 75%.
- Terminologia: chamada, turma, disciplina, presença, falta, irregular, em análise.

## Brand Commitments
Identidade "Locus" já implementada em `src/theme/tokens.ts` e `global.css` (Ink/Paper de alto contraste, acento amarelo `#ffc400`, Archivo + IBM Plex Mono para números, cantos 6/10/16, sombras mínimas). A mesma em iOS e Android.

## Evidence on Hand
- Telas do aluno: Home/Turmas (`home-aluno.tsx`), Chamada (`chamada.tsx`), Histórico (`historico-aluno.tsx`), Perfil (`perfil.tsx`).
- Referência web: `classroom-web/src/modules/chamadas/pages/chamadas-realizadas.tsx` (métricas, filtros, tabela, modal de detalhe), visão do professor.
- Padrões do app a reutilizar: `ScreenHeader`, `HomeStats`, `ClassRow` (barra de frequência, limite 75%), `Notice`, tokens.
- Ausência: não há dados reais de histórico do aluno; não inventar números fora do mock rotulado.

## Product Principles
1. **Clareza do resultado**: o aluno sempre entende o que aconteceu com cada chamada e por quê.
2. **Risco antes de ruído**: frequência e proximidade do limite aparecem antes de qualquer listagem.
3. **Honestidade de estado**: "em análise" e "rejeitada" nunca são mascaradas como presença ou falta.
4. **Uso com uma mão, entre aulas**: leitura rápida, alvos de toque confortáveis.

## Accessibility & Inclusion
Contraste alto já presente nos tokens; estado nunca comunicado só por cor (rótulo + ícone/forma); alvos de toque mínimos 44 pt (iOS) / 48 dp (Android); respeitar Reduce Motion; português do Brasil.
