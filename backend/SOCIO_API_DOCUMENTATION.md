# API de Sócios - Documentação

## Endpoints

### CRUD de Sócios

#### 1. Listar Sócios
```
GET /socios
```

**Query Parameters:**
- `searchParam` (opcional): Busca por nome, CPF, email, telefone
- `pageNumber` (opcional): Número da página (padrão: 1)
- `ativo` (opcional): `true` ou `false`

**Response:**
```json
{
  "socios": [
    {
      "id": 1,
      "nome": "João da Silva",
      "cpf": "12345678901",
      "email": "joao@email.com",
      "telefone": "(11) 98765-4321",
      "clientes": [
        {
          "id": 5,
          "nome": "ABC LTDA",
          "cnpj": "12345678000190",
          "ClienteSocio": {
            "percentual": 50.00,
            "cargo": "Sócio Administrador",
            "recebeProlabore": true,
            "valorProlabore": 5000.00
          }
        }
      ]
    }
  ],
  "count": 10,
  "hasMore": false
}
```

#### 2. Buscar Sócio por ID
```
GET /socios/:socioId
```

**Response:**
```json
{
  "id": 1,
  "nome": "João da Silva",
  "cpf": "12345678901",
  "rg": "123456789",
  "dataNascimento": "1980-05-15",
  "nacionalidade": "Brasileira",
  "naturalidade": "São Paulo",
  "estadoCivil": "casado",
  "profissao": "Empresário",
  "telefone": "(11) 3456-7890",
  "celular": "(11) 98765-4321",
  "email": "joao@email.com",
  "cep": "01234-567",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "dependentes": [
    {
      "nome": "Maria da Silva",
      "cpf": "98765432109",
      "parentesco": "filha",
      "dataNascimento": "2010-03-20"
    }
  ],
  "banco": "Banco do Brasil",
  "agencia": "1234",
  "conta": "56789-0",
  "tipoConta": "corrente",
  "chavePix": "joao@email.com",
  "observacoes": "Cliente preferencial",
  "ativo": true,
  "clientes": [...]
}
```

#### 3. Criar Sócio
```
POST /socios
```

**Body:**
```json
{
  "nome": "João da Silva",
  "cpf": "123.456.789-01",
  "rg": "12.345.678-9",
  "dataNascimento": "1980-05-15",
  "nacionalidade": "Brasileira",
  "naturalidade": "São Paulo",
  "estadoCivil": "casado",
  "profissao": "Empresário",
  "telefone": "(11) 3456-7890",
  "celular": "(11) 98765-4321",
  "email": "joao@email.com",
  "cep": "01234-567",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "dependentes": [
    {
      "nome": "Maria da Silva",
      "cpf": "987.654.321-09",
      "parentesco": "filha",
      "dataNascimento": "2010-03-20"
    }
  ],
  "banco": "Banco do Brasil",
  "agencia": "1234",
  "conta": "56789-0",
  "tipoConta": "corrente",
  "chavePix": "joao@email.com",
  "observacoes": "Cliente preferencial",
  "ativo": true
}
```

**Response:** `201 Created` + objeto do sócio criado

#### 4. Atualizar Sócio
```
PUT /socios/:socioId
```

**Body:** Mesmos campos do POST (todos opcionais)

**Response:** `200 OK` + objeto do sócio atualizado

#### 5. Excluir Sócio
```
DELETE /socios/:socioId
```

**Validação:** Não permite excluir sócio com vínculos ativos. Desative os vínculos primeiro.

**Response:** 
```json
{
  "message": "Sócio excluído com sucesso"
}
```

---

### Gestão de Vínculos (Sócio ↔ Empresa)

#### 6. Vincular Sócio a Empresa/Cliente
```
POST /socios/vinculos
```

**Body:**
```json
{
  "clienteId": 5,
  "socioId": 1,
  "percentual": 50.00,
  "cargo": "Sócio Administrador",
  "valorQuota": 10000.00,
  "quantidadeQuotas": 5000,
  "dataEntrada": "2020-01-01",
  "dataSaida": null,
  "podeAssinar": true,
  "poderIsolado": true,
  "isAdministrador": true,
  "recebeProlabore": true,
  "valorProlabore": 5000.00,
  "observacoes": "Responsável pela área comercial",
  "ativo": true
}
```

