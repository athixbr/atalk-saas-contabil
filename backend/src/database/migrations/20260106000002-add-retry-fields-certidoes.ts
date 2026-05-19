import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Certidoes", "proximaTentativa", {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Data para próxima tentativa automática de reprocessamento"
      }),
      queryInterface.addColumn("Certidoes", "tentativasRealizadas", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Número de tentativas já realizadas"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Certidoes", "proximaTentativa"),
      queryInterface.removeColumn("Certidoes", "tentativasRealizadas")
    ]);
  }
};
