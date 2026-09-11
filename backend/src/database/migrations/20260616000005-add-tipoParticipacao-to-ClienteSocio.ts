import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ClienteSocio", "tipoParticipacao", {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: "Tipo de participação: cota_valor_real ou prolabore"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ClienteSocio", "tipoParticipacao");
  }
};