**Response:** `201 Created` + objeto do vínculo criado

#### 7. Atualizar Vínculo
```
PUT /socios/vinculos/:vinculoId
```

**Body:** Mesmos campos do POST de vínculo (todos opcionais)

**Response:** `200 OK` + objeto do vínculo atualizado

#### 8. Remover Vínculo
```
DELETE /socios/vinculos/:vinculoId
```

**Response:**
```json
{
  "message": "Vínculo removido com sucesso"
}
```

---

## Validações

### Criação de Sócio
- ✅ Nome obrigatório
- ✅ CPF obrigatório e único por company
- ✅ CPF deve ter 11 dígitos
- ✅ CPF é automaticamente limpo (remove pontos e traços)

### Criação de Vínculo
- ✅ Cliente/Empresa deve existir e pertencer à company
- ✅ Sócio deve existir e pertencer à company
- ✅ Não permite vincular mesmo sócio duas vezes na mesma empresa
- ✅ Percentual deve estar entre 0 e 100

### Exclusão de Sócio
- ✅ Não permite excluir se houver vínculos ativos
- ✅ Solução: Desativar vínculos primeiro ou excluí-los

---

## Casos de Uso

### 1. Cadastrar Sócio e Vincular a Empresa

```javascript
// 1. Criar sócio
POST /socios
{
  "nome": "João da Silva",
  "cpf": "123.456.789-01",
  "email": "joao@email.com"
}
// Response: { id: 10, ... }

// 2. Vincular à empresa
POST /socios/vinculos
{
  "socioId": 10,
  "clienteId": 5,
  "percentual": 50.00,
  "cargo": "Sócio Administrador",
  "podeAssinar": true,
  "recebeProlabore": true,
  "valorProlabore": 5000.00
}
```

### 2. Buscar Empresas de um Sócio

```javascript
GET /socios/10
// Response inclui array "clientes" com todas empresas vinculadas
```

### 3. Alterar Participação Societária

```javascript
PUT /socios/vinculos/25
{
  "percentual": 60.00,
  "valorQuota": 12000.00
}
```

### 4. Desativar Sócio da Empresa (sem excluir)

```javascript
PUT /socios/vinculos/25
{
  "ativo": false,
  "dataSaida": "2025-12-10"
}
```

### 5. Criar Tarefa de IRPF para Sócio

```javascript
POST /tasks
{
  "title": "IRPF 2025 - João da Silva",
  "description": "Declaração de Imposto de Renda Pessoa Física",
  "socioId": 10,  // ← Vincula ao sócio
  "clienteId": null, // Opcional: empresa origem
  "status": "pending",
  "dueDate": "2025-05-31"
}
```

---

## Estrutura de Dados

### Tabela: Socios
- Dados pessoais: nome, CPF, RG, data nascimento, profissão
- Endereço completo
- Contato: telefone, celular, email
- **Dependentes (JSON)**: array de dependentes para IRPF
- Dados bancários: banco, agência, conta, PIX

### Tabela: ClienteSocio (N:N)
- Relacionamento: clienteId ↔ socioId
- Dados societários: percentual, cargo, valor quota
- Poderes: pode assinar, poder isolado, administrador
- Pró-labore: flag + valor mensal
- Timeline: data entrada/saída, ativo

### Tabela: Tasks
- **Campo novo**: `socioId` (para vincular tarefas ao sócio)
- Uso: Tarefas de IRPF, documentação pessoal, etc.

---

## Observações Importantes

1. **CPF único por company**: Evita duplicação
2. **Vínculo único**: Mesmo sócio não pode estar duplicado na mesma empresa
3. **Soft delete em vínculos**: Use `ativo: false` para histórico
4. **Dependentes em JSON**: Flexível para múltiplos dependentes
5. **Pró-labore**: Flag separado + valor para relatórios
