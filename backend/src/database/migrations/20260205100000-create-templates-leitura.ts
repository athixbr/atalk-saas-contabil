import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TemplatesLeitura", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "guia_fgts, guia_inss, darf, certidao, boleto, etc"
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      campos: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: "Array de campos a extrair com regex, tipo e validações"
      },
      validacoes: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Regras de validação customizadas"
      },
      exemplos: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Exemplos de documentos e dados extraídos esperados"
      },
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
    return queryInterface.dropTable("TemplatesLeitura");
  }
};
