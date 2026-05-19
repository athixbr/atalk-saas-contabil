import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se as colunas existem
    const columns: any = await queryInterface.describeTable("LogsCertidoes");
    
    // 1. Adicionar coluna clienteId se não existir
    if (!columns.clienteId) {
      await queryInterface.addColumn("LogsCertidoes", "clienteId", {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      });
    }

    // 2. Migrar dados de clienteCertidaoId para clienteId (apenas se clienteCertidaoId existir)
    // E apenas se ClientesCertidoes ainda existir
    const tables = await queryInterface.showAllTables();
    if (columns.clienteCertidaoId && tables.includes("ClientesCertidoes")) {
      await queryInterface.sequelize.query(`
        UPDATE "LogsCertidoes" lc
        SET "clienteId" = c."id"
        FROM "Clientes" c, "ClientesCertidoes" cc
        WHERE lc."clienteCertidaoId" = cc."id"
        AND (
          (c."cpf" = cc."cpf" AND cc."cpf" IS NOT NULL AND cc."cpf" != '')
          OR (c."cnpj" = cc."cnpj" AND cc."cnpj" IS NOT NULL AND cc."cnpj" != '')
        )
      `);
    }

    // 3. Remover constraint e coluna clienteCertidaoId (se existir)
    if (columns.clienteCertidaoId) {
      await queryInterface.removeColumn("LogsCertidoes", "clienteCertidaoId");
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Adicionar coluna clienteCertidaoId de volta
    await queryInterface.addColumn("LogsCertidoes", "clienteCertidaoId", {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    // Remover coluna clienteId
    await queryInterface.removeColumn("LogsCertidoes", "clienteId");
  }
};
