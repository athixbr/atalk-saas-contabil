export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("TiposConta", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      nome: { type: Sequelize.STRING, allowNull: false },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex("TiposConta", ["companyId", "nome"]);

    await queryInterface.addColumn("DocumentoClienteAcessos", "tipoContaId", {
      type: Sequelize.INTEGER,
      references: { model: "TiposConta", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addColumn("DocumentoClienteAcessos", "doisFatoresAtivo", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    const companies = await queryInterface.sequelize.query('SELECT id FROM "Companies"', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    });
    const now = new Date();
    const defaults = ["Gov.br", "Receita Federal", "Prefeitura", "SEFAZ", "INSS"];
    const rows = companies.flatMap(company =>
      defaults.map(nome => ({ companyId: company.id, nome, ativo: true, createdAt: now, updatedAt: now }))
    );
    if (rows.length) await queryInterface.bulkInsert("TiposConta", rows);
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("DocumentoClienteAcessos", "doisFatoresAtivo");
    await queryInterface.removeColumn("DocumentoClienteAcessos", "tipoContaId");
    await queryInterface.dropTable("TiposConta");
  }
};
