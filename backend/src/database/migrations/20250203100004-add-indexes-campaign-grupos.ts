import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      // Índices para CampaignGrupos
      queryInterface.addIndex("CampaignGrupos", ["companyId"], {
        name: "idx_campaign_grupos_company_id"
      }),
      queryInterface.addIndex("CampaignGrupos", ["whatsappId"], {
        name: "idx_campaign_grupos_whatsapp_id"
      }),
      queryInterface.addIndex("CampaignGrupos", ["status"], {
        name: "idx_campaign_grupos_status"
      }),
      queryInterface.addIndex("CampaignGrupos", ["scheduledAt"], {
        name: "idx_campaign_grupos_scheduled_at"
      }),

      // Índices para CampaignGruposGroups
      queryInterface.addIndex("CampaignGruposGroups", ["campaignGrupoId"], {
        name: "idx_campaign_grupos_groups_campaign_id"
      }),
      queryInterface.addIndex("CampaignGruposGroups", ["groupId"], {
        name: "idx_campaign_grupos_groups_group_id"
      }),
      queryInterface.addIndex("CampaignGruposGroups", ["status"], {
        name: "idx_campaign_grupos_groups_status"
      }),

      // Índices para WhatsappGroups
      queryInterface.addIndex("WhatsappGroups", ["whatsappId"], {
        name: "idx_whatsapp_groups_whatsapp_id"
      }),
      queryInterface.addIndex("WhatsappGroups", ["companyId"], {
        name: "idx_whatsapp_groups_company_id"
      }),
      queryInterface.addIndex("WhatsappGroups", ["groupId"], {
        name: "idx_whatsapp_groups_group_id"
      }),
      queryInterface.addIndex("WhatsappGroups", ["isActive"], {
        name: "idx_whatsapp_groups_is_active"
      }),

      // Índice único composto para evitar duplicação
      queryInterface.addIndex("WhatsappGroups", ["groupId", "whatsappId"], {
        name: "idx_whatsapp_groups_unique",
        unique: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeIndex("CampaignGrupos", "idx_campaign_grupos_company_id"),
      queryInterface.removeIndex("CampaignGrupos", "idx_campaign_grupos_whatsapp_id"),
      queryInterface.removeIndex("CampaignGrupos", "idx_campaign_grupos_status"),
      queryInterface.removeIndex("CampaignGrupos", "idx_campaign_grupos_scheduled_at"),
      
      queryInterface.removeIndex("CampaignGruposGroups", "idx_campaign_grupos_groups_campaign_id"),
      queryInterface.removeIndex("CampaignGruposGroups", "idx_campaign_grupos_groups_group_id"),
      queryInterface.removeIndex("CampaignGruposGroups", "idx_campaign_grupos_groups_status"),
      
      queryInterface.removeIndex("WhatsappGroups", "idx_whatsapp_groups_whatsapp_id"),
      queryInterface.removeIndex("WhatsappGroups", "idx_whatsapp_groups_company_id"),
      queryInterface.removeIndex("WhatsappGroups", "idx_whatsapp_groups_group_id"),
      queryInterface.removeIndex("WhatsappGroups", "idx_whatsapp_groups_is_active"),
      queryInterface.removeIndex("WhatsappGroups", "idx_whatsapp_groups_unique")
    ]);
  }
};
