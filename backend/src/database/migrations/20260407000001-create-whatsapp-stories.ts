import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("WhatsappStories", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onDelete: "CASCADE"
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Whatsapps", key: "id" },
        onDelete: "CASCADE"
      },
      // JID do contato que publicou o story (ex: 5511999999999@s.whatsapp.net)
      senderJid: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Nome do contato remetente
      senderName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Foto de perfil do contato
      senderProfilePic: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Tipo: text | image | video | audio
      mediaType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "text"
      },
      // Conteúdo texto (para stories de texto)
      textContent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Legenda (para stories de mídia)
      caption: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Path no DO Spaces (ex: company1/stories/...)
      mediaPath: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // URL pública CDN do DO Spaces
      mediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Cor de fundo do story de texto (hex)
      backgroundColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // ID original da mensagem no WhatsApp
      messageId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Quando o story expira (24h após publicação)
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      // Quando foi visto (null = não visto)
      seenAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // Direção: received (recebido de contato) | sent (publicado por nós)
      direction: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "received"
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

    await queryInterface.addIndex("WhatsappStories", ["companyId"]);
    await queryInterface.addIndex("WhatsappStories", ["whatsappId"]);
    await queryInterface.addIndex("WhatsappStories", ["senderJid"]);
    await queryInterface.addIndex("WhatsappStories", ["expiresAt"]);
    await queryInterface.addIndex("WhatsappStories", ["direction"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("WhatsappStories");
  }
};
