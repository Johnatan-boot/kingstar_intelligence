# Documentação de Wireframes - WMS KingStar

Este documento contém a representação estrutural (wireframes) das principais telas do sistema WMS KingStar. O foco aqui é a disposição dos elementos, hierarquia de informação e navegação, sem detalhes de estilo (cores, fontes).

---

## 1. Estrutura Base (Layout Principal)

Todas as telas compartilham a mesma estrutura base de navegação.

```text
+-----------------------------------------------------------------------------+
| [Menu Toggle]  [Logo] KingStar Intelligence                                 |
+-----------------+-----------------------------------------------------------+
|                 |                                                           |
|  [ ] Dashboard  |  +-----------------------------------------------------+  |
|  [ ] Analytics  |  |                                                     |  |
|  [ ] Compras    |  |                                                     |  |
|  [ ] Recebimento|  |               ÁREA DE CONTEÚDO PRINCIPAL            |  |
|  [ ] Conferência|  |               (Varia conforme a página)             |  |
|  [ ] PCL        |  |                                                     |  |
|  [ ] Estoque    |  |                                                     |  |
|  [ ] Histórico  |  |                                                     |  |
|                 |  +-----------------------------------------------------+  |
|                 |                                                           |
+-----------------+-----------------------------------------------------------+
```

---

## 2. Tela de Compras (Importação de NFs)

**Objetivo:** Permitir o upload de planilhas de agendamento e visualizar as NFs pendentes.

```text
+-----------------------------------------------------------------------------+
| Título: Gestão de Compras e Agendamentos                                    |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | [Ícone de Upload]                                                       | |
| | Arraste e solte a planilha de agendamentos aqui                         | |
| | ou clique para selecionar o arquivo (.csv, .xlsx)                       | |
| |                                                                         | |
| | [ BOTÃO: Selecionar Arquivo ]                                           | |
| +-------------------------------------------------------------------------+ |
|                                                                             |
| Subtítulo: Ordens de Compra Pendentes                                       |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | Buscar: [ Input de texto... ]                                           | |
| +-------------------------------------------------------------------------+ |
| | ID NF | Fornecedor | Data Agend. | Status  | Itens | Ações              | |
| |-------|------------|-------------|---------|-------|--------------------| |
| | 1001  | Fornec. A  | 10/05/2024  | PENDENTE| 150   | [Ver Detalhes]     | |
| | 1002  | Fornec. B  | 11/05/2024  | PENDENTE| 300   | [Ver Detalhes]     | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## 3. Tela de Recebimento (Portaria/Doca)

**Objetivo:** Registrar a chegada do caminhão e vincular à NF.

```text
+-----------------------------------------------------------------------------+
| Título: Recebimento de Mercadorias                                          |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | Formulário de Novo Recebimento                                          | |
| |                                                                         | |
| | NF/Ordem de Compra: [ Select: Escolher NF Pendente v ]                  | |
| | Placa do Veículo:   [ Input: ABC-1234              ]                  | |
| | Tipo de Veículo:    [ Select: Carreta, Truck, etc. v ]                  | |
| |                                                                         | |
| | [ BOTÃO: Registrar Chegada e Iniciar Descarga ]                         | |
| +-------------------------------------------------------------------------+ |
|                                                                             |
| Subtítulo: Recebimentos em Andamento (Aguardando Conferência)               |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | ID Rec. | NF Vinculada | Placa    | Início Descarga | Ações             | |
| |---------|--------------|----------|-----------------|-------------------| |
| | REC-01  | 1001         | ABC-1234 | 14:30           | [Iniciar Conf.]   | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## 4. Tela de Conferência (Cega)

**Objetivo:** Contagem física das peças e registro de avarias.

```text
+-----------------------------------------------------------------------------+
| Título: Conferência de Mercadorias                                          |
|                                                                             |
| Lista de Recebimentos Prontos para Conferência:                             |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | [v] NF: 1001 | Fornecedor A | Placa: ABC-1234 | Status: CONFERÊNCIA     | |
| |-------------------------------------------------------------------------| |
| |  Detalhes da Conferência:                                               | |
| |  Itens Esperados: 150 (Oculto na prática se for cega total)             | |
| |                                                                         | |
| |  Peças Contadas: [ Input Numérico: 150 ]                                | |
| |  Houve Avarias?: ( ) Sim  (x) Não                                       | |
| |                                                                         | |
| |  [ BOTÃO: Finalizar Conferência ]                                       | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## 5. Tela de PCL (Divergências)

**Objetivo:** Analisar NFs que falharam na conferência e decidir aprovação com ressalva ou rejeição.

```text
+-----------------------------------------------------------------------------+
| Título: PCL - Painel de Controle Logístico (Divergências)                   |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | [!] NF: 1003 | Fornecedor C | Divergência Detectada                     | |
| |-------------------------------------------------------------------------| |
| |  Esperado: 200 peças                                                    | |
| |  Contado:  195 peças                                                    | |
| |  Avarias:  5 peças                                                      | |
| |                                                                         | |
| |  Ação de Resolução:                                                     | |
| |  [ BOTÃO VERDE: Aprovar com Ressalva ]  [ BOTÃO VERMELHO: Rejeitar NF ] | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## 6. Tela de Histórico

**Objetivo:** Consulta de todas as NFs concluídas com sucesso.

```text
+-----------------------------------------------------------------------------+
| Título: Histórico de NFs Concluídas                                         |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | Buscar: [ Input: NF, Fornecedor, Placa... ]  [ BOTÃO: Filtrar ]         | |
| +-------------------------------------------------------------------------+ |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | [v] NF: 1001 | Fornec. A | Concluída em: 10/05/2024 15:45               | |
| |-------------------------------------------------------------------------| |
| |  Dados do Recebimento:                                                  | |
| |  - Placa: ABC-1234                                                      | |
| |  - Início: 14:30 | Fim: 15:45 | Duração: 75 min                         | |
| |                                                                         | |
| |  Dados da Conferência:                                                  | |
| |  - Peças Esperadas: 150                                                 | |
| |  - Peças Contadas: 150                                                  | |
| |  - Avarias: 0                                                           | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```
