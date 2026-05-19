import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasEntregasMensais", {
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
      janeiro: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      fevereiro: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      marco: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      abril: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      maio: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      junho: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      julho: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      agosto: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      setembro: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      outubro: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      novembro: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      dezembro: {
        type: DataTypes.INTEGER,
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
    return queryInterface.dropTable("TarefasEntregasMensais");
  }
};
