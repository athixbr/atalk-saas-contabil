import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const columns = await queryInterface.describeTable("Socios");

      if (!columns.codigoErp) {
        await queryInterface.addColumn(
          "Socios",
          "codigoErp",
          {
            type: DataTypes.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }

      await queryInterface.changeColumn(
        "Socios",
        "cpf",
        {
          type: DataTypes.STRING(18),
          allowNull: true,
        },
        { transaction }
      );

      if (!columns.codigoSistema) {
        await queryInterface.addColumn(
          "Socios",
          "codigoSistema",
          {
            type: DataTypes.STRING,
            allowNull: true,
          },
          { transaction }
        );
      }

      const [codigoErpIndexRows] = await queryInterface.sequelize.query(
        "SELECT to_regclass('public.idx_socios_codigo_erp') AS index_name",
        { transaction }
      );
      if (!(codigoErpIndexRows as any[])[0]?.index_name) {
        await queryInterface.addIndex("Socios", ["codigoErp"], {
          name: "idx_socios_codigo_erp",
          transaction,
        });
      }

      const [codigoSistemaIndexRows] = await queryInterface.sequelize.query(
        "SELECT to_regclass('public.idx_socios_codigo_sistema') AS index_name",
        { transaction }
      );
      if (!(codigoSistemaIndexRows as any[])[0]?.index_name) {
        await queryInterface.addIndex("Socios", ["codigoSistema"], {
          name: "idx_socios_codigo_sistema",
          transaction,
        });
      }

      await queryInterface.sequelize.query(
        `
          UPDATE "Socios"
          SET "codigoSistema" = "id"::text
          WHERE "codigoSistema" IS NULL OR TRIM("codigoSistema") = ''
        `,
        { transaction }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeIndex("Socios", "idx_socios_codigo_sistema", {
        transaction,
      });
      await queryInterface.removeIndex("Socios", "idx_socios_codigo_erp", {
        transaction,
      });
      await queryInterface.removeColumn("Socios", "codigoSistema", {
        transaction,
      });
      await queryInterface.removeColumn("Socios", "codigoErp", {
        transaction,
      });

      await queryInterface.changeColumn(
        "Socios",
        "cpf",
        {
          type: DataTypes.STRING(14),
          allowNull: true,
        },
        { transaction }
      );
    });
  },
};
