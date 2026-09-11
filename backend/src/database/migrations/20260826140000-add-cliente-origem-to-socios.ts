import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const columns = await queryInterface.describeTable("Socios");

      if (!columns.clienteOrigemId) {
        await queryInterface.addColumn(
          "Socios",
          "clienteOrigemId",
          {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: "Clientes",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          { transaction }
        );
      }

      const [indexRows] = await queryInterface.sequelize.query(
        "SELECT to_regclass('public.idx_socios_cliente_origem_id') AS index_name",
        { transaction }
      );

      if (!(indexRows as any[])[0]?.index_name) {
        await queryInterface.addIndex("Socios", ["clienteOrigemId"], {
          name: "idx_socios_cliente_origem_id",
          transaction,
        });
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeIndex("Socios", "idx_socios_cliente_origem_id", {
        transaction,
      });
      await queryInterface.removeColumn("Socios", "clienteOrigemId", {
        transaction,
      });
    });
  },
};
