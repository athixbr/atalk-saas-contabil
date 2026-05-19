import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      // Tabela Status
      queryInterface.createTable("Status", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cor: {
          type: DataTypes.STRING(7),
          allowNull: false,
          defaultValue: "#f44336",
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      }),

      // Tabela Prazos
      queryInterface.createTable("Prazos", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cor: {
          type: DataTypes.STRING(7),
          allowNull: false,
          defaultValue: "#2196F3",
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      }),

      // Tabela Prioridades
      queryInterface.createTable("Prioridades", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cor: {
          type: DataTypes.STRING(7),
          allowNull: false,
          defaultValue: "#F44336",
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      }),
    ]).then(() => {
      return Promise.all([
        // Índices para Status
        queryInterface.addIndex("Status", ["companyId"], {
          name: "idx_status_companyId",
        }),
        queryInterface.addIndex("Status", ["nome"], {
          name: "idx_status_nome",
        }),

        // Índices para Prazos
        queryInterface.addIndex("Prazos", ["companyId"], {
          name: "idx_prazos_companyId",
        }),
        queryInterface.addIndex("Prazos", ["nome"], {
          name: "idx_prazos_nome",
        }),

        // Índices para Prioridades
        queryInterface.addIndex("Prioridades", ["companyId"], {
          name: "idx_prioridades_companyId",
        }),
        queryInterface.addIndex("Prioridades", ["nome"], {
          name: "idx_prioridades_nome",
        }),
      ]);
    });
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.dropTable("Status"),
      queryInterface.dropTable("Prazos"),
      queryInterface.dropTable("Prioridades"),
    ]);
  },
};
