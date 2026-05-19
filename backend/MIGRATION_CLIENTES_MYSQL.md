# 🔄 Migração de Clientes MySQL → PostgreSQL

## 📋 Visão Geral

Este documento explica como migrar dados de clientes do banco MySQL externo (`contco`) para a tabela `Clientes` do PostgreSQL.

---

## 🗂️ Estrutura de Dados

### **MySQL** (`contco.clientes`)
```sql
CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `codigo_erp` varchar(50),
  `nome` varchar(255) NOT NULL,
  `nome_fantasia` varchar(255),
  `apelido` varchar(255),
  `cpf_cnpj` varchar(18) NOT NULL,
  `cep` varchar(10),
  `logradouro` varchar(255),
  `numero` varchar(10),
  `complemento` varchar(255),
  `bairro` varchar(255),
  `uf` varchar(2),
  `cidade` varchar(255),
  `website` varchar(255),
  `honorario` decimal(10,2),
  `criado_em` timestamp,
  `atualizado_em` timestamp
)
```

**Total de registros:** ~280 clientes (empresa_id = 14)

### **PostgreSQL** (`Clientes`)
```typescript
{
  id: number,
  companyId: number,
  nome: string,
  tipoServico: "interno" | "recorrente" | "esporadico",
  codigoErp: string,
  tipoCliente: "fisica" | "juridica",
  cpf: string,
  cnpj: string,
  razaoSocial: string,
  inscricaoEstadual: string,
  nomeFantasia: string,
  produtorRural: boolean,
  cep: string,
  logradouro: string,
  numero: string,
  complemento: string,
  bairro: string,
  cidade: string,
  estado: string,
  telefone: string,
  celular: string,
  email: string,
  site: string,
  observacoes: string,
  ativo: boolean
}
```

---

## 🔀 Mapeamento de Campos

| MySQL | PostgreSQL | Transformação |
|-------|-----------|---------------|
| `empresa_id` | `companyId` | ID da empresa no sistema destino (parâmetro) |
| `nome` | `nome` + `razaoSocial` | Mesmo valor |
| `cpf_cnpj` | `cpf` OU `cnpj` | Detecta automaticamente (11 dígitos = CPF, 14 = CNPJ) |
| `cpf_cnpj` | `tipoCliente` | Auto: "fisica" (CPF) ou "juridica" (CNPJ) |
| `nome_fantasia` | `nomeFantasia` | Direto |
| `codigo_erp` | `codigoErp` | Direto |
| `cep` | `cep` | Direto |
| `logradouro` | `logradouro` | Direto |
| `numero` | `numero` | Direto |
| `complemento` | `complemento` | Direto |
| `bairro` | `bairro` | Direto |
| `uf` | `estado` | Direto |
| `cidade` | `cidade` | Direto |
| `website` | `site` | Direto |
| `apelido` | `observacoes` | Concatenado: "Apelido: X" |
| `honorario` | `observacoes` | Concatenado: "Honorário: R$ X" |
| `id` (MySQL) | `observacoes` | Concatenado: "Migrado do MySQL (ID: X)" |
| - | `tipoServico` | Padrão: "recorrente" |
| - | `ativo` | Padrão: `true` |

---

## ⚙️ Configuração

### 1️⃣ Criar arquivo de credenciais

```bash
cd /home/deploy/atalk/backend
cp .env.migration.example .env.migration
nano .env.migration
```

### 2️⃣ Preencher credenciais MySQL

```env
MYSQL_HOST=seu_host_mysql
MYSQL_PORT=3306
MYSQL_USER=seu_usuario
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=contco
```

**🔒 Segurança:** O arquivo `.env.migration` já está no `.gitignore` e **NÃO será commitado**.

---

## 🚀 Execução

### **Modo 1: Migrar APENAS novos clientes** (padrão)
```bash
cd /home/deploy/atalk/backend
npx ts-node src/scripts/migrate-clientes-mysql.ts 1
```

**Comportamento:**
- ✅ Insere clientes que não existem no PostgreSQL
- ⏭️ Ignora clientes que já existem (por CPF/CNPJ)
- ❌ NÃO atualiza dados existentes

---

### **Modo 2: Migrar apenas empresa específica do MySQL**
```bash
npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14
```

**Parâmetros:**
- `1` = ID da empresa no PostgreSQL (destino)
- `14` = ID da empresa no MySQL (filtro, opcional)

---

### **Modo 3: Migrar E atualizar existentes**
```bash
npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14 --update
```

**Comportamento:**
- ✅ Insere clientes novos
- 🔄 **ATUALIZA** clientes existentes com dados do MySQL
- ⚠️ **Cuidado:** Sobrescreve dados existentes no PostgreSQL!

---

## 📊 Detecção de Duplicatas

O script verifica se o cliente já existe usando:

