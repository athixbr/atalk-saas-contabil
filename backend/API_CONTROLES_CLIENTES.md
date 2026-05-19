# API de Controles-Clientes - Documentação Completa

## 📋 Visão Geral

API REST para gerenciar vínculos entre controles e clientes, incluindo notificações automáticas, histórico de alterações e geração de tarefas recorrentes.

**Base URL:** `/controle-clientes`

## 🔐 Autenticação

Todas as rotas requerem autenticação via token JWT no header:
```
Authorization: Bearer {token}
```

## 📡 Endpoints

### 1. Vincular Clientes a um Controle

**POST** `/vinculos`

Vincula um ou mais clientes a um controle, com possibilidade de definir responsáveis e gerar tarefas automaticamente.

#### Request Body:
```json
{
  "controleConfigId": 1,
  "clientes": [
    {
      "clienteId": 10,
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31"
    },
    {
      "clienteId": 11,
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31"
    }
  ],
  "departamentoId": 5,
  "usuarioId": null,
  "usuariosIds": [12, 15, 18],
  "observacoes": "Controle anual de certidões",
  "gerarTarefasImediatamente": true
}
```

#### Response (201):
```json
{
  "vinculos": [
    {
      "id": 100,
      "controleConfigId": 1,
      "clienteId": 10,
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31",
      "departamentoId": 5,
      "usuarioId": null,
      "ativo": true,
      "observacoes": "Controle anual de certidões",
      "controleConfig": { "id": 1, "nome": "Certidões Fiscais" },
      "cliente": { "id": 10, "nome": "Empresa ABC Ltda" }
    }
  ],
  "tarefasGeradas": 12,
  "notificacoesEnviadas": 2
}
```

---

### 2. Listar Vínculos com Filtros

**GET** `/vinculos`

Lista vínculos com filtros e paginação.

#### Query Parameters:
```
controleConfigId: number (opcional)
clienteId: number (opcional)
departamentoId: number (opcional)
usuarioId: number (opcional)
ativo: boolean (opcional)
dataInicioMin: date (opcional)
dataInicioMax: date (opcional)
dataFimMin: date (opcional)
dataFimMax: date (opcional)
searchParam: string (opcional - busca por nome do cliente)
pageNumber: number (default: 1)
pageSize: number (default: 20)
```

#### Exemplo de Request:
```
GET /vinculos?ativo=true&departamentoId=5&pageNumber=1&pageSize=20
```

#### Response (200):
```json
{
  "vinculos": [
    {
      "id": 100,
      "controleConfigId": 1,
      "clienteId": 10,
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31",
      "ativo": true,
      "controleConfig": { "nome": "Certidões Fiscais" },
      "cliente": { "nome": "Empresa ABC Ltda" },
      "departamento": { "nome": "Contábil" },
      "usuario": null
    }
  ],
  "count": 45,
  "hasMore": true
}
```

---

### 3. Buscar Vínculo por ID

**GET** `/vinculos/:controleClienteId`

Busca um vínculo específico com todos os relacionamentos.

#### Response (200):
```json
{
  "id": 100,
  "controleConfigId": 1,
  "clienteId": 10,
  "dataInicio": "2026-01-16",
  "dataFim": "2026-12-31",
  "departamentoId": 5,
  "usuarioId": null,
  "ativo": true,
  "observacoes": "Controle anual de certidões",
  "controleConfig": {
    "id": 1,
    "codigo": "CERT-FISC",
    "nome": "Certidões Fiscais",
    "recorrente": true
  },
  "cliente": {
    "id": 10,
    "nome": "Empresa ABC Ltda",
    "cnpj": "12.345.678/0001-90"
  },
  "departamento": {
    "id": 5,
    "nome": "Contábil"
  }
}
```

---

### 4. Buscar Histórico de Alterações

**GET** `/vinculos/:controleClienteId/historico`

Retorna todo o histórico de alterações de um vínculo.

#### Response (200):
```json
[
  {
    "id": 1,
    "controleClienteId": 100,
    "acao": "vinculacao",
    "dadosAnteriores": null,
    "dadosNovos": {
      "controleConfigId": 1,
      "clienteId": 10,
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31"
    },
    "observacao": "Controle vinculado ao cliente Empresa ABC Ltda",
    "usuario": {
      "id": 1,
      "name": "Admin",
      "email": "admin@empresa.com"
    },
    "createdAt": "2026-01-16T10:30:00.000Z"
  },
  {
    "id": 2,
    "controleClienteId": 100,
    "acao": "alteracao_datas",
    "dadosAnteriores": {
      "dataInicio": "2026-01-16",
      "dataFim": "2026-12-31"
    },
    "dadosNovos": {
      "dataInicio": "2026-01-16",
      "dataFim": "2027-01-15"
    },
    "observacao": "Prazo estendido por mais 1 ano",
    "usuario": {
      "id": 1,
      "name": "Admin"
    },
    "createdAt": "2026-06-15T14:20:00.000Z"
  }
]
```

