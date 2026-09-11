import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // A esfera deixa de ser um ENUM fixo e passa a aceitar qualquer valor
    // cadastrado pelo usuário em Parâmetros > Outros > Esfera
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasRecorrentes" ALTER COLUMN "esfera" TYPE VARCHAR(255) USING "esfera"::text;`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_TarefasRecorrentes_esfera";`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_TarefasRecorrentes_esfera" AS ENUM ('Municipal', 'Estadual', 'Federal', 'Outros');`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasRecorrentes" ALTER COLUMN "esfera" TYPE "enum_TarefasRecorrentes_esfera" USING "esfera"::"enum_TarefasRecorrentes_esfera";`
    );
  }
};
