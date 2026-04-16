# Arquitetura do Sistema - KingStar WMS

A arquitetura do KingStar WMS foi desenhada baseada nos princípios da **Clean Architecture** combinada com **MVC** nas camadas de entrega, garantindo separação de responsabilidades, testabilidade e escalabilidade.

## 📁 Estrutura de Pastas (Backend)

O backend será refatorado de um único arquivo `server.ts` para a seguinte estrutura modular:

```text
src/backend/
├── domain/                  # Regras de negócio core (Entidades e Contratos)
│   ├── entities/            # Modelos de domínio (PurchaseOrder, Receiving, etc)
│   └── repositories/        # Interfaces dos repositórios
├── application/             # Casos de uso e serviços da aplicação
│   ├── useCases/            # Lógica de orquestração (ex: StartConferenceUseCase)
│   └── services/            # Serviços de domínio (ex: ScoreCalculatorService)
├── infrastructure/          # Detalhes técnicos e integrações externas
│   ├── database/            # Implementação dos repositórios (MySQL/Prisma/TypeORM)
│   ├── http/                # Camada de entrega web
│   │   ├── controllers/     # Controladores (MVC)
│   │   ├── routes/          # Definição de rotas Express/Fastify
│   │   └── middlewares/     # Interceptadores (Autenticação, Erros)
│   ├── bot/                 # Integração com OpenAI/Gemini (Agente 8)
│   └── events/              # Event Emitter / Mensageria
└── server.ts                # Ponto de entrada da aplicação
```

## 🔄 Fluxo de Dados

1. **Requisição (Frontend/Bot):** Chega através das rotas (`infrastructure/http/routes`).
2. **Controller:** O controlador (`infrastructure/http/controllers`) recebe a requisição, valida os dados de entrada (DTOs) e chama o Caso de Uso apropriado.
3. **Use Case:** O caso de uso (`application/useCases`) orquestra a lógica de negócio. Ele utiliza as interfaces de repositório para buscar dados.
4. **Domain:** As entidades (`domain/entities`) garantem a consistência dos dados e regras de negócio puras (ex: cálculo de divergência).
5. **Infrastructure (Database):** A implementação concreta do repositório (`infrastructure/database`) executa a query no MySQL e retorna os dados mapeados para a entidade.
6. **Resposta:** O fluxo retorna até o Controller, que formata a resposta (JSON) e envia de volta ao cliente.

## 🤖 Integração do Bot de Inteligência Operacional

O Bot atuará como um "Controller" alternativo ou um "Service" na camada de infraestrutura. Ele receberá perguntas em linguagem natural, utilizará ferramentas (Function Calling da OpenAI/Gemini) para acionar os Casos de Uso (ex: `GetAnalyticsUseCase`), e formulará a resposta baseada nos dados reais do sistema.

---
*Assinado: Agent 1 — Arquitetura*
