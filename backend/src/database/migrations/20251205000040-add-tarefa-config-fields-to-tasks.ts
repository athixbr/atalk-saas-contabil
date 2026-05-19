import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tasks", "tarefaConfigId", {
        type: DataTypes.INTEGER,
        references: { model: "TarefasConfig", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      }),
      queryInterface.addColumn("Tasks", "prioridadeId", {
        type: DataTypes.INTEGER,
        references: { model: "Prioridades", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      }),
      queryInterface.addColumn("Tasks", "clienteId", {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      }),
      queryInterface.addColumn("Tasks", "departamentoId", {
        type: DataTypes.INTEGER,
        references: { model: "Departamentos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      }),
      queryInterface.addColumn("Tasks", "dataHoraCriacao", {
        type: DataTypes.DATE,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tasks", "tarefaConfigId"),
      queryInterface.removeColumn("Tasks", "prioridadeId"),
      queryInterface.removeColumn("Tasks", "clienteId"),
      queryInterface.removeColumn("Tasks", "departamentoId"),
      queryInterface.removeColumn("Tasks", "dataHoraCriacao"),
    ]);
  },
};
