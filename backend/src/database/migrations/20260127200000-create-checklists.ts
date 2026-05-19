import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Criar tabela Checklists
    await queryInterface.createTable("Checklists", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tipo: {
        type: DataTypes.STRING(50),
        defaultValue: "padrao",
        allowNull: false
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
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

    // Criar tabela ChecklistItens
    await queryInterface.createTable("ChecklistItens", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      checklistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Checklists",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      obrigatorio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING(50),
        defaultValue: "texto",
        allowNull: false
      },
      arquivoUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      arquivoNome: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      arquivoPath: {
        type: DataTypes.STRING(500),
        allowNull: true
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

    // Criar índices
    await queryInterface.addIndex("Checklists", ["companyId"]);
    await queryInterface.addIndex("Checklists", ["ativo"]);
    await queryInterface.addIndex("ChecklistItens", ["checklistId"]);
    await queryInterface.addIndex("ChecklistItens", ["ordem"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ChecklistItens");
    await queryInterface.dropTable("Checklists");
  }
};
