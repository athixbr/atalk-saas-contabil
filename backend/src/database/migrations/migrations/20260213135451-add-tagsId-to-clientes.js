'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Clientes', 'tagsId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TagsParametros',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Clientes', 'tagsId');
  }
};
