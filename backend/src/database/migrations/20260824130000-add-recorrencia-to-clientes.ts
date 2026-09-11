import __cjs_sequelize from "sequelize";
const { DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: any) => {
    await queryInterface.addColumn("Clientes", "recorrencia", {
      type: DataTypes.ENUM("recorrente", "nao_recorrente"),
      allowNull: false,
      defaultValue: "recorrente",
    });
  },

  down: async (queryInterface: any) => {
    await queryInterface.removeColumn("Clientes", "recorrencia");
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Clientes_recorrencia";');
    }
  },
};
