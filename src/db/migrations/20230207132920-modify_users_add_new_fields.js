'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'token', // new field name
        {
          type: Sequelize.STRING(700),
          allowNull: true,
        },
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
   
    return Promise.all([
      queryInterface.removeColumn('Users', 'token'),
    ]);
  }
};
