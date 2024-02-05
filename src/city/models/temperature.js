const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PG_DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});


class Temperature extends Sequelize.Model {}
Temperature.init(
  {
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    temp: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'temperature',
    timestamps: false 
  }
);


module.exports = {
  sequelize,
  Temperature,
};


