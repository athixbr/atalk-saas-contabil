import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasGeradasHistorico", {
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
      tarefaGeradaId: {
        type: DataTypes.INTEGER,
        references: { model: "TarefasGeradas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      acao: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Ex: criada, atribuida, reatribuida, iniciada, concluida, cancelada"
      },
      departamentoAnterior: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      departamentoNovo: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      usuarioAnterior: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      usuarioNovo: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      observacao: {
        type: DataTypes.TEXT,
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
    return queryInterface.dropTable("TarefasGeradasHistorico");
  }
};
