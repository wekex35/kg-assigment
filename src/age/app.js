require('dotenv').config();
const { sequelize } = require('./models/users');
const main = require('./utils/main');
const calculateAgeDistribution = require('./utils/age-distribution');

async function app() {
    try {

        // recreating the table in order avoid load
        await sequelize.sync({ force: true });
        console.log('Models synchronized with database.');

        await main();

        // Calculate and print age distribution
        await calculateAgeDistribution();
    } catch (error) {
        console.log('An error occurred:');
    } finally {
        await sequelize.close(); // Close the Sequelize connection
    }
}

app();
