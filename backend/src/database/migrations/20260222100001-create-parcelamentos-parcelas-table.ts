import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes("ParcelamentosParcelas")) {
      await queryInterface.createTable("ParcelamentosParcelas", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        parcelamentoId: {
          type: DataTypes.INTEGER,
          references: { model: "Parcelamentos", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        numeroParcela: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        valor: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        dataVencimento: {
          type: DataTypes.DATE,
          allowNull: false
        },
        dataPagamento: {
          type: DataTypes.DATE,
          allowNull: true
        },
        valorPago: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM("pendente", "pago", "atrasado", "cancelado"),
          allowNull: false,
          defaultValue: "pendente"
        },
        tarefaGeradaId: {
          type: DataTypes.INTEGER,
          references: { model: "TarefasGeradas", key: "id" },
          onUpdate: "SET NULL",
          onDelete: "SET NULL",
          allowNull: true
        },
        observacoes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
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

      // Criar índices
      await queryInterface.addIndex("ParcelamentosParcelas", ["parcelamentoId"], {
        name: "idx_parcelas_parcelamento_id"
      });

      await queryInterface.addIndex("ParcelamentosParcelas", ["tarefaGeradaId"], {
        name: "idx_parcelas_tarefa_gerada_id"
      });

      await queryInterface.addIndex("ParcelamentosParcelas", ["status"], {
        name: "idx_parcelas_status"
      });

      await queryInterface.addIndex("ParcelamentosParcelas", ["dataVencimento"], {
        name: "idx_parcelas_data_vencimento"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ParcelamentosParcelas");
  }
};
