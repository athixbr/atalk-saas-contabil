# 📋 Documentação do CRM - Frontend

## 📁 Estrutura de Arquivos

```
frontend/src/
├── pages/
│   └── CRM/
│       ├── index.js          # Página principal com Kanban
│       ├── Settings.js       # Configurações do CRM
│       └── LeadDetail.js     # Detalhes do Lead
├── services/
│   └── crmApi.js            # API Service
└── routes/
    └── index.js             # Rotas configuradas
```

## 🎯 Funcionalidades Implementadas

### 1. Pipeline Kanban (CRM Index)
**Rota:** `/crm`

**Funcionalidades:**
- ✅ Visualização de leads em pipeline Kanban
- ✅ Drag-and-drop entre etapas usando `react-trello`
- ✅ Dashboard com estatísticas:
  - Total de Leads
  - Leads Ativos
  - Leads Ganhos
  - Valor Total estimado
- ✅ Criação e edição de leads
- ✅ Visualização rápida de detalhes
- ✅ Navegação para detalhes completos
- ✅ Exclusão de leads
- ✅ Filtros por etapa do funil

**Componentes Utilizados:**
- `Board` do `react-trello` para Kanban
- Material-UI para interface
- React Hooks para estado

**Campos do Lead:**
- Nome (obrigatório)
- Telefone
- E-mail
- Tipo de Negócio
- Regime Tributário
- Fonte do Lead
- Responsável (Usuário)
- Valor Estimado
- Observações

### 2. Configurações do CRM
**Rota:** `/crm` (Aba Configurações)

**Funcionalidades:**
Gerenciamento de 5 entidades configuráveis:

#### 2.1 Tipos de Negócio
- MEI, ME, EPP, LTDA, SA, EIRELI, etc.
- Campos: Nome, Descrição, Status (Ativo/Inativo)

#### 2.2 Regimes Tributários
- Simples Nacional, Lucro Presumido, Lucro Real
- Campos: Nome, Descrição, Status

#### 2.3 Fontes de Lead
- Google, Instagram, Facebook, LinkedIn, Indicação, etc.
- Campos: Nome, Descrição, Status

#### 2.4 Etapas do Funil
- Prospecção, Qualificação, Proposta, Negociação, Fechamento, etc.
- Campos: Nome, Ordem, Cor, Status
- **Ordem** define a sequência no pipeline

#### 2.5 Categorias de Tarefas
- Comercial, Suporte, Operacional, etc.
- Campos: Nome, Tipo, Ícone, Cor, Status

**Operações CRUD:**
- ➕ Adicionar novo item
- ✏️ Editar item existente
- 🗑️ Excluir item
- 👁️ Visualizar em tabela

**Interface:**
- Abas para cada entidade
- Tabela com dados
- Modal para criar/editar
- Chips coloridos para status

### 3. Detalhes do Lead
**Rota:** `/crm/leads/:leadId`

**Funcionalidades:**

#### 3.1 Informações Gerais
- Exibição completa dos dados do lead
- Ícones visuais para cada campo
- Layout em grid responsivo
- Chip colorido para etapa atual

#### 3.2 Gestão de Tarefas
**Aba "Tarefas":**
- Lista de tarefas do lead
- Checkbox para marcar como concluída
- Campos da tarefa:
  - Título (obrigatório)
  - Descrição
  - Categoria
  - Prioridade (Alta/Média/Baixa)
  - Data de Vencimento
  - Responsável
  - Status (Pendente/Concluída)
