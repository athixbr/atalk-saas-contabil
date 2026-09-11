import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("DocumentoClienteAcessos", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      tipo: { type: DataTypes.STRING, allowNull: false, defaultValue: "gov" },
      usuario: { type: DataTypes.STRING, allowNull: false },
      senhaEncriptada: { type: DataTypes.TEXT, allowNull: false },
      observacoes: { type: DataTypes.TEXT },
      ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false }
    });

    await queryInterface.addIndex("DocumentoClienteAcessos", ["companyId", "clienteId"]);
    await queryInterface.addColumn("CertificadosDigitais", "clienteId", {
      type: DataTypes.INTEGER,
      references: { model: "Clientes", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addColumn("CertificadosDigitais", "notificarEmail", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn("CertificadosDigitais", "notificarWhatsapp", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn("CertificadosDigitais", "lembretesDias", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [45, 30, 15, 5]
    });
    await queryInterface.addColumn("CertificadosDigitais", "notificacoesEnviadas", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    });
    await queryInterface.addIndex("CertificadosDigitais", ["companyId", "clienteId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("CertificadosDigitais", ["companyId", "clienteId"]);
    await queryInterface.removeColumn("CertificadosDigitais", "notificacoesEnviadas");
    await queryInterface.removeColumn("CertificadosDigitais", "lembretesDias");
    await queryInterface.removeColumn("CertificadosDigitais", "notificarWhatsapp");
    await queryInterface.removeColumn("CertificadosDigitais", "notificarEmail");
    await queryInterface.removeColumn("CertificadosDigitais", "clienteId");
    await queryInterface.dropTable("DocumentoClienteAcessos");
  }
};
