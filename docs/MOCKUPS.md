# Especificações de Mockup e UI - WMS KingStar

Este documento descreve as especificações visuais (Mockup) do sistema WMS KingStar. Ele define a paleta de cores, tipografia, estilos de componentes e comportamentos de interação para garantir consistência visual em toda a aplicação.

---

## 1. Identidade Visual e Tema

O sistema utiliza um tema predominantemente **Dark Mode** (escuro), com detalhes em ciano e amarelo para destacar ações e informações importantes, transmitindo um aspecto moderno e tecnológico ("Intelligence").

### Paleta de Cores (Tailwind CSS Variables)

*   **Background Principal (`bg-kingstar-bg`):** `#121212` (Quase preto, fundo da página)
*   **Background de Painéis/Cards (`bg-kingstar-panel` / `bg-zinc-900`):** `#18181b` a `#1e1e1e` (Cinza muito escuro, para destacar áreas de conteúdo)
*   **Cor Primária/Destaque (`text-kingstar-cyan`):** `#38bdf8` (Ciano brilhante, usado em títulos, links ativos e ícones de destaque)
*   **Cor Secundária/Atenção (`text-kingstar-yellow`):** `#facc15` (Amarelo, usado para status pendentes ou alertas moderados)
*   **Cor de Sucesso (`text-kingstar-green`):** `#22c55e` (Verde, usado para status concluídos e botões de aprovação)
*   **Cor de Erro/Perigo (`text-kingstar-red`):** `#ef4444` (Vermelho, usado para divergências, erros e botões de rejeição)
*   **Texto Principal:** `#e5e5e5` (Cinza claro, para alta legibilidade no fundo escuro)
*   **Texto Secundário:** `#9ca3af` (Cinza médio, para labels e informações menos prioritárias)
*   **Bordas (`border-zinc-800`):** `#27272a` (Cinza escuro, para separadores sutis)

### Tipografia

*   **Fonte Principal:** `Inter`, `system-ui`, `sans-serif`.
*   **Títulos (H1, H2):** Fonte em peso `bold` (700) ou `semibold` (600), frequentemente utilizando a cor ciano para o título principal da página.
*   **Corpo de Texto:** Peso `normal` (400), tamanho `14px` (text-sm) ou `16px` (text-base).

---

## 2. Especificações de Componentes

### 2.1. Sidebar (Menu Lateral)
*   **Fundo:** `#0a0a0a` (Mais escuro que o fundo principal para criar profundidade).
*   **Itens Inativos:** Ícone e texto em cinza (`#9ca3af`). Hover altera o fundo para `#27272a` e o texto para branco.
*   **Item Ativo:** Fundo ciano (`#38bdf8`), texto e ícone pretos (`#000000`), peso da fonte `semibold`.
*   **Comportamento:** Fixo à esquerda em telas grandes (Desktop). Em dispositivos móveis, fica oculto e desliza da esquerda para a direita ao clicar no ícone de menu (hambúrguer), com um overlay escuro (`bg-black/50`) sobre o conteúdo principal.

### 2.2. Header (Cabeçalho)
*   **Fundo:** `#0a0a0a`.
*   **Borda Inferior:** 1px sólida `#27272a`.
*   **Logo:** Avatar circular amarelo (`#facc15`) com as iniciais "KS" em preto, seguido do texto "KingStar Intelligence" em ciano.

### 2.3. Cards e Painéis
*   **Fundo:** `#18181b` (zinc-900).
*   **Borda:** 1px sólida `#27272a` (zinc-800).
*   **Raio da Borda (Border Radius):** `0.5rem` (rounded-lg) ou `0.75rem` (rounded-xl) para um visual suave.
*   **Sombra:** `shadow-lg` ou `shadow-md` sutil, preta com baixa opacidade.

### 2.4. Botões
*   **Primário (Ação Principal):** Fundo ciano (`#38bdf8`), texto preto, hover com leve aumento de brilho ou opacidade.
*   **Secundário:** Fundo transparente, borda ciano, texto ciano. Hover preenche o fundo com ciano (baixa opacidade).
*   **Sucesso:** Fundo verde (`#22c55e`), texto branco.
*   **Perigo/Rejeitar:** Fundo vermelho (`#ef4444`), texto branco.
*   **Desabilitado:** Fundo cinza escuro (`#3f3f46`), texto cinza médio (`#a1a1aa`), cursor `not-allowed`.
*   **Raio da Borda:** `0.375rem` (rounded-md).
*   **Transições:** `transition-colors duration-200` para hover e focus.

### 2.5. Inputs e Formulários
*   **Fundo do Input:** `#121212` (zinc-950) ou `#27272a` (zinc-800).
*   **Borda:** 1px sólida `#3f3f46` (zinc-700).
*   **Focus:** Anel (ring) ciano de 2px, sem outline padrão.
*   **Texto:** Branco.
*   **Placeholder:** Cinza médio (`#9ca3af`).

### 2.6. Tabelas e Listas
*   **Cabeçalho da Tabela:** Fundo ligeiramente mais claro que o painel (`#27272a`), texto em caixa alta, tamanho menor (`text-xs`), cor cinza (`#9ca3af`).
*   **Linhas:** Separadas por borda inferior sutil (`border-zinc-800`). Hover na linha altera levemente o fundo para indicar interatividade.
*   **Status Badges (Pílulas):**
    *   `PENDENTE`: Fundo amarelo com baixa opacidade, texto amarelo.
    *   `CONFERÊNCIA`: Fundo azul/ciano com baixa opacidade, texto ciano.
    *   `COMPLETED`: Fundo verde com baixa opacidade, texto verde.
    *   `DIVERGÊNCIA`: Fundo vermelho com baixa opacidade, texto vermelho.

---

## 3. Feedback e Notificações (Toasts)

O sistema utiliza a biblioteca `react-hot-toast` para feedback imediato.
*   **Posição:** Canto superior direito (`top-right`).
*   **Estilo Base:** Fundo `#18181b`, texto branco, borda `#27272a`.
*   **Sucesso:** Ícone verde/ciano.
*   **Erro:** Ícone vermelho.
*   **Carregamento (Loading):** Spinner animado.

---

## 4. Comportamentos Responsivos

*   **Mobile (< 640px):**
    *   Sidebar oculta, acessível via botão de menu no Header.
    *   Tabelas complexas (como Histórico) podem ganhar scroll horizontal ou serem transformadas em formato de lista de cards (stacking).
    *   Paddings reduzidos (`p-4` em vez de `p-8`).
*   **Tablet (640px - 1024px):**
    *   Ajustes de grid (ex: de 3 colunas para 2 colunas nos dashboards).
*   **Desktop (> 1024px):**
    *   Sidebar fixa à esquerda.
    *   Uso total da largura para tabelas e gráficos.
