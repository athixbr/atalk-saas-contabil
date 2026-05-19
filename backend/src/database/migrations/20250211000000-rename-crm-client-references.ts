import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Verificar se a coluna crmClientId existe em CrmTasks
    const taskColumns: any = await queryInterface.describeTable("CrmTasks");
    
    if (taskColumns.crmClientId) {
      // Renomear crmClientId para clienteId em CrmTasks
      await queryInterface.renameColumn("CrmTasks", "crmClientId", "clienteId");
      
      // Remover constraint antiga se existir
      try {
        await queryInterface.removeConstraint("CrmTasks", "CrmTasks_crmClientId_fkey");
      } catch (e) {
        // Constraint pode não existir
      }
      
      // Adicionar nova constraint apontando para Clientes
      await queryInterface.sequelize.query(`
        ALTER TABLE "CrmTasks" 
        ADD CONSTRAINT "CrmTasks_clienteId_fkey" 
        FOREIGN KEY ("clienteId") 
        REFERENCES "Clientes"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
      `);
    } else if (!taskColumns.clienteId) {
      // Se não existe nem crmClientId nem clienteId, criar clienteId
      await queryInterface.addColumn("CrmTasks", "clienteId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Clientes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    }

    // 2. Verificar se a coluna crmClientId existe em CrmInteractions
    const interactionColumns: any = await queryInterface.describeTable("CrmInteractions");
    
    if (interactionColumns.crmClientId) {
      // Renomear crmClientId para clienteId em CrmInteractions
      await queryInterface.renameColumn("CrmInteractions", "crmClientId", "clienteId");
      
      // Remover constraint antiga se existir
      try {
        await queryInterface.removeConstraint("CrmInteractions", "CrmInteractions_crmClientId_fkey");
      } catch (e) {
        // Constraint pode não existir
      }
      
      // Adicionar nova constraint apontando para Clientes
      await queryInterface.sequelize.query(`
        ALTER TABLE "CrmInteractions" 
        ADD CONSTRAINT "CrmInteractions_clienteId_fkey" 
        FOREIGN KEY ("clienteId") 
        REFERENCES "Clientes"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
      `);
    } else if (!interactionColumns.clienteId) {
      // Se não existe nem crmClientId nem clienteId, criar clienteId
      await queryInterface.addColumn("CrmInteractions", "clienteId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Clientes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    }

    console.log("✅ Referências de CrmTasks e CrmInteractions atualizadas para usar Clientes");
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter renomeações
    const taskColumns: any = await queryInterface.describeTable("CrmTasks");
    if (taskColumns.clienteId) {
      await queryInterface.renameColumn("CrmTasks", "clienteId", "crmClientId");
    }

    const interactionColumns: any = await queryInterface.describeTable("CrmInteractions");
    if (interactionColumns.clienteId) {
      await queryInterface.renameColumn("CrmInteractions", "clienteId", "crmClientId");
    }

    console.log("⚠️  Rollback: Colunas renomeadas de volta para crmClientId");
  }
};
