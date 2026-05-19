import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CampaignGruposConfig", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      syncInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: "Intervalo de sincronização em minutos"
      },
      autoSync: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      maxGroupsPerCampaign: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
      },
      delayBetweenMessages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: "Delay em segundos entre envios"
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
        unique: true
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
    return queryInterface.dropTable("CampaignGruposConfig");
  }
};
