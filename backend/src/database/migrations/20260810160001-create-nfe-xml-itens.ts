import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("NfeXmlItens", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nfeXmlId: {
        type: DataTypes.INTEGER,
        references: { model: "NfeXmls", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      numeroItem: { type: DataTypes.INTEGER, allowNull: true },
      codigoProduto: { type: DataTypes.STRING(60), allowNull: true },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      ncm: { type: DataTypes.STRING(10), allowNull: true },
      cfop: { type: DataTypes.STRING(10), allowNull: true },
      unidadeComercial: { type: DataTypes.STRING(10), allowNull: true },
      quantidadeComercial: { type: DataTypes.DECIMAL(14, 4), allowNull: true },
      valorUnitarioComercial: { type: DataTypes.DECIMAL(18, 10), allowNull: true },
      valorTotalProduto: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      cst: { type: DataTypes.STRING(5), allowNull: true },
      csosn: { type: DataTypes.STRING(5), allowNull: true },
      valorBaseCalculoICMS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      aliquotaICMS: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
      valorICMS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      cstIPI: { type: DataTypes.STRING(5), allowNull: true },
      aliquotaIPI: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
      valorIPI: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      cstPIS: { type: DataTypes.STRING(5), allowNull: true },
      aliquotaPIS: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
      valorPIS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      cstCOFINS: { type: DataTypes.STRING(5), allowNull: true },
      aliquotaCOFINS: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
      valorCOFINS: { type: DataTypes.DECIMAL(14, 2), allowNull: true },

      impostosRaw: { type: DataTypes.JSONB, allowNull: true },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false }
    });

    await queryInterface.addIndex("NfeXmlItens", ["nfeXmlId"], {
      name: "nfe_xml_itens_nfe_xml_idx"
    });
    await queryInterface.addIndex("NfeXmlItens", ["companyId", "ncm"], {
      name: "nfe_xml_itens_company_ncm_idx"
    });
    await queryInterface.addIndex("NfeXmlItens", ["companyId", "cfop"], {
      name: "nfe_xml_itens_company_cfop_idx"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("NfeXmlItens");
  }
};
