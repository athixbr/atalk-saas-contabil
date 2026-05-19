import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasChecklists", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      tarefaInfoId: {
        type: DataTypes.INTEGER,
        references: { model: "TarefasInfoGerais", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      checklistId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passos: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
      },
      obrigatorio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      imagemUrl: {
        type: DataTypes.STRING,
        allowNull: true
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
    return queryInterface.dropTable("TarefasChecklists");
  }
};
