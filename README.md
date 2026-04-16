# King Star WMS

Sistema de Gerenciamento de Armazém (Warehouse Management System) desenvolvido para otimizar o recebimento, conferência, prevenção de perdas e controle de estoque.

## 🚀 Funcionalidades

- **Compras (Importação):** Importação de Notas Fiscais (POs) via CSV com mapeamento inteligente de colunas.
- **Recebimento:** Registro de chegada de veículos (placa, tipo) e vinculação com as NFs aguardando descarga.
- **Conferência:** Contagem cega de mercadorias, registro de avarias e validação automática de divergências.
- **PCL (Prevenção de Perdas):** Fila de análise para divergências (sobras, faltas, avarias) com aprovação com ressalva ou rejeição.
- **Estoque:** Visualização em tempo real do inventário aprovado e disponível.
- **Dashboard:** Métricas de produtividade, tempo médio de operação, SLA e índice de erros.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Node.js, Express
- **Banco de Dados:** Estrutura relacional pronta para MySQL (atualmente rodando em memória para ambiente de desenvolvimento)

## 📦 Como executar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/kingstar-wms.git
   ```
2. Entre na pasta do projeto:
   ```bash
   cd kingstar-wms
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse no navegador: `http://localhost:3000`

## 🧪 Arquitetura de Testes

Este projeto implementa uma suíte completa de testes para garantir a qualidade, segurança e performance do software (nível Enterprise).

### 1. Testes de Regressão e Qualidade (Unitários)
Utilizamos **Vitest** e **React Testing Library** para testar componentes isolados e garantir que novas alterações não quebrem funcionalidades antigas.
```bash
npm test
# Para gerar o relatório de cobertura de código (Code Coverage):
npm run test:coverage
```

### 2. Testes de Ponta a Ponta (E2E)
Utilizamos **Playwright** para simular um usuário real navegando pelo sistema, clicando em botões e validando fluxos completos.
*(Nota: Antes de rodar a primeira vez, execute `npx playwright install` para baixar os navegadores).*
```bash
npm run test:e2e
```

### 3. Testes de Stress e Carga
Utilizamos **Artillery** para simular dezenas de operadores acessando a API do WMS simultaneamente, garantindo que o servidor não caia em horários de pico.
```bash
npm run test:load
```

### 4. Testes de Segurança
Utilizamos auditoria nativa do NPM para escanear as dependências do projeto em busca de vulnerabilidades de segurança conhecidas (CVEs).
```bash
npm run test:security
```

## 🗄️ Banco de Dados (MySQL)
O script de criação do banco de dados relacional encontra-se no arquivo `database_schema.sql` na raiz do projeto. Ele contém toda a modelagem (DDL) necessária para migrar o sistema do modo "em memória" para produção.

---
*Desenvolvido para operação logística de alta performance.*
# kingstar_intelligence
