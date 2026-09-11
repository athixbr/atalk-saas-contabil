import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: typeof QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
          UPDATE "Clientes"
          SET "codigoSistema" = "id"::text
          WHERE "codigoSistema" IS NULL OR TRIM("codigoSistema") = ''
        `,
        { transaction }
      );
    });
  },

  down: () => Promise.resolve(),
};
