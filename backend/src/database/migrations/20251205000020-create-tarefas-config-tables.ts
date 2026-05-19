import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Criar tabela TarefasConfig
      await queryInterface.createTable(
        "TarefasConfig",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          titulo: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          descricao: {
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
          temVencimento: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          diasParaVencimento: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          statusId: {
            type: DataTypes.INTEGER,
            references: { model: "Status", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true,
          },
          diasLembrete: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          prazoId: {
            type: DataTypes.INTEGER,
            references: { model: "Prazos", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true,
          },
          aceitaArquivos: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        },
        { transaction }
      );

      // Criar tabela TarefasConfigChecklist
      await queryInterface.createTable(
        "TarefasConfigChecklist",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          tarefaConfigId: {
            type: DataTypes.INTEGER,
            references: { model: "TarefasConfig", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false,
          },
          text: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          image: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      // Criar índices
      await queryInterface.addIndex(
        "TarefasConfig",
        ["companyId"],
        {
          name: "idx_tarefas_config_companyId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfig",
        ["departamentoId"],
        {
          name: "idx_tarefas_config_departamentoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfig",
        ["statusId"],
        {
          name: "idx_tarefas_config_statusId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfig",
        ["prazoId"],
        {
          name: "idx_tarefas_config_prazoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfig",
        ["ativo"],
        {
          name: "idx_tarefas_config_ativo",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfigChecklist",
        ["tarefaConfigId"],
        {
          name: "idx_tarefas_config_checklist_tarefaConfigId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "TarefasConfigChecklist",
        ["tarefaConfigId", "order"],
        {
          name: "idx_tarefas_config_checklist_order",
          transaction,
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("TarefasConfigChecklist", { transaction });
      await queryInterface.dropTable("TarefasConfig", { transaction });
    });
  },
};
