import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ControleNotificacoes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      controleClienteId: {
        type: DataTypes.INTEGER,
        references: { model: "ControleClientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      controleConfigId: {
        type: DataTypes.INTEGER,
        references: { model: "ControlesConfig", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      clienteId: {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM(
          "vinculacao",
          "desvinculacao",
          "alteracao",
          "geracao_tarefa",
          "lembrete",
          "vencimento"
        ),
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "Departamentos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      usuariosIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
        allowNull: true,
        comment: "Array de IDs de usuários para notificação individual",
      },
      lida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      lidaEm: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Dados adicionais da notificação (links, ações, etc)",
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ControleNotificacoes");
  },
};
