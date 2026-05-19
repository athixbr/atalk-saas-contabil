# API CRM - Documentação das Rotas

## 📋 Índice
1. [Tipos de Negócio (Business Types)](#tipos-de-negócio)
2. [Regimes Tributários (Tax Regimes)](#regimes-tributários)
3. [Fontes de Lead (Sources)](#fontes-de-lead)
4. [Estágios do Pipeline (Stages)](#estágios-do-pipeline)
5. [Categorias de Tarefas (Task Categories)](#categorias-de-tarefas)
6. [Leads](#leads)
7. [Tarefas CRM (Tasks)](#tarefas-crm)
8. [Interações (Interactions)](#interações)

---

## Tipos de Negócio

### Listar Tipos de Negócio
```
GET /crm/business-types
Query Params: 
  - active: boolean (opcional)
```

### Criar Tipo de Negócio
```
POST /crm/business-types
Body: {
  "name": string (required),
  "description": string (optional),
  "active": boolean (optional, default: true)
}
```

### Visualizar Tipo de Negócio
```
GET /crm/business-types/:id
```

### Atualizar Tipo de Negócio
```
PUT /crm/business-types/:id
Body: {
  "name": string (optional),
  "description": string (optional),
  "active": boolean (optional)
}
```

### Deletar Tipo de Negócio
```
DELETE /crm/business-types/:id
```

---

## Regimes Tributários

### Listar Regimes Tributários
```
GET /crm/tax-regimes
Query Params: 
  - active: boolean (opcional)
```

### Criar Regime Tributário
```
POST /crm/tax-regimes
Body: {
  "name": string (required),
  "description": string (optional),
  "active": boolean (optional, default: true)
}
```

### Visualizar Regime Tributário
```
GET /crm/tax-regimes/:id
```

### Atualizar Regime Tributário
```
PUT /crm/tax-regimes/:id
Body: {
  "name": string (optional),
  "description": string (optional),
  "active": boolean (optional)
}
```

### Deletar Regime Tributário
```
DELETE /crm/tax-regimes/:id
```

---

## Fontes de Lead

### Listar Fontes
```
GET /crm/sources
Query Params: 
  - active: boolean (opcional)
```

### Criar Fonte
```
POST /crm/sources
Body: {
  "name": string (required),
  "description": string (optional),
  "active": boolean (optional, default: true)
}
```

### Visualizar Fonte
```
GET /crm/sources/:id
```

### Atualizar Fonte
```
PUT /crm/sources/:id
Body: {
  "name": string (optional),
  "description": string (optional),
  "active": boolean (optional)
}
```

### Deletar Fonte
```
DELETE /crm/sources/:id
```

---

## Estágios do Pipeline

### Listar Estágios
```
GET /crm/stages
Query Params: 
  - active: boolean (opcional)
```

### Criar Estágio
```
POST /crm/stages
Body: {
  "name": string (required),
  "order": number (required),
  "color": string (opcional, formato: #RRGGBB),
  "active": boolean (optional, default: true)
}
```

### Visualizar Estágio
```
GET /crm/stages/:id
```

### Atualizar Estágio
```
PUT /crm/stages/:id
Body: {
  "name": string (optional),
  "order": number (optional),
  "color": string (optional),
  "active": boolean (optional)
}
```

### Deletar Estágio
```
DELETE /crm/stages/:id
```

---

## Categorias de Tarefas

### Listar Categorias
```
GET /crm/task-categories
Query Params: 
  - active: boolean (opcional)
  - type: string (opcional - commercial, cs, operational)
```

### Criar Categoria
```
POST /crm/task-categories
Body: {
  "name": string (required),
  "type": string (opcional - commercial, cs, operational),
  "icon": string (opcional),
  "color": string (opcional, formato: #RRGGBB),
  "active": boolean (optional, default: true)
}
```

### Visualizar Categoria
```
GET /crm/task-categories/:id
```

### Atualizar Categoria
```
PUT /crm/task-categories/:id
Body: {
  "name": string (optional),
  "type": string (optional),
  "icon": string (optional),
  "color": string (optional),
  "active": boolean (optional)
}
```

### Deletar Categoria
```
DELETE /crm/task-categories/:id
```

---

## Leads

### Listar Leads
```
GET /crm/leads
Query Params: 
  - userId: number (opcional)
  - stage: string (opcional - prospecting, proposal, negotiation, closed, etc)
  - status: string (opcional - active, won, lost)
  - searchParam: string (opcional - busca por nome, email, telefone)
  - businessTypeId: number (opcional)
  - taxRegimeId: number (opcional)
  - sourceId: number (opcional)
```

### Criar Lead
```
POST /crm/leads
Body: {
  "name": string (required),
  "contactId": number (opcional),
  "phone": string (opcional),
  "email": string (opcional),
  "businessTypeId": number (opcional),
  "taxRegimeId": number (opcional),
  "sourceId": number (opcional),
  "userId": number (opcional - responsável),
  "stage": string (opcional, default: "prospecting"),
  "estimatedValue": number (opcional),
  "nextAction": string (opcional),
  "nextActionDate": date (opcional),
  "notes": string (opcional)
}
```

### Visualizar Lead
```
GET /crm/leads/:id
Retorna o lead com:
- Dados do contato
- Responsável (user)
- Tipo de negócio
- Regime tributário
- Fonte
- Tarefas relacionadas
- Interações (timeline)
```

### Atualizar Lead
```
PUT /crm/leads/:id
Body: {
  "name": string (optional),
  "contactId": number (optional),
  "phone": string (optional),
  "email": string (optional),
  "businessTypeId": number (optional),
  "taxRegimeId": number (optional),
  "sourceId": number (optional),
  "userId": number (optional),
  "stage": string (optional),
  "estimatedValue": number (optional),
  "lastContactDate": date (optional),
  "nextAction": string (optional),
  "nextActionDate": date (optional),
  "lostReason": string (optional),
  "closedAt": date (optional),
  "status": string (optional - active, won, lost),
  "notes": string (optional)
}
```

### Deletar Lead
```
DELETE /crm/leads/:id
```

---

## Tarefas CRM

### Listar Tarefas
```
GET /crm/tasks
Query Params: 
  - leadId: number (opcional)
  - userId: number (opcional)
  - categoryId: number (opcional)
  - status: string (opcional - pending, in_progress, completed, cancelled)
  - priority: string (opcional - low, medium, high)
```

### Criar Tarefa
```
POST /crm/tasks
Body: {
  "leadId": number (required),
  "userId": number (required - responsável),
  "categoryId": number (opcional),
  "title": string (required),
  "description": string (opcional),
  "dueDate": date (opcional),
  "status": string (opcional, default: "pending"),
  "priority": string (opcional, default: "medium")
}
```

### Visualizar Tarefa
```
GET /crm/tasks/:id
```

### Atualizar Tarefa
```
PUT /crm/tasks/:id
Body: {
  "title": string (optional),
  "description": string (optional),
  "categoryId": number (optional),
  "userId": number (optional),
  "dueDate": date (optional),
  "status": string (optional),
  "priority": string (optional),
  "completedAt": date (optional - auto-setado quando status = completed)
}
```

### Deletar Tarefa
```
DELETE /crm/tasks/:id
```

---

## Interações

### Listar Interações
```
GET /crm/interactions
Query Params: 
  - leadId: number (opcional)
  - userId: number (opcional)
  - type: string (opcional - call, email, meeting, whatsapp, note, etc)
```

### Criar Interação
```
POST /crm/interactions
Body: {
  "leadId": number (required),
  "userId": number (required),
  "type": string (required - call, email, meeting, whatsapp, note, etc),
  "description": string (required),
  "date": date (opcional, default: agora),
  "metadata": object (opcional - dados adicionais JSON)
}
```

### Visualizar Interação
```
GET /crm/interactions/:id
```

### Atualizar Interação
```
PUT /crm/interactions/:id
Body: {
  "type": string (optional),
  "description": string (optional),
  "date": date (optional),
  "metadata": object (optional)
}
```

### Deletar Interação
```
DELETE /crm/interactions/:id
```

---

## 🔔 WebSocket Events

Todos os CRUDs emitem eventos WebSocket para atualização em tempo real:

- `company{companyId}-crm-business-type` - { action: "create|update|delete", businessType/id }
- `company{companyId}-crm-tax-regime` - { action: "create|update|delete", taxRegime/id }
- `company{companyId}-crm-source` - { action: "create|update|delete", source/id }
- `company{companyId}-crm-stage` - { action: "create|update|delete", stage/id }
- `company{companyId}-crm-task-category` - { action: "create|update|delete", category/id }
- `company{companyId}-crm-lead` - { action: "create|update|delete", lead/id }
- `company{companyId}-crm-task` - { action: "create|update|delete", task/id }
- `company{companyId}-crm-interaction` - { action: "create|update|delete", interaction/id }

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via token JWT no header:
```
Authorization: Bearer {token}
```

O token deve conter:
- companyId (filtro automático de dados)
- userId (para auditoria)

---

## 📊 Estrutura de Dados Padrão

### Estágios Padrão do Pipeline
1. Prospecção
2. Qualificação
3. Proposta
4. Negociação
5. Fechamento
6. Onboarding

### Tipos de Negócio Padrão
- MEI, ME, EPP, LTDA, SA, EIRELI, Profissional Liberal

### Regimes Tributários Padrão
- Simples Nacional, Lucro Presumido, Lucro Real

### Fontes de Lead Padrão
- Indicação, Google, Instagram, Facebook, LinkedIn, Site, WhatsApp, Email, Telefone, Evento, Parceiro

### Categorias de Tarefas Padrão
- **Comercial**: Ligação de Prospecção, Enviar Proposta, Reunião Comercial, Follow-up, Negociação de Contrato
- **Customer Success**: Onboarding (Documentos, Configuração, Treinamento), Check-in Mensal, Renovação
- **Operacional**: Suporte Técnico

---

## 🚀 Para Popular Dados Iniciais

Execute o seed criado em:
```bash
cd /home/deploy/atalk/backend
npx ts-node src/database/seeds/20241202000001-crm-initial-data.ts
```

Ou execute os SQL commands gerados manualmente no banco de dados.
