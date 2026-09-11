export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("DocumentoClienteAcessos", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      tipo: { type: Sequelize.STRING, allowNull: false, defaultValue: "gov" },
      usuario: { type: Sequelize.STRING, allowNull: false },
      senhaEncriptada: { type: Sequelize.TEXT, allowNull: false },
      observacoes: { type: Sequelize.TEXT },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex("DocumentoClienteAcessos", ["companyId", "clienteId"]);
    await queryInterface.addColumn("CertificadosDigitais", "clienteId", {
      type: Sequelize.INTEGER,
      references: { model: "Clientes", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addColumn("CertificadosDigitais", "notificarEmail", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn("CertificadosDigitais", "notificarWhatsapp", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn("CertificadosDigitais", "lembretesDias", { type: Sequelize.JSON, allowNull: false, defaultValue: [45, 30, 15, 5] });
    await queryInterface.addColumn("CertificadosDigitais", "notificacoesEnviadas", { type: Sequelize.JSON, allowNull: false, defaultValue: [] });
    await queryInterface.addIndex("CertificadosDigitais", ["companyId", "clienteId"]);
  },

  down: async queryInterface => {
    await queryInterface.removeIndex("CertificadosDigitais", ["companyId", "clienteId"]);
    await queryInterface.removeColumn("CertificadosDigitais", "notificacoesEnviadas");
    await queryInterface.removeColumn("CertificadosDigitais", "lembretesDias");
    await queryInterface.removeColumn("CertificadosDigitais", "notificarWhatsapp");
    await queryInterface.removeColumn("CertificadosDigitais", "notificarEmail");
    await queryInterface.removeColumn("CertificadosDigitais", "clienteId");
    await queryInterface.dropTable("DocumentoClienteAcessos");
  }
};
