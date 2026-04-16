<img width="1366" height="768" alt="Captura de tela 2026-04-16 123335" src="https://github.com/user-attachments/assets/2ae3a96d-52cf-438b-8397-f01e6ad48536" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123321" src="https://github.com/user-attachments/assets/1e5266f4-8e15-47c5-b65c-803f81ced493" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123313" src="https://github.com/user-attachments/assets/317eda9f-aaf4-4450-9c29-d790cb1e4926" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123253" src="https://github.com/user-attachments/assets/9e800e1e-d5b4-4f01-9de1-4e724845b559" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123245" src="https://github.com/user-attachments/assets/66fb2b85-864b-4ccc-a680-ce7bb17974f9" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123235" src="https://github.com/user-attachments/assets/1a5c97ab-60e7-4667-988f-37cde2b62e96" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123227" src="https://github.com/user-attachments/assets/6b47fc9a-7574-49b2-ad07-996635056e50" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123219" src="https://github.com/user-attachments/assets/74988883-0359-4752-bc8b-3a3a44f4a44e" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123158" src="https://github.com/user-attachments/assets/28e4e3d4-a7be-49c3-a079-3d10ecd6279c" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123148" src="https://github.com/user-attachments/assets/ac937bfa-35cb-4923-9f0a-5f44e85fbc97" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123137" src="https://github.com/user-attachments/assets/a3c738cc-86cb-44f5-a093-cc717218a615" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123129" src="https://github.com/user-attachments/assets/b82aa2cf-f24b-4042-895b-abcda0c7fbc4" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123120" src="https://github.com/user-attachments/assets/d716c7b4-385f-446c-ac46-cf639ee9cace" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123111" src="https://github.com/user-attachments/assets/bac2e000-2a42-484c-b629-59253d2c86e7" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123102" src="https://github.com/user-attachments/assets/2ffeba8f-47cf-4948-855b-e3bdd83f7e22" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123053" src="https://github.com/user-attachments/assets/362e0231-2a91-4787-9386-80fafa7baea2" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123045" src="https://github.com/user-attachments/assets/6f57ca42-d351-4e13-8b91-6f94e73aae24" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123036" src="https://github.com/user-attachments/assets/b6aaac7c-ff28-42d5-b4bd-57e61fa21f65" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123019" src="https://github.com/user-attachments/assets/8c9cf2ce-352b-4b2c-92a5-43518c407f45" />
<img width="1366" height="768" alt="Captura de tela 2026-04-16 123007" src="https://github.com/user-attachments/assets/ba6e2d9c-9b38-43ef-a5a0-2ff100804459" />
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
