require('dotenv').config();

const main = require('./utils/main');
const { sequelize } = require('./models/temperature');
const calculateMeanMaxMedia = require('./utils/temp-dist');


async function app() {

    try {
        await sequelize.sync({ force: true });
        await main();
        await calculateMeanMaxMedia()
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close(); 
    }
        
 
}

app();
