import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("CrmTasks", "clientId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmClients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
        comment: "Cliente vinculado (opcional, alternativa ao leadId)"
      }),
      queryInterface.addColumn("CrmInteractions", "clientId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmClients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
        comment: "Cliente vinculado (opcional, alternativa ao leadId)"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("CrmTasks", "clientId"),
      queryInterface.removeColumn("CrmInteractions", "clientId")
    ]);
  }
};
