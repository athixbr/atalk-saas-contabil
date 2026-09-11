import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ControleComData", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addIndex("ControleComData", ["companyId"], {
      name: "ControleComData_companyId_idx",
    });

    await queryInterface.addColumn("TarefasRecorrentesClientes", "vencimento", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentesClientes", "controleComDataId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "ControleComData", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("TarefasRecorrentesClientes", "controleComDataId");
    await queryInterface.removeColumn("TarefasRecorrentesClientes", "vencimento");
    await queryInterface.dropTable("ControleComData");
  },
};
