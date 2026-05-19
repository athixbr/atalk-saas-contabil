import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasGeradas", {
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
      clienteId: {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "Departamentos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("pendente", "em_andamento", "concluida", "cancelada"),
        defaultValue: "pendente"
      },
      dataInicio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      dataEntrega: {
        type: DataTypes.DATE,
        allowNull: false
      },
      dataConclusao: {
        type: DataTypes.DATE,
        allowNull: true
      },
      competencia: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Formato: MM/YYYY"
      },
      checklistCompleto: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Cópia do checklist com status de cada item"
      },
      observacoes: {
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
    return queryInterface.dropTable("TarefasGeradas");
  }
};
