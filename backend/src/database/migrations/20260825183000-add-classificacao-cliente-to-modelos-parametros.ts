import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

const COLUMNS = ["grupoClienteId", "segmentoId", "atuacaoId"];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    for (const column of COLUMNS) {
      await queryInterface.addColumn("modelos_parametros", column, {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    for (const column of COLUMNS) {
      await queryInterface.removeColumn("modelos_parametros", column);
    }
  },
};
