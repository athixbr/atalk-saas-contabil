import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar novas colunas
    await queryInterface.addColumn("ControleClientes", "dataInicio", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("ControleClientes", "dataFim", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("ControleClientes", "departamentoId", {
      type: DataTypes.INTEGER,
      references: { model: "Departamentos", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
    });

    await queryInterface.addColumn("ControleClientes", "usuarioId", {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
    });

    await queryInterface.addColumn("ControleClientes", "ativo", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn("ControleClientes", "observacoes", {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    // Migrar dados: copiar dataVencimento para dataInicio (apenas para não perder dados)
    await queryInterface.sequelize.query(`
      UPDATE "ControleClientes" 
      SET "dataInicio" = "dataVencimento"
      WHERE "dataVencimento" IS NOT NULL
    `);

    // Remover coluna antiga
    await queryInterface.removeColumn("ControleClientes", "dataVencimento");
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter: adicionar dataVencimento de volta
    await queryInterface.addColumn("ControleClientes", "dataVencimento", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });

    // Copiar dataInicio de volta para dataVencimento
    await queryInterface.sequelize.query(`
      UPDATE "ControleClientes" 
      SET "dataVencimento" = "dataInicio"
      WHERE "dataInicio" IS NOT NULL
    `);

    // Remover as colunas adicionadas
    await queryInterface.removeColumn("ControleClientes", "observacoes");
    await queryInterface.removeColumn("ControleClientes", "ativo");
    await queryInterface.removeColumn("ControleClientes", "usuarioId");
    await queryInterface.removeColumn("ControleClientes", "departamentoId");
    await queryInterface.removeColumn("ControleClientes", "dataFim");
    await queryInterface.removeColumn("ControleClientes", "dataInicio");
  },
};
