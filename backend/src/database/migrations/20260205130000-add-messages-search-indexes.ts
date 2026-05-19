import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // Criar índice para busca em mensagens sem unaccent (mais simples)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS "messages_body_search_idx" 
        ON "Messages" 
        USING gin (to_tsvector('portuguese', body));
      `);
    } catch (error) {
      console.log("Erro ao criar messages_body_search_idx:", error.message);
    }
    
    try {
      // Índice adicional para busca LIKE (fallback) - sem unaccent
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS "messages_body_lower_idx" 
        ON "Messages" 
        (LOWER(body) text_pattern_ops);
      `);
    } catch (error) {
      console.log("Erro ao criar messages_body_lower_idx:", error.message);
    }

    try {
      // Índice para ticketId em mensagens (já deve existir, mas garantir)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS "messages_ticket_id_idx" 
        ON "Messages" ("ticketId");
      `);
    } catch (error) {
      console.log("Erro ao criar messages_ticket_id_idx:", error.message);
    }
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query('DROP INDEX IF EXISTS "messages_body_search_idx";'),
      queryInterface.sequelize.query('DROP INDEX IF EXISTS "messages_body_lower_idx";'),
      queryInterface.sequelize.query('DROP INDEX IF EXISTS "messages_ticket_id_idx";')
    ]);
  }
};
