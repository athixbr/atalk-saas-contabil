import * as mysql from "mysql2/promise";
import Cliente from "../models/Cliente";
import "../database"; // Inicializa conexão PostgreSQL via Sequelize
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Carrega variáveis de ambiente de migração
const envMigrationPath = path.join(__dirname, "..", "..", ".env.migration");
if (fs.existsSync(envMigrationPath)) {
  dotenv.config({ path: envMigrationPath });
} else {
  console.error("❌ Arquivo .env.migration não encontrado!");
  console.log("📝 Crie o arquivo em: backend/.env.migration");
  console.log("📝 Com as variáveis: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE");
  process.exit(1);
}

interface MySQLCliente {
  id: number;
  empresa_id: number;
  codigo_erp: string | null;
  nome: string;
  nome_fantasia: string | null;
  apelido: string | null;
  cpf_cnpj: string;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  uf: string | null;
  cidade: string | null;
  website: string | null;
  honorario: number | null;
  criado_em: Date;
  atualizado_em: Date;
}

class ClienteMigration {
  private mysqlConnection: mysql.Connection | null = null;
  private logMessages: string[] = [];
  private stats = {
    total: 0,
    inseridos: 0,
    atualizados: 0,
    erros: 0,
    ignorados: 0,
  };

  /**
   * Conecta ao MySQL externo
   */
  async connectMySQL(): Promise<void> {
    try {
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "contco",
      });
      this.log("✅ Conectado ao MySQL com sucesso!");
    } catch (error: any) {
      this.log(`❌ Erro ao conectar no MySQL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca clientes do MySQL
   */
  async fetchMySQLClientes(empresaId?: number): Promise<MySQLCliente[]> {
    if (!this.mysqlConnection) {
      throw new Error("Conexão MySQL não estabelecida");
    }

    let query = "SELECT * FROM clientes";
    const params: any[] = [];

    if (empresaId) {
      query += " WHERE empresa_id = ?";
      params.push(empresaId);
    }

    query += " ORDER BY id ASC";

    const [rows] = await this.mysqlConnection.execute(query, params);
    this.log(`📥 Encontrados ${(rows as any[]).length} clientes no MySQL`);
    return rows as MySQLCliente[];
  }

  /**
   * Detecta se é CPF ou CNPJ e retorna apenas números
   */
  private cleanDocument(doc: string): { type: "cpf" | "cnpj"; value: string } {
    const cleaned = doc.replace(/\D/g, "");
    
    if (cleaned.length === 11) {
      return { type: "cpf", value: cleaned };
    } else if (cleaned.length === 14) {
      return { type: "cnpj", value: cleaned };
    } else {
      // Tenta detectar pelo tamanho original com pontuação
      if (doc.includes("/")) {
        return { type: "cnpj", value: cleaned };
      }
      return { type: "cpf", value: cleaned };
    }
  }

  /**
   * Mapeia cliente MySQL para formato PostgreSQL
   */
  private mapMySQLToPostgres(
    mysqlCliente: MySQLCliente,
    targetCompanyId: number
  ): Partial<Cliente> {
    const document = this.cleanDocument(mysqlCliente.cpf_cnpj);
    
    const observacoes = [
      mysqlCliente.apelido ? `Apelido: ${mysqlCliente.apelido}` : null,
      mysqlCliente.honorario ? `Honorário: R$ ${mysqlCliente.honorario.toFixed(2)}` : null,
      `Migrado do MySQL (ID original: ${mysqlCliente.id})`,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      companyId: targetCompanyId,
      nome: mysqlCliente.nome.trim(),
      tipoCliente: document.type === "cpf" ? "fisica" : "juridica",
      cpf: document.type === "cpf" ? document.value : null,
      cnpj: document.type === "cnpj" ? document.value : null,
      razaoSocial: mysqlCliente.nome.trim(),
      nomeFantasia: mysqlCliente.nome_fantasia?.trim() || null,
      codigoErp: mysqlCliente.codigo_erp?.trim() || null,
      cep: mysqlCliente.cep?.trim() || null,
      logradouro: mysqlCliente.logradouro?.trim() || null,
      numero: mysqlCliente.numero?.trim() || null,
      complemento: mysqlCliente.complemento?.trim() || null,
      bairro: mysqlCliente.bairro?.trim() || null,
      cidade: mysqlCliente.cidade?.trim() || null,
      estado: mysqlCliente.uf?.trim() || null,
      site: mysqlCliente.website?.trim() || null,
      observacoes: observacoes,
      ativo: true,
      tipoServico: "recorrente",
    };
  }

  /**
   * Migra um cliente específico
   */
  async migrateCliente(
    mysqlCliente: MySQLCliente,
    targetCompanyId: number,
    updateExisting: boolean = false
  ): Promise<boolean> {
    try {
      const mapped = this.mapMySQLToPostgres(mysqlCliente, targetCompanyId);
      
      // Verifica se já existe por CPF/CNPJ
      const whereClause: any = { companyId: targetCompanyId };
      
      if (mapped.cpf) {
        whereClause.cpf = mapped.cpf;
      } else if (mapped.cnpj) {
        whereClause.cnpj = mapped.cnpj;
      } else {
        this.log(`⚠️  Cliente "${mysqlCliente.nome}" sem CPF/CNPJ válido - IGNORADO`);
        this.stats.ignorados++;
        return false;
      }

      const existing = await Cliente.findOne({ where: whereClause });

      if (existing) {
        if (updateExisting) {
          await existing.update(mapped);
          this.log(`🔄 Atualizado: ${mysqlCliente.nome} (${mapped.cpf || mapped.cnpj})`);
          this.stats.atualizados++;
        } else {
          this.log(`⏭️  Já existe: ${mysqlCliente.nome} (${mapped.cpf || mapped.cnpj}) - IGNORADO`);
          this.stats.ignorados++;
        }
      } else {
        await Cliente.create(mapped as any);
        this.log(`✅ Inserido: ${mysqlCliente.nome} (${mapped.cpf || mapped.cnpj})`);
        this.stats.inseridos++;
      }

      return true;
    } catch (error: any) {
      this.log(`❌ Erro ao migrar "${mysqlCliente.nome}": ${error.message}`);
      this.stats.erros++;
      return false;
    }
  }

  /**
   * Executa a migração completa
   */
  async run(
    targetCompanyId: number,
    mysqlEmpresaId?: number,
    updateExisting: boolean = false
  ): Promise<void> {
    console.log("\n🚀 Iniciando migração de clientes MySQL → PostgreSQL\n");
    console.log("=" .repeat(60));

    try {
      // Conecta ao MySQL
      await this.connectMySQL();

      // Busca clientes
      const mysqlClientes = await this.fetchMySQLClientes(mysqlEmpresaId);
      this.stats.total = mysqlClientes.length;

      this.log(`🎯 Empresa PostgreSQL destino: ${targetCompanyId}`);
      this.log(`🎯 Modo: ${updateExisting ? "INSERIR e ATUALIZAR" : "APENAS INSERIR novos"}`);
      this.log("=" .repeat(60));

      // Migra cada cliente
      for (let i = 0; i < mysqlClientes.length; i++) {
        const cliente = mysqlClientes[i];
        process.stdout.write(`\r📦 Processando ${i + 1}/${mysqlClientes.length}... `);
        await this.migrateCliente(cliente, targetCompanyId, updateExisting);
      }

      console.log("\n");
      this.log("=" .repeat(60));
      this.log("✅ Migração concluída!");
      this.log(`📊 Total processado: ${this.stats.total}`);
      this.log(`✅ Inseridos: ${this.stats.inseridos}`);
      this.log(`🔄 Atualizados: ${this.stats.atualizados}`);
      this.log(`⏭️  Ignorados: ${this.stats.ignorados}`);
      this.log(`❌ Erros: ${this.stats.erros}`);
      this.log("=" .repeat(60));

      // Salva log em arquivo
      await this.saveLog();

    } catch (error: any) {
      this.log(`❌ Erro fatal: ${error.message}`);
      console.error(error);
    } finally {
      // Fecha conexão MySQL
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        this.log("🔌 Conexão MySQL fechada");
      }
    }
  }

  /**
   * Adiciona mensagem ao log
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logMessages.push(logEntry);
    console.log(message);
  }

  /**
   * Salva log em arquivo
   */
  private async saveLog(): Promise<void> {
    const logDir = path.join(__dirname, "..", "..", "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFile = path.join(logDir, `migration-clientes-${timestamp}.log`);

    fs.writeFileSync(logFile, this.logMessages.join("\n"), "utf8");
    console.log(`\n📄 Log salvo em: ${logFile}`);
  }
}

// Execução do script
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║          MIGRAÇÃO DE CLIENTES MySQL → PostgreSQL               ║
╚════════════════════════════════════════════════════════════════╝

📋 Uso:
  npx ts-node src/scripts/migrate-clientes-mysql.ts <companyId> [mysqlEmpresaId] [--update]

📌 Parâmetros:
  - companyId        : ID da empresa no PostgreSQL (destino)
  - mysqlEmpresaId   : (Opcional) Filtrar apenas empresa específica do MySQL
  - --update         : (Opcional) Atualiza clientes existentes ao invés de ignorar

📝 Exemplos:
  
  # Migrar todos os clientes para company 1 (apenas novos)
  npx ts-node src/scripts/migrate-clientes-mysql.ts 1
  
  # Migrar apenas empresa 14 do MySQL para company 1
  npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14
  
  # Migrar e ATUALIZAR existentes
  npx ts-node src/scripts/migrate-clientes-mysql.ts 1 14 --update

⚙️  Configuração:
  Crie o arquivo: backend/.env.migration
  
  MYSQL_HOST=seu_host_mysql
  MYSQL_PORT=3306
  MYSQL_USER=seu_usuario
  MYSQL_PASSWORD=sua_senha
  MYSQL_DATABASE=contco

🔒 Segurança:
  - O arquivo .env.migration já está no .gitignore
  - Não commite credenciais no Git!
    `);
    process.exit(0);
  }

  const targetCompanyId = parseInt(args[0]);
  const mysqlEmpresaId = args[1] && !args[1].startsWith("--") ? parseInt(args[1]) : undefined;
  const updateExisting = args.includes("--update");

  if (isNaN(targetCompanyId)) {
    console.error("❌ companyId inválido!");
    process.exit(1);
  }

  const migration = new ClienteMigration();
  await migration.run(targetCompanyId, mysqlEmpresaId, updateExisting);
  
  process.exit(0);
}

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
}

export default ClienteMigration;
