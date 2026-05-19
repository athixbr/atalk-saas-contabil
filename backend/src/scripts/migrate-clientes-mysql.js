const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");

// Carrega ENV principal do backend
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// Inicializa conexão PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    timezone: "-03:00",
  }
);

// Define modelo Cliente simplificado (apenas para inserção)
const Cliente = sequelize.define("Clientes", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoServico: {
    type: DataTypes.ENUM("interno", "recorrente", "esporadico"),
    defaultValue: "recorrente",
  },
  codigoErp: DataTypes.STRING,
  tipoCliente: {
    type: DataTypes.ENUM("fisica", "juridica"),
    defaultValue: "fisica",
  },
  cpf: DataTypes.STRING,
  cnpj: DataTypes.STRING,
  razaoSocial: DataTypes.STRING,
  inscricaoEstadual: DataTypes.TEXT,
  nomeFantasia: DataTypes.STRING,
  produtorRural: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cep: DataTypes.STRING,
  logradouro: DataTypes.STRING,
  numero: DataTypes.STRING,
  complemento: DataTypes.STRING,
  bairro: DataTypes.STRING,
  cidade: DataTypes.STRING,
  estado: DataTypes.STRING,
  telefone: DataTypes.STRING,
  celular: DataTypes.STRING,
  email: DataTypes.STRING,
  site: DataTypes.STRING,
  observacoes: DataTypes.TEXT,
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: "Clientes",
});

// Carrega variáveis de ambiente de migração
const envMigrationPath = path.join(__dirname, "..", "..", ".env.migration");
if (fs.existsSync(envMigrationPath)) {
  dotenv.config({ path: envMigrationPath });
} else {
  console.error("❌ Arquivo .env.migration não encontrado!");
  console.log("📝 Crie o arquivo em: backend/.env.migration");
  process.exit(1);
}

class ClienteMigration {
  constructor() {
    this.mysqlConnection = null;
    this.logMessages = [];
    this.stats = {
      total: 0,
      inseridos: 0,
      atualizados: 0,
      erros: 0,
      ignorados: 0,
    };
  }

  async connectMySQL() {
    try {
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "contco",
      });
      this.log("✅ Conectado ao MySQL com sucesso!");
    } catch (error) {
      this.log(`❌ Erro ao conectar no MySQL: ${error.message}`);
      throw error;
    }
  }

  async fetchMySQLClientes(empresaId) {
    if (!this.mysqlConnection) {
      throw new Error("Conexão MySQL não estabelecida");
    }

    let query = "SELECT * FROM clientes";
    const params = [];

    if (empresaId) {
      query += " WHERE empresa_id = ?";
      params.push(empresaId);
    }

    query += " ORDER BY id ASC";

    const [rows] = await this.mysqlConnection.execute(query, params);
    this.log(`📥 Encontrados ${rows.length} clientes no MySQL`);
    return rows;
  }

  cleanDocument(doc) {
    const cleaned = doc.replace(/\D/g, "");
    
    if (cleaned.length === 11) {
      return { type: "cpf", value: cleaned };
    } else if (cleaned.length === 14) {
      return { type: "cnpj", value: cleaned };
    } else {
      if (doc.includes("/")) {
        return { type: "cnpj", value: cleaned };
      }
      return { type: "cpf", value: cleaned };
    }
  }

  mapMySQLToPostgres(mysqlCliente, targetCompanyId) {
    const document = this.cleanDocument(mysqlCliente.cpf_cnpj);
    
    const observacoes = [
      mysqlCliente.apelido ? `Apelido: ${mysqlCliente.apelido}` : null,
      mysqlCliente.honorario ? `Honorário: R$ ${parseFloat(mysqlCliente.honorario).toFixed(2)}` : null,
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
      nomeFantasia: mysqlCliente.nome_fantasia ? mysqlCliente.nome_fantasia.trim() : null,
      codigoErp: mysqlCliente.codigo_erp ? mysqlCliente.codigo_erp.trim() : null,
      cep: mysqlCliente.cep ? mysqlCliente.cep.trim() : null,
      logradouro: mysqlCliente.logradouro ? mysqlCliente.logradouro.trim() : null,
      numero: mysqlCliente.numero ? mysqlCliente.numero.trim() : null,
      complemento: mysqlCliente.complemento ? mysqlCliente.complemento.trim() : null,
      bairro: mysqlCliente.bairro ? mysqlCliente.bairro.trim() : null,
      cidade: mysqlCliente.cidade ? mysqlCliente.cidade.trim() : null,
      estado: mysqlCliente.uf ? mysqlCliente.uf.trim() : null,
      site: mysqlCliente.website ? mysqlCliente.website.trim() : null,
      observacoes: observacoes,
      ativo: true,
      tipoServico: "recorrente",
    };
  }

  async migrateCliente(mysqlCliente, targetCompanyId, updateExisting = false) {
    try {
      const mapped = this.mapMySQLToPostgres(mysqlCliente, targetCompanyId);
      
      const whereClause = { companyId: targetCompanyId };
      
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
        await Cliente.create(mapped);
        this.log(`✅ Inserido: ${mysqlCliente.nome} (${mapped.cpf || mapped.cnpj})`);
        this.stats.inseridos++;
      }

      return true;
    } catch (error) {
      this.log(`❌ Erro ao migrar "${mysqlCliente.nome}": ${error.message}`);
      this.stats.erros++;
      return false;
    }
  }

  async run(targetCompanyId, mysqlEmpresaId, updateExisting = false) {
    console.log("\n🚀 Iniciando migração de clientes MySQL → PostgreSQL\n");
    console.log("=".repeat(60));

    try {
      await this.connectMySQL();
      
      const mysqlClientes = await this.fetchMySQLClientes(mysqlEmpresaId);
      this.stats.total = mysqlClientes.length;

      this.log(`🎯 Empresa PostgreSQL destino: ${targetCompanyId}`);
      this.log(`🎯 Modo: ${updateExisting ? "INSERIR e ATUALIZAR" : "APENAS INSERIR novos"}`);
      this.log("=".repeat(60));

      for (let i = 0; i < mysqlClientes.length; i++) {
        const cliente = mysqlClientes[i];
        process.stdout.write(`\r📦 Processando ${i + 1}/${mysqlClientes.length}... `);
        await this.migrateCliente(cliente, targetCompanyId, updateExisting);
      }

      console.log("\n");
      this.log("=".repeat(60));
      this.log("✅ Migração concluída!");
      this.log(`📊 Total processado: ${this.stats.total}`);
      this.log(`✅ Inseridos: ${this.stats.inseridos}`);
      this.log(`🔄 Atualizados: ${this.stats.atualizados}`);
      this.log(`⏭️  Ignorados: ${this.stats.ignorados}`);
      this.log(`❌ Erros: ${this.stats.erros}`);
      this.log("=".repeat(60));

      await this.saveLog();

    } catch (error) {
      this.log(`❌ Erro fatal: ${error.message}`);
      console.error(error);
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        this.log("🔌 Conexão MySQL fechada");
      }
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logMessages.push(logEntry);
    console.log(message);
  }

  async saveLog() {
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

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║          MIGRAÇÃO DE CLIENTES MySQL → PostgreSQL               ║
╚════════════════════════════════════════════════════════════════╝

📋 Uso:
  node src/scripts/migrate-clientes-mysql.js <companyId> [mysqlEmpresaId] [--update]

📌 Exemplos:
  node src/scripts/migrate-clientes-mysql.js 1
  node src/scripts/migrate-clientes-mysql.js 1 14
  node src/scripts/migrate-clientes-mysql.js 1 14 --update
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

main().catch(error => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
