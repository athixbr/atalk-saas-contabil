module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("GedFiles");

    if (!table.extractedText) {
      await queryInterface.addColumn("GedFiles", "extractedText", {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Texto extraído do arquivo para busca"
      });
    }

    if (!table.textExtractedAt) {
      await queryInterface.addColumn("GedFiles", "textExtractedAt", {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Data da última extração de texto"
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable("GedFiles");

    if (table.extractedText) {
      await queryInterface.removeColumn("GedFiles", "extractedText");
    }

    if (table.textExtractedAt) {
      await queryInterface.removeColumn("GedFiles", "textExtractedAt");
    }
  }
};
