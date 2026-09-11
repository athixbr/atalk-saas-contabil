import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("TemplatesLeitura", "arquivoEspelhoNome", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "arquivoEspelhoPath", {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "arquivoEspelhoMimeType", {
      type: DataTypes.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "arquivoEspelhoSize", {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "textoEspelho", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "dadosEspelho", {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn("TemplatesLeitura", "instrucoesIa", {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("TemplatesLeitura", "instrucoesIa");
    await queryInterface.removeColumn("TemplatesLeitura", "dadosEspelho");
    await queryInterface.removeColumn("TemplatesLeitura", "textoEspelho");
    await queryInterface.removeColumn("TemplatesLeitura", "arquivoEspelhoSize");
    await queryInterface.removeColumn("TemplatesLeitura", "arquivoEspelhoMimeType");
    await queryInterface.removeColumn("TemplatesLeitura", "arquivoEspelhoPath");
    await queryInterface.removeColumn("TemplatesLeitura", "arquivoEspelhoNome");
  }
};