---

### 5. Alterar Datas de um Vínculo

**PUT** `/vinculos/:controleClienteId/datas`

Altera as datas de início e/ou fim de um vínculo.

#### Request Body:
```json
{
  "dataInicio": "2026-01-16",
  "dataFim": "2027-01-15",
  "observacao": "Prazo estendido por mais 1 ano"
}
```

#### Response (200):
```json
{
  "id": 100,
  "controleConfigId": 1,
  "clienteId": 10,
  "dataInicio": "2026-01-16",
  "dataFim": "2027-01-15",
  "ativo": true,
  "controleConfig": { "nome": "Certidões Fiscais" },
  "cliente": { "nome": "Empresa ABC Ltda" }
}
```

---

### 6. Alterar Responsável de um Vínculo

**PUT** `/vinculos/:controleClienteId/responsavel`

Altera o departamento e/ou usuário responsável pelo controle.

#### Request Body:
```json
{
  "departamentoId": 7,
  "usuarioId": 15,
  "usuariosIds": [15, 18, 20],
  "observacao": "Transferido para equipe jurídica"
}
```

#### Response (200):
```json
{
  "id": 100,
  "controleConfigId": 1,
  "clienteId": 10,
  "departamentoId": 7,
  "usuarioId": 15,
  "ativo": true,
  "controleConfig": { "nome": "Certidões Fiscais" },
  "cliente": { "nome": "Empresa ABC Ltda" },
  "departamento": { "nome": "Jurídico" },
  "usuario": { "name": "Maria Silva" }
}
```

---

### 7. Desvincular Cliente

**DELETE** `/vinculos/:controleClienteId`

Desvincula um cliente do controle (desativa ou exclui definitivamente).

#### Request Body:
```json
{
  "observacao": "Cliente não precisa mais deste controle",
  "excluirDefinitivamente": false
}
```

**Parâmetros:**
- `excluirDefinitivamente: false` → Apenas desativa (soft delete)
- `excluirDefinitivamente: true` → Exclui permanentemente

#### Response (200):
```json
{
  "message": "Vínculo desativado com sucesso",
  "vinculo": {
    "id": 100,
    "ativo": false
  }
}
```

---

### 8. Gerar Tarefas para um Vínculo

**POST** `/vinculos/:controleClienteId/gerar-tarefas`

Gera tarefas para um controle recorrente.

#### Request Body:
```json
{
  "forcarRegeneracao": false
}
```

**Parâmetros:**
- `forcarRegeneracao: false` → Só gera se não existir tarefas
- `forcarRegeneracao: true` → Exclui tarefas antigas e regenera

#### Response (200):
```json
{
  "tarefasGeradas": 12,
  "tarefas": [
    {
      "id": 501,
      "controleClienteId": 100,
      "controleConfigId": 1,
      "clienteId": 10,
      "dataVencimento": "2026-02-01",
      "status": "pendente",
      "titulo": "Certidões Fiscais"
    }
  ]
}
```

---

### 9. Estatísticas Gerais

**GET** `/estatisticas`

Retorna estatísticas consolidadas sobre controles e vínculos.

#### Query Parameters:
```
controleConfigId: number (opcional)
departamentoId: number (opcional)
```

#### Response (200):
```json
{
  "totalVinculos": 150,
  "vinculosAtivos": 120,
  "vinculosInativos": 30,
  "totalClientes": 85,
  "totalControles": 25,
  "controlesSemCliente": 5,
  "controlesComCliente": 20,
  "vinculosPorControle": [
    {
      "controleId": 1,
      "controleNome": "Certidões Fiscais",
      "totalVinculos": 45,
      "vinculosAtivos": 40
    }
  ],
  "vinculosPorDepartamento": [
    {
      "departamentoId": 5,
      "departamentoNome": "Contábil",
      "totalVinculos": 80
    }
  ],
  "proximosVencimentos": [
    {
      "controleClienteId": 100,
      "controleNome": "Certidões Fiscais",
      "clienteNome": "Empresa ABC Ltda",
      "dataFim": "2026-01-23",
      "diasRestantes": 7
    }
  ]
}
```

---

## 🔔 Sistema de Notificações (Socket.IO)

### Eventos Emitidos:

