import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CampaignGruposGroups", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      campaignGrupoId: {
        type: DataTypes.INTEGER,
        references: { model: "CampaignGrupos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      groupId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "ID do grupo no WhatsApp (remoteJid)"
      },
      groupName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed", "skipped"),
        allowNull: false,
        defaultValue: "pending"
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID da mensagem enviada no WhatsApp"
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      participantsCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CampaignGruposGroups");
  }
};
