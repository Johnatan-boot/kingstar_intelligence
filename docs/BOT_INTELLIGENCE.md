# 🤖 Karen - Assistente Virtual da KingStar (Documentação)

Este documento explica o funcionamento, as habilidades e os limites da **Karen**, a Assistente de Inteligência Operacional integrada ao KingStar WMS.

---

## 1. Nível de Inteligência Atual: ~40% (Nível Consultivo)

Atualmente, a Karen possui cerca de **40% do seu potencial total**. 
Na arquitetura de IA, dividimos a inteligência em níveis:

*   ✅ **Nível 1: Leitura e Análise (Onde estamos - 40%)**
    A Karen consegue ler o banco de dados em tempo real, cruzar informações (ex: tempo vs. erros), entender o Score Operacional e explicar o que está acontecendo na operação.
*   ⏳ **Nível 2: Ação Assistida (Próximo passo - +30%)**
    A Karen poderá executar ações se você mandar. Ex: *"Karen, aprove a divergência da nota 123"*.
*   ⏳ **Nível 3: Autonomia (Futuro - +30%)**
    A Karen toma decisões sozinha e apenas avisa. Ex: *"Notei um gargalo na doca 2 e já redirecionei o caminhão para a doca 3"*.

---

## 2. Como ela funciona no mundo real (Pós-Download)?

**Sim, ela fiscalizará seus dados em tempo real.**
Quando você baixar este sistema (exportar o código) e conectá-lo ao seu banco de dados MySQL real da sua empresa, o fluxo será o seguinte:

1. Você digita uma pergunta.
2. A Karen vai até o seu banco de dados naquele exato milissegundo.
3. Ela extrai as métricas, produtividade, erros e histórico.
4. Ela envia esses dados para o "Cérebro" (OpenAI/Gemini).
5. O Cérebro processa e a Karen te responde com a realidade do seu galpão naquele instante.

---

## 3. Comportamento: É igual ao ChatGPT aberto?

**NÃO.** Nós configuramos um *System Prompt* (uma diretriz de comportamento restrita). 

*   **Foco Exclusivo:** Ela foi instruída a ser a "Karen, a assistente virtual de Inteligência Operacional da KingStar".
*   **Sem distrações:** Se você perguntar *"Qual a capital da França?"* ou *"Me dê uma receita de bolo"*, ela foi programada para responder educadamente que é uma assistente logística e não pode ajudar com outros assuntos.
*   **Baseado em Fatos:** Ela não "inventa" dados logísticos. Ela é forçada a basear suas respostas **exclusivamente** no JSON de dados que o backend entrega para ela.

---

## 4. Habilidades Atuais (O que ele sabe fazer)

1.  **Leitura de KPIs:** Sabe exatamente quantos veículos chegaram, quantas NFs foram concluídas e quantas peças foram conferidas hoje.
2.  **Análise de Produtividade:** Sabe o tempo médio que sua equipe leva para receber e conferir mercadorias.
3.  **Auditoria de Qualidade:** Sabe a taxa de erro (%) e a quantidade de divergências atuais.
4.  **Interpretação de Score:** Entende o "Score Operacional" (0 a 100) e sabe explicar por que a operação está classificada como "Excelente", "Boa", "Regular" ou "Crítica".
5.  **Análise de Histórico:** Consegue comparar o dia de hoje com os últimos 7 dias.

---

## 5. To-Do List de Testes (Perguntas para você fazer)

Aqui está uma lista de perguntas que você pode copiar e colar no chat do sistema para testar a inteligência dele:

### 📊 Testes de Visão Geral
*   *"Faça um resumo da nossa operação hoje."*
*   *"Qual é o nosso Score Operacional atual e em qual classificação estamos?"*
*   *"Quantos veículos já recebemos hoje e quantas NFs foram concluídas?"*

### ⏱️ Testes de Produtividade
*   *"Qual é o nosso tempo médio de recebimento e conferência? Estamos rápidos?"*
*   *"Onde estamos perdendo mais pontos no nosso Score? É no tempo ou nos erros?"*

### ⚠️ Testes de Qualidade e Erros
*   *"Qual é a nossa taxa de erro atual nas conferências?"*
*   *"Temos muitas divergências hoje? Isso está afetando nossa nota?"*

### 📈 Testes de Histórico
*   *"Como está o nosso volume de veículos hoje comparado com o histórico dos últimos dias?"*

### 🛡️ Testes de Segurança (Para provar que ele não é um ChatGPT genérico)
*   *"Escreva um poema sobre flores."* (Ele deve negar).
*   *"Como faço para consertar o motor de um carro?"* (Ele deve negar).
