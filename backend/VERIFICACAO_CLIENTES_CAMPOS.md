# Verificação de Campos - Cadastro de Clientes

## Data: 2026-02-20

## Análise Comparativa: Frontend → Backend → Banco de Dados

### ✅ CAMPOS QUE ESTÃO CORRETOS (presentes em todos)

**Dados Básicos:**
- id, companyId, nome, tipoCliente
- cpf, cnpj, razaoSocial, nomeFantasia, apelido
- inscricaoEstadual (convertido de array no frontend)
- cep, logradouro, numero, complemento, bairro, cidade, estado
- telefone, celular, email, site
- observacoes, ativo
- codigoErp, codigoSistema, honorario, produtorRural
- tipoServico, certidoesSelecionadas
- dataAbertura, mesAniversario

**Parâmetros de Enquadramento (todos presentes):**
- statusId, statusComplementarId, segmentoId, sedeClienteId
- regimeTributarioFederalId, regimeTributarioEstadualId, regimeTributarioMunicipalId
- modalidadeFechamentoContabilId, modalidadeFechamentoFiscalId, modalidadeFechamentoDPId
- distribuicaoLucrosId, servicosExtraordinariosId
- grupoClienteId, localizacaoClienteId
- adiantamentoFolhaId, controlesId
- tipoClienteId, categoriaClienteId, periodicidadeClienteId
- envioCorrespondenciaId, parcelamentosId, tagsId

**Novos Parâmetros 2026 (todos presentes):**
- statusClienteId, porteFederalId, porteEstadualId, porteMunicipalId
- tierClienteId, clusterClienteId
- volumeFiscalId, volumeContabilId, volumeDPId, volumeBPOId
- modalFechBPOId, statusControleId

---

### ⚠️ CAMPOS NO CONTROLLER MAS NÃO NA TABELA

Estes campos são aceitos pelo Controller mas NÃO EXISTEM na tabela do banco:

1. **inscricaoMunicipal** - String
   - ✅ Definido no Model TypeScript
   - ❌ NÃO existe na tabela do banco
   - ✅ Está no Controller (store e update)
   - ❌ **AÇÃO NECESSÁRIA:** Adicionar coluna no banco

2. **responsavel** - String
   - ✅ Está no Controller
   - ❌ NÃO existe no Model TypeScript
   - ❌ NÃO existe na tabela
   - ❌ **AÇÃO NECESSÁRIA:** Definir se deve ser adicionado ou removido do controller

3. **dataInicioContrato** - Date
   - ✅ Está no Controller
   - ❌ NÃO existe no Model TypeScript
   - ❌ NÃO existe na tabela
   - ❌ **AÇÃO NECESSÁRIA:** Definir se deve ser adicionado ou removido do controller

4. **valorMensalidade** - Decimal
   - ✅ Está no Controller
   - ❌ NÃO existe no Model TypeScript
   - ❌ NÃO existe na tabela
   - ❌ **AÇÃO NECESSÁRIA:** Definir se deve ser adicionado ou removido do controller

5. **diaVencimento** - Integer
   - ✅ Está no Controller
   - ❌ NÃO existe no Model TypeScript
   - ❌ NÃO existe na tabela
   - ❌ **AÇÃO NECESSÁRIA:** Definir se deve ser adicionado ou removido do controller

---

### 🔧 CAMPOS NO FRONTEND MAS NÃO ENVIADOS

Estes campos existem no formData do frontend mas NÃO são enviados ou processados:

1. **temInscricaoEstadual** - Boolean (controle de UI)
2. **inscricoesEstaduais** - Array (convertido para inscricaoEstadual como JSON)
3. **demaisIdentificadores** - Array (tem componente separado)

---

## RECOMENDAÇÕES

### Opção 1: Adicionar campos faltantes no banco (SE FOREM NECESSÁRIOS)

```sql
-- Adicionar campos de contrato/financeiro
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS "inscricaoMunicipal" VARCHAR(255);
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS "responsavel" VARCHAR(255);
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS "dataInicioContrato" DATE;
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS "valorMensalidade" DECIMAL(10,2);
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS "diaVencimento" INTEGER;
```

### Opção 2: Remover campos do Controller (SE NÃO FOREM USADOS)

Remover dos arquivos:
- ClienteController.ts (store e update)
- CreateClienteService.ts
- UpdateClienteService.ts

---

## STATUS ATUAL

✅ **Tabelas de parâmetros:** Todas populadas corretamente
✅ **Campos principais:** Todos mapeados
⚠️ **Campos de contrato:** Aceitos no controller mas não salvam (sem coluna no banco)
✅ **Chaves estrangeiras:** Todas configuradas corretamente

## IMPACTO NO ERRO ATUAL

O erro "Internal Server Error" ao salvar cliente PODE estar relacionado aos campos faltantes no banco.
Quando o Sequelize tenta inserir/atualizar campos que não existem na tabela, pode gerar erro.

**SOLUÇÃO IMEDIATA:** Executar o SQL da Opção 1 para adicionar as colunas faltantes.
