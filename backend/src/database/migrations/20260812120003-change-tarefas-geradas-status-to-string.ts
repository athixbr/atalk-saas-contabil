import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // O status deixa de ser um ENUM fixo do Postgres e passa a aceitar
    // qualquer valor validado em nível de aplicação — mesmo padrão já
    // adotado para TarefasRecorrentes.esfera (ver
    // 20260810120001-change-tarefas-recorrentes-esfera-to-string.ts).
    // Motivo imediato: adicionar o status "pausada" sem depender de
    // ALTER TYPE ... ADD VALUE (rígido e com histórico de dor nesse projeto).
    // Diferente de "esfera" (sem default), "status" tem defaultValue:
    // "pendente" — o DEFAULT continua referenciando o tipo ENUM mesmo após
    // trocar o tipo da coluna, então precisa ser removido/recriado à parte
    // antes de dropar o ENUM (senão o DROP TYPE falha por dependência).
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" DROP DEFAULT;`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" TYPE VARCHAR(255) USING "status"::text;`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" SET DEFAULT 'pendente';`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_TarefasGeradas_status";`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" DROP DEFAULT;`
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_TarefasGeradas_status" AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" TYPE "enum_TarefasGeradas_status" USING "status"::"enum_TarefasGeradas_status";`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "TarefasGeradas" ALTER COLUMN "status" SET DEFAULT 'pendente';`
    );
  }
};
