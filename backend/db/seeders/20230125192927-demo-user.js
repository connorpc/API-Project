'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    options.tableName = 'Users';
    await queryInterface.bulkInsert(options, [
        {
            email: 'connorgav@twitch.tv',
            username: 'connorgav',
            hashedPassword: bcrypt.hashSync('basedbassword'),
            firstName: 'Connor',
            lastName: 'Phelps'
        },
        {
            email: 'hyperoidyt@gmail.com',
            username: 'hyperoid_yt',
            hashedPassword: bcrypt.hashSync('tinkatinkatontheg0at'),
            firstName: 'Hyper',
            lastName: 'Roid'
        },
        {
            email: 'bighugehotdog@yahoo.com',
            username: 'weinerwizard1',
            hashedPassword: bcrypt.hashSync('leG04T!'),
        },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Users";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
        username: { [Op.in]: ['connorgav', 'hyperoid_yt', 'weinerwizard1'] }
    }, {});
  }
};