```typescript
WHERE companyId = X AND (cpf = 'Y' OR cnpj = 'Z')
```

**Regras:**
- Se encontrar CPF/CNPJ igual na mesma empresa → **duplicata**
- Modo padrão: **ignora** duplicatas
- Modo `--update`: **atualiza** duplicatas

---

## 📝 Log de Migração

Durante a execução, o script:

1. **Mostra no terminal:**
   ```
   ✅ Inserido: CONTCO CONTABILIDADE LTDA (37494184000101)
   ⏭️  Já existe: CIALUX MATERIAIS ELETRICOS LTDA (03747819000105) - IGNORADO
   🔄 Atualizado: DFG S.A (15551577000169)
   ❌ Erro ao migrar "Cliente X": Constraint violation
   ```

2. **Gera relatório final:**
   ```
   📊 Total processado: 280
   ✅ Inseridos: 245
   🔄 Atualizados: 0
   ⏭️  Ignorados: 32
   ❌ Erros: 3
   ```

3. **Salva log em arquivo:**
   ```
   backend/logs/migration-clientes-2025-12-10T15-30-45-123Z.log
   ```

---

## 🔍 Validação Pós-Migração

### Verificar total de clientes migrados
```sql
-- PostgreSQL
SELECT COUNT(*) FROM "Clientes" WHERE companyId = 1;
```

### Verificar clientes com observações de migração
```sql
SELECT nome, "cpf", "cnpj", observacoes 
FROM "Clientes" 
WHERE observacoes LIKE '%Migrado do MySQL%'
LIMIT 10;
```

### Comparar totais MySQL vs PostgreSQL
```sql
-- MySQL
SELECT COUNT(*) FROM clientes WHERE empresa_id = 14;

-- PostgreSQL
SELECT COUNT(*) FROM "Clientes" WHERE companyId = 1;
```

---

## ⚠️ Tratamento de Erros

### **Erro: Cliente sem CPF/CNPJ válido**
```
⚠️  Cliente "FULANO DE TAL" sem CPF/CNPJ válido - IGNORADO
```

**Causa:** Campo `cpf_cnpj` vazio ou com formato inválido  
**Ação:** Cliente é ignorado (não migrado)

### **Erro: Violação de constraint**
```
❌ Erro ao migrar "EMPRESA XYZ": notNull Violation: cnpj cannot be null
```

**Causa:** Validações do modelo Sequelize  
**Ação:** Verificar campo obrigatório faltando

### **Erro: Conexão MySQL recusada**
```
❌ Erro ao conectar no MySQL: connect ECONNREFUSED
```

**Causa:** Credenciais incorretas ou host inacessível  
**Ação:** Verificar `.env.migration` e conectividade de rede

---

## 🧪 Teste em Ambiente Seguro

**Recomendação:** Testar primeiro com poucos registros

```bash
# 1. Criar empresa de teste no PostgreSQL
# 2. Migrar apenas 1 empresa do MySQL
npx ts-node src/scripts/migrate-clientes-mysql.ts 999 14

# 3. Validar dados
SELECT * FROM "Clientes" WHERE companyId = 999 LIMIT 10;

# 4. Se tudo OK, migrar para empresa real
npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14
```

---

## 🔄 Re-executar Migração

O script é **idempotente** no modo padrão:

```bash
# Executar 2x não duplica dados
npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14
npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14  # Todos ignorados
```

**Resultado:** Todos os clientes serão ignorados na segunda execução (já existem).

---

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. ✅ Validar dados migrados
2. ✅ Adicionar `clienteId` nas tabelas `CrmClient` e `ClienteCertidao`
3. ✅ Criar hooks de sincronização entre tabelas
4. ✅ Desativar módulos CRM duplicados no frontend (já feito)
5. ✅ Treinar usuários para usar apenas `/clientes`

---

## 📞 Suporte

**Arquivo principal:** `backend/src/scripts/migrate-clientes-mysql.ts`  
**Logs:** `backend/logs/migration-clientes-*.log`  
**Credenciais:** `backend/.env.migration` (não commitado)

---

## 📌 Checklist de Migração

- [ ] Criar arquivo `.env.migration` com credenciais
- [ ] Testar conexão MySQL
- [ ] Executar migração em modo teste (empresa 999)
- [ ] Validar dados migrados
- [ ] Executar migração em produção (empresa 1)
- [ ] Comparar totais MySQL vs PostgreSQL
- [ ] Verificar logs de erros
- [ ] Backup do PostgreSQL pós-migração
- [ ] Documentar clientes não migrados (se houver)
- [ ] Treinar equipe no novo fluxo

---

**✅ Migração Planejada:** MySQL `contco.clientes` → PostgreSQL `Clientes`  
**📅 Data:** 10/12/2025  
**👤 Responsável:** Deploy Team
