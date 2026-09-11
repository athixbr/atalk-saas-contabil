import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Bug anterior: o formulário enviava "ativa: null" quando o usuário não
    // tocava no campo, e o backend gravava NULL explícito em vez de aplicar
    // o defaultValue: true da coluna. Tarefas com ativa=NULL ficavam fora
    // da geração automática (GenerateTarefasRecorrentesService filtra
    // where: { ativa: true }). Corrige os registros já afetados.
    await queryInterface.sequelize.query(
      `UPDATE "TarefasRecorrentes" SET "ativa" = true WHERE "ativa" IS NULL;`
    );
  },

  down: async () => {
    // Não há como saber quais registros eram NULL antes da correção,
    // e não existe motivo de negócio para reverter esta correção de dados.
  }
};
