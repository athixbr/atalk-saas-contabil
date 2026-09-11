import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("NfeXmls", {
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
        onDelete: "CASCADE",
        allowNull: false
      },
      // Nullable de propósito: um XML pode não bater com nenhum Cliente cadastrado
      // no momento do upload (CNPJ ainda não cadastrado, digitação divergente etc.).
      // onDelete SET NULL (diferente do CASCADE usado nas tabelas filhas) para não
      // apagar histórico fiscal se o Cliente for excluído depois.
      clienteId: {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      chaveAcesso: {
        type: DataTypes.STRING(44),
        allowNull: false
      },
      tipoOperacao: {
        type: DataTypes.ENUM("entrada", "saida", "indeterminado"),
        allowNull: false,
        defaultValue: "indeterminado"
      },
      situacao: {
        type: DataTypes.ENUM("autorizada", "cancelada", "denegada"),
        allowNull: false,
        defaultValue: "autorizada"
      },
      numeroNF: { type: DataTypes.STRING(20), allowNull: true },
      serie: { type: DataTypes.STRING(10), allowNull: true },
      modelo: { type: DataTypes.STRING(5), allowNull: true },
      naturezaOperacao: { type: DataTypes.STRING(255), allowNull: true },
      dataEmissao: { type: DataTypes.DATE, allowNull: true },
      dataSaidaEntrada: { type: DataTypes.DATE, allowNull: true },

      emitCnpj: { type: DataTypes.STRING(20), allowNull: true },
      emitRazaoSocial: { type: DataTypes.STRING(255), allowNull: true },
      emitNomeFantasia: { type: DataTypes.STRING(255), allowNull: true },
      emitInscricaoEstadual: { type: DataTypes.STRING(20), allowNull: true },
      emitEndereco: { type: DataTypes.JSONB, allowNull: true },

      destCnpjCpf: { type: DataTypes.STRING(20), allowNull: true },
      destRazaoSocial: { type: DataTypes.STRING(255), allowNull: true },
      destInscricaoEstadual: { type: DataTypes.STRING(20), allowNull: true },
      destEndereco: { type: DataTypes.JSONB, allowNull: true },

      valorTotalProdutos: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalNota: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalDesconto: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalFrete: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalSeguro: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalOutrasDespesas: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorBaseCalculoICMS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorICMS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorICMSDesonerado: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalIPI: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalPIS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      valorTotalCOFINS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      protocoloAutorizacao: { type: DataTypes.STRING(20), allowNull: true },
      dataAutorizacao: { type: DataTypes.DATE, allowNull: true },
      protocoloCancelamento: { type: DataTypes.STRING(20), allowNull: true },
      dataCancelamento: { type: DataTypes.DATE, allowNull: true },
      motivoCancelamento: { type: DataTypes.TEXT, allowNull: true },

      xmlOriginalUrl: { type: DataTypes.TEXT, allowNull: true },
      xmlOriginalNome: { type: DataTypes.STRING(255), allowNull: true },
      xmlOriginalHash: { type: DataTypes.STRING(64), allowNull: true },
      rawParseWarnings: { type: DataTypes.JSONB, allowNull: true },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false }
    });

    await queryInterface.addIndex("NfeXmls", ["companyId", "chaveAcesso"], {
      unique: true,
      name: "nfe_xmls_company_chave_unique"
    });
    await queryInterface.addIndex("NfeXmls", ["companyId", "clienteId"], {
      name: "nfe_xmls_company_cliente_idx"
    });
    await queryInterface.addIndex("NfeXmls", ["companyId", "dataEmissao"], {
      name: "nfe_xmls_company_data_emissao_idx"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("NfeXmls");
  }
};
