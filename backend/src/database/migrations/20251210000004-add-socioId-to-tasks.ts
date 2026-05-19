import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tasks", "socioId", {
      type: DataTypes.INTEGER,
      references: { model: "Socios", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
      comment: "Sócio vinculado à tarefa (ex: IRPF)"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tasks", "socioId");
  }
};
