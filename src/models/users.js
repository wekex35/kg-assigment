const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PG_DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});


class Users extends Sequelize.Model {}
Users.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    age: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    address: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    additional_info: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'users'
  }
);


module.exports = {
  sequelize,
  Users,
};