- Cores por prioridade:
  - Alta: Vermelho (#f44336)
  - Média: Laranja (#ff9800)
  - Baixa: Verde (#4caf50)
- Operações:
  - ➕ Criar tarefa
  - ✏️ Editar tarefa
  - ✅ Toggle status
  - 🗑️ Excluir tarefa

#### 3.3 Timeline de Interações
**Aba "Timeline":**
- Registro cronológico de interações
- Tipos de interação:
  - Ligação (call)
  - E-mail (email)
  - Reunião (meeting)
  - WhatsApp (whatsapp)
  - Nota (note)
- Campos:
  - Tipo
  - Descrição
  - Data
  - Usuário responsável
- Visual timeline com marcadores
- Operações:
  - ➕ Registrar interação
  - 🗑️ Excluir interação

#### 3.4 Resumo (Aba "Visão Geral")
- Cards com métricas:
  - Total de tarefas
  - Tarefas concluídas
  - Total de interações

## 🔌 Integração com API

### Service Layer: `crmApi.js`

**Métodos Disponíveis:**

```javascript
// Business Types
getBusinessTypes(params)
createBusinessType(data)
updateBusinessType(id, data)
deleteBusinessType(id)

// Tax Regimes
getTaxRegimes(params)
createTaxRegime(data)
updateTaxRegime(id, data)
deleteTaxRegime(id)

// Sources
getSources(params)
createSource(data)
updateSource(id, data)
deleteSource(id)

// Stages
getStages(params)
createStage(data)
updateStage(id, data)
deleteStage(id)

// Task Categories
getTaskCategories(params)
createTaskCategory(data)
updateTaskCategory(id, data)
deleteTaskCategory(id)

// Leads
getLeads(params)
getLead(id)
createLead(data)
updateLead(id, data)
deleteLead(id)

// CRM Tasks
getCrmTasks(params)
getCrmTask(id)
createCrmTask(data)
updateCrmTask(id, data)
deleteCrmTask(id)

// Interactions
getInteractions(params)
getInteraction(id)
createInteraction(data)
deleteInteraction(id)
```

**Todos os métodos retornam Promises com os dados da API.**

## 🎨 Estilos e Design

### Bibliotecas Utilizadas:
- **Material-UI v4**: Componentes de interface
- **react-trello**: Board Kanban com drag-and-drop
- **react-toastify**: Notificações toast
- **date-fns**: Formatação de datas
- **react-router-dom**: Navegação

### Padrão de Cores:
- **Primary:** #0596cd (Azul principal)
- **Botão Principal:** Gradiente azul (#0596cd → #047ba5)
- **Botão Secundário:** Gradiente cinza (#757575 → #616161)
- **Success:** #4caf50 (Verde)
- **Error:** #f44336 (Vermelho)
- **Warning:** #ff9800 (Laranja)

### Estilo Visual:
- Border radius: 12px (containers principais)
- Border radius: 8px (cards menores)
- Sombras suaves (elevation 0-2)
- Transições suaves (0.3s ease)
- Hover effects em cards
- Gradient buttons

## 📱 Responsividade

### Breakpoints Material-UI:
- **xs:** < 600px (Mobile)
- **sm:** 600px - 960px (Tablet)
- **md:** 960px - 1280px (Desktop pequeno)
- **lg:** 1280px+ (Desktop grande)

### Grid System:
- Layout em Grid responsivo
- Cards adaptam tamanho conforme tela
- Kanban com scroll horizontal
- Tabs com scroll em mobile

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial
```
Component Mount
    ↓
loadData()
    ↓
API Calls (parallel)
    ↓
State Update
    ↓
Re-render
```

### 2. Criação de Lead
```
User clicks "Novo Lead"
    ↓
Modal opens
    ↓
User fills form
    ↓
handleSave()
    ↓
createLead(data)
    ↓
Toast success
    ↓
loadData() (refresh)
```

### 3. Drag-and-Drop
```
User drags card
    ↓
handleCardMove(cardId, sourceLane, targetLane)
    ↓
updateLead(id, { stage: newStage })
    ↓
Toast success
    ↓
loadData() (refresh)
```

## 🚀 Como Usar

### 1. Configuração Inicial
1. Acesse `/crm` (aba Configurações)
2. Configure as opções:
   - Tipos de Negócio
   - Regimes Tributários
   - Fontes de Lead
   - Etapas do Funil (defina ordem!)
   - Categorias de Tarefas

### 2. Gestão de Leads
1. Retorne à aba "Pipeline"
2. Clique em "Novo Lead"
3. Preencha os dados obrigatórios
4. Salve o lead
5. Arraste entre etapas conforme progresso

### 3. Gestão de Tarefas
1. Clique em "👁️ Visualizar" no card do lead
2. Acesse a aba "Tarefas"
3. Clique em "Nova Tarefa"
4. Defina título, prioridade, data
5. Marque como concluída quando finalizar

### 4. Registro de Interações
1. Na página de detalhes do lead
2. Acesse a aba "Timeline"
3. Clique em "Nova Interação"
4. Selecione tipo (ligação, email, etc)
5. Descreva a interação
6. Salve

## ⚠️ Validações

### Lead:
- Nome é obrigatório
- Demais campos opcionais

### Tarefa:
- Título é obrigatório
- LeadId é obrigatório (automático)

### Interação:
- Descrição é obrigatória
- LeadId é obrigatório (automático)
- UserId é obrigatório (automático)

### Etapas:
- Nome e Ordem são obrigatórios
- Ordem define sequência no Kanban

## 🔐 Segurança

- Todas as requisições passam pelo `isAuth` middleware no backend
- CompanyId filtrado automaticamente
- Validação de permissões no backend
- Toast messages para feedback de erros

## 📊 Métricas e KPIs

### Dashboard Cards:
1. **Total de Leads:** Contagem total
2. **Leads Ativos:** Status = "active"
3. **Leads Ganhos:** Status = "won"
4. **Valor Total:** Soma de `estimatedValue`

### Formatação:
- Moeda: Intl.NumberFormat pt-BR (R$)
- Data: format(date-fns) pt-BR (dd/MM/yyyy)
- DateTime: format(date-fns) pt-BR (dd/MM/yyyy HH:mm)

## 🔮 Melhorias Futuras Sugeridas

1. **Filtros Avançados:**
   - Por período
   - Por responsável
   - Por valor
   - Por fonte

2. **Relatórios:**
   - Conversão por etapa
   - Tempo médio por etapa
   - Taxa de conversão
   - Funil de vendas

3. **Automações:**
   - Tarefas automáticas por etapa
   - Notificações de follow-up
   - Lembretes de tarefas

4. **Integrações:**
   - WhatsApp (envio direto)
   - E-mail (envio direto)
   - Google Calendar

5. **Anexos:**
   - Upload de arquivos por lead
   - Galeria de documentos

## 📝 Notas Técnicas

### Performance:
- Lazy loading de componentes (considerar)
- Paginação para grandes volumes
- Debounce em buscas
- Memoization de cálculos pesados

### Acessibilidade:
- Labels em formulários
- ARIA labels onde necessário
- Navegação por teclado
- Contraste de cores adequado

### Manutenibilidade:
- Componentes reutilizáveis
- Services separados
- Estilos com makeStyles
- Código comentado onde necessário

## 🐛 Troubleshooting

### Lead não aparece no Kanban:
- Verifique se o `stage` corresponde ao nome de uma etapa
- Verifique se status = "active"

### Drag-and-drop não funciona:
- Confirme que react-trello está instalado
- Verifique console para erros de API

### Botão salvar não funciona:
- Verifique validações (campos obrigatórios)
- Veja console para erros de rede
- Confirme que backend está rodando

---

**Desenvolvido com:** React 16 + Material-UI v4 + react-trello
**Data:** Dezembro 2025
**Status:** ✅ Produção
