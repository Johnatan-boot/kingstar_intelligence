# Schema de Banco de Dados - KingStar WMS

Este documento descreve as alterações e adições feitas no schema do banco de dados para suportar o módulo de Inteligência Operacional e Analytics.

## 🗄️ Novas Tabelas Adicionadas

As seguintes tabelas foram adicionadas ao arquivo `database_schema.sql`:

### 1. `daily_metrics` (Métricas Diárias)
Tabela de consolidação para alimentar dashboards de forma performática, sem precisar calcular tudo em tempo real a cada requisição.
*   `date` (PK): Data de referência.
*   `total_vehicles`: Total de veículos recebidos no dia.
*   `total_nfs_completed`: Total de NFs finalizadas.
*   `total_pieces_checked`: Volume total de peças conferidas.
*   `total_divergences`: Quantidade de divergências geradas.
*   `avg_receiving_time_min`: Tempo médio de recebimento.
*   `avg_conference_time_min`: Tempo médio de conferência.
*   `error_rate_percentage`: Taxa de erro do dia.

### 2. `operational_scores` (Score Operacional Histórico)
Armazena o cálculo diário do score operacional, permitindo analisar a evolução da performance ao longo do tempo.
*   `date` (Unique): Data do score.
*   `time_score`: Pontuação de tempo (30%).
*   `error_score`: Pontuação de erros (30%).
*   `attempts_score`: Pontuação de tentativas (20%).
*   `volume_score`: Pontuação de volume (20%).
*   `total_score`: Score final (0-100).
*   `classification`: Classificação (Excelente, Bom, Regular, Crítico).

### 3. `operational_logs` (Logs Operacionais)
Tabela crucial para o aprendizado do BOT. Registra eventos importantes do sistema com um payload JSON flexível.
*   `event_type`: Tipo do evento (ex: `CONFERENCE_FAILED`, `PCL_APPROVED`).
*   `entity_id`: ID da entidade relacionada (NF, Conferência).
*   `details`: Campo JSON contendo o contexto do evento (ex: quantidade de peças faltando, usuário responsável).

### 4. `bot_interactions` (Interações do BOT)
Histórico de conversas com o BOT de Inteligência Operacional.
*   `user_id`: Usuário que fez a pergunta.
*   `query`: Pergunta em linguagem natural.
*   `response`: Resposta gerada pelo BOT.
*   `intent`: Intenção detectada (ex: `GET_ANALYTICS`).

## 🧹 Limpeza
Os inserts de dados falsos (mock data) foram removidos do script SQL para garantir que o banco inicie limpo em produção.

---
*Assinado: Agent 2 — Database*