#### 1. Notificação de Vínculo
```javascript
// Canal: company-{companyId}-controle-vinculo
{
  "action": "create" | "update" | "delete",
  "vinculo": { /* objeto completo */ },
  "notificacao": { /* notificação criada */ }
}
```

#### 2. Notificação para Departamento
```javascript
// Canal: company-{companyId}-department-{departamentoId}-notification
{
  "action": "new",
  "notificacao": {
    "id": 1,
    "tipo": "vinculacao",
    "titulo": "Novo Controle Vinculado",
    "mensagem": "...",
    "lida": false,
    "metadata": { /* dados adicionais */ }
  }
}
```

#### 3. Notificação para Usuário
```javascript
// Canal: company-{companyId}-user-{usuarioId}-notification
{
  "action": "new",
  "notificacao": { /* mesma estrutura acima */ }
}
```

---

## ⏰ CRON Job - Controles Recorrentes

**Execução:** Todos os dias às 02:00 (horário de Brasília)

**Funcionalidades:**
1. ✅ Gera tarefas automaticamente para controles recorrentes
2. ✅ Notifica sobre vencimentos próximos (7 dias antes)
3. ✅ Notifica sobre controles vencidos

**Logs:**
```
[CRON] Iniciando processamento de controles recorrentes...
[CRON] Encontrados 45 vínculos recorrentes ativos
[CRON] Geradas 12 tarefas para vínculo 100
[CRON] Total de tarefas geradas: 150
[CRON] Encontrados 8 controles vencendo em 7 dias
[CRON] Encontrados 3 controles vencidos
[CRON] Processamento de controles recorrentes concluído!
```

---

## 🗂️ Estrutura de Dados

### Ações do Histórico (ENUM):
- `vinculacao` - Cliente vinculado ao controle
- `desvinculacao` - Cliente desvinculado
- `alteracao_datas` - Datas alteradas
- `alteracao_responsavel` - Responsável alterado
- `ativacao` - Vínculo reativado
- `desativacao` - Vínculo desativado

### Tipos de Notificação (ENUM):
- `vinculacao` - Nova vinculação criada
- `desvinculacao` - Vinculação removida
- `alteracao` - Dados alterados
- `geracao_tarefa` - Tarefas geradas automaticamente
- `lembrete` - Lembrete de vencimento próximo
- `vencimento` - Controle vencido

---

## 🔒 Regras de Negócio

1. **Vínculos Duplicados:** Sistema impede vincular o mesmo cliente/controle se já houver vínculo ativo
2. **Validação de Datas:** dataInicio não pode ser maior que dataFim
3. **Notificações Múltiplas:** Pode notificar departamento + usuário + lista de usuários simultaneamente
4. **Histórico Completo:** Toda alteração é registrada com dados anteriores e novos
5. **Soft Delete:** Desvinculação padrão apenas desativa, não exclui
6. **Geração de Tarefas:** Controles recorrentes geram tarefas automaticamente no vínculo

---

## 📊 Exemplos de Uso

### Vincular 5 clientes ao mesmo controle:
```bash
curl -X POST http://localhost:3000/controle-clientes/vinculos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "controleConfigId": 1,
    "clientes": [
      {"clienteId": 10, "dataInicio": "2026-01-16", "dataFim": "2026-12-31"},
      {"clienteId": 11, "dataInicio": "2026-01-16", "dataFim": "2026-12-31"},
      {"clienteId": 12, "dataInicio": "2026-01-16", "dataFim": "2026-12-31"},
      {"clienteId": 13, "dataInicio": "2026-01-16", "dataFim": "2026-12-31"},
      {"clienteId": 14, "dataInicio": "2026-01-16", "dataFim": "2026-12-31"}
    ],
    "departamentoId": 5,
    "gerarTarefasImediatamente": true
  }'
```

### Buscar controles vencendo este mês:
```bash
curl -X GET "http://localhost:3000/controle-clientes/vinculos?ativo=true&dataFimMin=2026-01-01&dataFimMax=2026-01-31" \
  -H "Authorization: Bearer {token}"
```

---

## 📝 Notas Importantes

- Todas as datas devem estar no formato ISO (YYYY-MM-DD)
- O sistema é multi-tenant (filtra por companyId automaticamente)
- Notificações são enviadas em tempo real via Socket.IO
- Histórico é imutável (apenas inserção, sem edição/exclusão)
- CRON roda em horário de Brasília (America/Sao_Paulo)

---

## 🚀 Próximos Passos

Para implementar no frontend, você precisará:
1. Página de listagem com filtros
2. Modal de vinculação com dual-list de clientes
3. Drawer de histórico com timeline
4. Integração com Socket.IO para notificações em tempo real
5. Dashboard com estatísticas visuais
