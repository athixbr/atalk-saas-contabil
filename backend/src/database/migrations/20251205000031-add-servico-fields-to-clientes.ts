import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar campo tipoServico
      await queryInterface.addColumn(
        "Clientes",
        "tipoServico",
        {
          type: DataTypes.ENUM("interno", "recorrente", "esporadico"),
          allowNull: true,
          defaultValue: "recorrente",
        },
        { transaction }
      );

      // Adicionar campo codigoErp
      await queryInterface.addColumn(
        "Clientes",
        "codigoErp",
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Adicionar campo codigoSistema
      await queryInterface.addColumn(
        "Clientes",
        "codigoSistema",
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Criar índice para codigoErp
      await queryInterface.addIndex("Clientes", ["codigoErp"], {
        name: "idx_clientes_codigo_erp",
        transaction,
      });

      // Criar índice para codigoSistema
      await queryInterface.addIndex("Clientes", ["codigoSistema"], {
        name: "idx_clientes_codigo_sistema",
        transaction,
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover índices
      await queryInterface.removeIndex(
        "Clientes",
        "idx_clientes_codigo_sistema",
        { transaction }
      );
      await queryInterface.removeIndex("Clientes", "idx_clientes_codigo_erp", {
        transaction,
      });

      // Remover colunas
      await queryInterface.removeColumn("Clientes", "codigoSistema", {
        transaction,
      });
      await queryInterface.removeColumn("Clientes", "codigoErp", {
        transaction,
      });
      await queryInterface.removeColumn("Clientes", "tipoServico", {
        transaction,
      });
    });
  },
};
