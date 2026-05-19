import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("Parcelamentos");
    
    // Adicionar campos se não existirem
    const fieldsToAdd = [
      { name: "descricao", type: DataTypes.TEXT, allowNull: true },
      { name: "clienteId", type: DataTypes.INTEGER, references: { model: "Clientes", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL", allowNull: true },
      { name: "valorTotal", type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      { name: "numeroParcelas", type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
      { name: "dataInicio", type: DataTypes.DATE, allowNull: true },
      { name: "periodicidade", type: DataTypes.ENUM("mensal", "quinzenal", "semanal"), allowNull: true, defaultValue: "mensal" },
      { name: "diaVencimento", type: DataTypes.INTEGER, allowNull: true },
      { name: "gerarTarefas", type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
      { name: "tarefaConfigId", type: DataTypes.INTEGER, references: { model: "TarefasConfig", key: "id" }, onUpdate: "SET NULL", onDelete: "SET NULL", allowNull: true },
      { name: "departamentoId", type: DataTypes.INTEGER, references: { model: "Departamentos", key: "id" }, onUpdate: "SET NULL", onDelete: "SET NULL", allowNull: true },
      { name: "responsavelId", type: DataTypes.INTEGER, references: { model: "Users", key: "id" }, onUpdate: "SET NULL", onDelete: "SET NULL", allowNull: true },
      { name: "status", type: DataTypes.ENUM("ativo", "concluido", "cancelado", "suspenso"), allowNull: true, defaultValue: "ativo" },
      { name: "observacoes", type: DataTypes.TEXT, allowNull: true },
      { name: "ativo", type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    ];

    for (const field of fieldsToAdd) {
      if (!table[field.name]) {
        await queryInterface.addColumn("Parcelamentos", field.name, field);
      }
    }

    // Criar índices
    try {
      await queryInterface.addIndex("Parcelamentos", ["clienteId"], {
        name: "idx_parcelamentos_cliente_id"
      });
    } catch (e) {
      console.log("Índice idx_parcelamentos_cliente_id já existe");
    }

    try {
      await queryInterface.addIndex("Parcelamentos", ["tarefaConfigId"], {
        name: "idx_parcelamentos_tarefa_config_id"
      });
    } catch (e) {
      console.log("Índice idx_parcelamentos_tarefa_config_id já existe");
    }

    try {
      await queryInterface.addIndex("Parcelamentos", ["status"], {
        name: "idx_parcelamentos_status"
      });
    } catch (e) {
      console.log("Índice idx_parcelamentos_status já existe");
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const fieldsToRemove = [
      "descricao", "clienteId", "valorTotal", "numeroParcelas", "dataInicio",
      "periodicidade", "diaVencimento", "gerarTarefas", "tarefaConfigId",
      "departamentoId", "responsavelId", "status", "observacoes", "ativo"
    ];

    for (const field of fieldsToRemove) {
      try {
        await queryInterface.removeColumn("Parcelamentos", field);
      } catch (e) {
        console.log(`Erro ao remover coluna ${field}:`, e.message);
      }
    }

    // Remover índices
    try {
      await queryInterface.removeIndex("Parcelamentos", "idx_parcelamentos_cliente_id");
    } catch (e) {}
    try {
      await queryInterface.removeIndex("Parcelamentos", "idx_parcelamentos_tarefa_config_id");
    } catch (e) {}
    try {
      await queryInterface.removeIndex("Parcelamentos", "idx_parcelamentos_status");
    } catch (e) {}
  }
};
