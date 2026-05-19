import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Socios", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false
      },
      
      // Dados pessoais (necessários para IRPF)
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cpf: {
        type: DataTypes.STRING(14),
        allowNull: false
      },
      rg: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      nacionalidade: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "Brasileira"
      },
      naturalidade: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      estadoCivil: {
        type: DataTypes.ENUM("solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"),
        allowNull: true
      },
      profissao: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      
      // Contato
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      celular: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      
      // Endereço (necessário para IRPF)
      cep: {
        type: DataTypes.STRING(9),
        allowNull: true
      },
      logradouro: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numero: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      complemento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bairro: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      
      // Dependentes (JSON para IRPF)
      // [{nome, cpf, parentesco, dataNascimento}]
      dependentes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      
      // Dados bancários (para pagamento de pró-labore)
      banco: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      agencia: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      conta: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      tipoConta: {
        type: DataTypes.ENUM("corrente", "poupanca"),
        allowNull: true
      },
      chavePix: {
        type: DataTypes.STRING,
        allowNull: true
      },
      
      // Controle
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      
      // Timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Socios");
  }
};
