import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("ClienteParametrosEndpoints", "vigenciaId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "ClienteVigencias", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addIndex("ClienteParametrosEndpoints", ["vigenciaId"]);

    // Associa os vínculos existentes (só tinham clienteId) à vigência ativa
    // (sem dataFinal) de cada cliente, para não perder o histórico já cadastrado.
    await queryInterface.sequelize.query(`
      UPDATE "ClienteParametrosEndpoints" cpe
      SET "vigenciaId" = cv.id
      FROM "ClienteVigencias" cv
      WHERE cpe."clienteId" = cv."clienteId" AND cv."dataFinal" IS NULL AND cpe."vigenciaId" IS NULL
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("ClienteParametrosEndpoints", "vigenciaId");
  },
};
