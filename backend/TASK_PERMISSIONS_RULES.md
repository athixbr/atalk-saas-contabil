# 🔐 Regras de Permissões - Sistema de Tarefas

## 📋 Visão Geral

Este documento descreve as regras de permissões implementadas no sistema de tarefas com soft delete e histórico de transferências.

---

## 👥 Perfis de Usuário

### 1. **ADMIN** (`profile: "admin"`)
- Acesso total ao sistema
- Pode gerenciar tarefas de qualquer usuário

### 2. **USER** (`profile: "user"`)
- Acesso limitado às suas próprias tarefas
- Pode transferir tarefas que estão com ele

---

## 🗑️ EXCLUSÃO DE TAREFAS (Soft Delete)

### ✅ ADMIN pode:
- ✅ Deletar **QUALQUER** tarefa da empresa
- ✅ Não há restrições

### ✅ USER pode:
- ✅ Deletar **APENAS** tarefas que **ELE CRIOU** (`createdBy = userId`)
- ❌ **NÃO** pode deletar tarefas criadas por outros usuários
- ❌ **NÃO** pode deletar tarefas que foram transferidas para ele

### 📝 Exemplo de Validação:
```typescript
// DeleteService.ts
const isAdmin = userProfile === "admin";
const isCreator = task.createdBy === parseInt(userId.toString());

if (!isAdmin && !isCreator) {
  throw new AppError("ERR_NO_PERMISSION_DELETE_TASK", 403);
}
```

### 🔍 Comportamento:
- Tarefa **NÃO é removida** do banco de dados
- Campo `deletedAt` recebe a data/hora atual
- Campo `deletedBy` recebe o ID do usuário que deletou
- Registro criado no `TaskHistory` com `actionType: "deleted"`

---

## 🔄 TRANSFERÊNCIA DE TAREFAS

### ✅ ADMIN pode:
- ✅ Transferir **QUALQUER** tarefa
- ✅ De qualquer usuário para qualquer usuário

### ✅ USER pode:
- ✅ Transferir **APENAS** tarefas que estão **COM ELE** (`userId = currentUserId`)
- ❌ **NÃO** pode transferir tarefas de outros usuários
- ❌ **NÃO** pode transferir tarefas que ele criou mas estão com outros

### 📝 Exemplo de Validação:
```typescript
// TransferTaskService.ts
const isAdmin = userProfile === "admin";
const isTaskOwner = task.userId === parseInt(performedBy.toString());

if (!isAdmin && !isTaskOwner) {
  throw new AppError("ERR_NO_PERMISSION_TRANSFER_TASK", 403);
}
```

### 🔍 Comportamento:
- Campo `userId` da tarefa é atualizado
- Registro criado no `TaskHistory` com `actionType: "transferred"`
- Histórico registra: De quem → Para quem, Data/hora, Quem fez, Notas opcionais
- Notificação via WebSocket para ambos os usuários

---

## 📊 VISUALIZAÇÃO DE TAREFAS

### ✅ ADMIN pode ver:
- ✅ **TODAS** as tarefas da empresa
- ✅ Tarefas de todos os usuários
- ✅ Tarefas deletadas (se filtrar)

### ✅ USER pode ver:
- ✅ Tarefas **CRIADAS por ele** (`createdBy = userId`)
- ✅ Tarefas **ATRIBUÍDAS a ele** (`userId = currentUserId`)
- ❌ **NÃO** vê tarefas de outros usuários

### 📝 Exemplo de Filtro:
```typescript
// ListService.ts
if (profile !== "admin" && requestUserId) {
  where[Op.or] = [
    { userId: requestUserId },
    { createdBy: requestUserId }
  ];
}
```

---

## 📜 HISTÓRICO DE TAREFAS

### Todos os perfis podem:
- ✅ Ver histórico de tarefas que têm acesso
- ✅ Visualizar transferências
- ✅ Visualizar exclusões

### Tipos de Ações Registradas:
1. **`created`** - Tarefa criada
2. **`transferred`** - Tarefa transferida
3. **`deleted`** - Tarefa deletada (soft delete)

### Campos Registrados:
```typescript
{
  taskId: number;           // ID da tarefa
  fromUserId: number;       // De quem (em transferências)
  toUserId: number;         // Para quem (em transferências)
  actionType: string;       // Tipo de ação
  previousValue: JSON;      // Valor anterior
  newValue: JSON;          // Valor novo
  performedBy: number;     // Quem executou a ação
  notes: string;           // Observações (opcional)
  createdAt: Date;         // Data/hora
}
```

---

## 🔒 Mensagens de Erro

