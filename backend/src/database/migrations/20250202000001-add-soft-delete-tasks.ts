import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar campo createdBy (quem criou a tarefa)
      await queryInterface.addColumn(
        "Tasks",
        "createdBy",
        {
          type: DataTypes.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "SET NULL",
          onDelete: "SET NULL",
          allowNull: true
        },
        { transaction }
      );

      // Adicionar campo deletedAt (soft delete)
      await queryInterface.addColumn(
        "Tasks",
        "deletedAt",
        {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        },
        { transaction }
      );

      // Adicionar campo deletedBy (quem deletou)
      await queryInterface.addColumn(
        "Tasks",
        "deletedBy",
        {
          type: DataTypes.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "SET NULL",
          onDelete: "SET NULL",
          allowNull: true
        },
        { transaction }
      );

      // Preencher createdBy com userId para tarefas existentes
      await queryInterface.sequelize.query(
        `UPDATE "Tasks" SET "createdBy" = "userId" WHERE "createdBy" IS NULL`,
        { transaction }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn("Tasks", "createdBy", { transaction });
      await queryInterface.removeColumn("Tasks", "deletedAt", { transaction });
      await queryInterface.removeColumn("Tasks", "deletedBy", { transaction });
    });
  }
};
