module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("GedFiles", "extractedText", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Texto extraído do arquivo para busca"
    });

    await queryInterface.addColumn("GedFiles", "textExtractedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Data da última extração de texto"
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("GedFiles", "extractedText");
    await queryInterface.removeColumn("GedFiles", "textExtractedAt");
  }
};