### ERR_NO_PERMISSION_DELETE_TASK (403)
**Quando:** User tenta deletar tarefa que não criou
**Mensagem:** "Você não tem permissão para excluir esta tarefa. Apenas o criador pode excluí-la."

### ERR_NO_PERMISSION_TRANSFER_TASK (403)
**Quando:** User tenta transferir tarefa que não está com ele
**Mensagem:** "Você não tem permissão para transferir esta tarefa. Apenas tarefas atribuídas a você podem ser transferidas."

### ERR_NO_TASK_FOUND (404)
**Quando:** Tarefa não existe ou foi deletada
**Mensagem:** "Tarefa não encontrada."

### ERR_USER_NOT_FOUND (404)
**Quando:** Usuário de destino não existe
**Mensagem:** "Usuário não encontrado."

### ERR_TO_USER_REQUIRED (400)
**Quando:** Falta parâmetro toUserId na transferência
**Mensagem:** "Usuário de destino é obrigatório."

---

## 🎯 Casos de Uso

### Cenário 1: Usuário cria e deleta sua própria tarefa
```
1. User A cria tarefa X (createdBy = A, userId = A)
2. User A pode deletar tarefa X ✅
```

### Cenário 2: Usuário cria e transfere tarefa
```
1. User A cria tarefa X (createdBy = A, userId = A)
2. User A transfere para User B (userId = B)
3. User A NÃO pode mais deletar tarefa X ❌
4. User B NÃO pode deletar tarefa X ❌ (não é o criador)
5. User A ainda pode deletar pois é o criador ✅
```

### Cenário 3: Admin deleta qualquer tarefa
```
1. User A cria tarefa X
2. Admin pode deletar tarefa X ✅
3. Admin pode deletar tarefas de qualquer usuário ✅
```

### Cenário 4: Transferência em cadeia
```
1. User A cria tarefa (userId = A)
2. User A transfere para User B (userId = B)
   - User A não pode mais transferir ❌
   - User B pode transferir ✅
3. User B transfere para User C (userId = C)
   - User B não pode mais transferir ❌
   - User C pode transferir ✅
```

---

## 📊 Relatórios

### Tarefas Deletadas
```sql
SELECT * FROM tasks 
WHERE deletedAt IS NOT NULL
ORDER BY deletedAt DESC;
```

### Histórico de Transferências
```sql
SELECT * FROM task_history 
WHERE actionType = 'transferred'
ORDER BY createdAt DESC;
```

### Tarefas por Usuário (incluindo histórico)
```sql
SELECT 
  t.id,
  t.title,
  t.createdBy,
  t.userId,
  t.deletedAt,
  COUNT(th.id) as total_changes
FROM tasks t
LEFT JOIN task_history th ON th.taskId = t.id
WHERE t.companyId = ?
GROUP BY t.id;
```

---

## 🚀 Endpoints API

### DELETE /tasks/:taskId
**Descrição:** Soft delete de tarefa
**Permissão:** Admin (todas) | User (só criadas por ele)
**Body:** Nenhum
**Response:** `{ message: "Task deleted" }`

### POST /tasks/:taskId/transfer
**Descrição:** Transferir tarefa
**Permissão:** Admin (todas) | User (só atribuídas a ele)
**Body:**
```json
{
  "toUserId": 123,
  "notes": "Motivo da transferência (opcional)"
}
```
**Response:** `Task completa atualizada`

### GET /tasks/:taskId/history
**Descrição:** Buscar histórico da tarefa
**Permissão:** Qualquer usuário com acesso à tarefa
**Response:**
```json
[
  {
    "id": 1,
    "taskId": 10,
    "fromUserId": 5,
    "toUserId": 8,
    "actionType": "transferred",
    "performedBy": 5,
    "notes": "Transferindo por sobrecarga",
    "createdAt": "2025-02-01T10:00:00Z"
  }
]
```

---

## ⚡ WebSocket Events

### company{companyId}-task
**Emitido quando:**
- Tarefa criada (`action: "create"`)
- Tarefa atualizada (`action: "update"`)
- Tarefa deletada (`action: "delete"`)
- Tarefa transferida (`action: "transfer"`)

**Payload:**
```javascript
{
  action: "transfer",
  task: { ...taskCompleta }
}
```

---

## 🔍 Auditoria

Todas as ações são registradas com:
- ✅ Quem fez (performedBy)
- ✅ Quando fez (createdAt)
- ✅ O que mudou (previousValue → newValue)
- ✅ Por que fez (notes - opcional)

Isso permite:
- 📊 Relatórios de produtividade
- 🔍 Rastreamento de responsabilidades
- 📈 Análise de fluxo de trabalho
- 🛡️ Compliance e auditoria

---

**Última atualização:** Fevereiro 2025
**Versão:** 1.0
