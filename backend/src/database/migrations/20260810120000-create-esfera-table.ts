import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Esfera", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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

    await queryInterface.addIndex("Esfera", ["companyId"], {
      name: "Esfera_companyId_idx"
    });

    // Preserva os valores hoje fixos no enum como itens iniciais editáveis por empresa
    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM "Companies"`
    );
    const valoresPadrao = ["Municipal", "Estadual", "Federal", "Outros"];
    const now = new Date();
    const rows: any[] = [];
    (companies as any[]).forEach((company: any) => {
      valoresPadrao.forEach(nome => {
        rows.push({
          nome,
          companyId: company.id,
          createdAt: now,
          updatedAt: now
        });
      });
    });

    if (rows.length > 0) {
      await queryInterface.bulkInsert("Esfera", rows);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Esfera");
  }
};
