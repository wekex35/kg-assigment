require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readLine = require('readline');
const { Users, sequelize } = require('./models/users');
const EventEmitter = require('events');
const databaseEmitter = new EventEmitter();


function printProgress(progress) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("File read progress " + (progress * 100).toFixed(0) + '% ');
}


function generateNestedObject(obj) {

    const nestedObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const parts = key.split('.');
            let currentLevel = nestedObject;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                if (i === parts.length - 1) {
                    currentLevel[part] = obj[key];
                }
                currentLevel = currentLevel[part];
            }
        }
    }
    return nestedObject;
}

async function init() {
    // read file path from .env file
    const csvFilePath = process.env.CSV_FILE_PATH;

    // check if file path is specified in .env file
    if (!csvFilePath) {
        console.error('CSV_FILE_PATH not specified in .env file.');
        process.exit(1);
    }

    // check if file exists
    if (!fs.existsSync(csvFilePath)) {
        console.error(`File not found: ${csvFilePath}`);
        process.exit(1);
    }

    console.info('\n\nReading CSV file from:', csvFilePath);

    // read file as stream from the csv file
    const jsonArray = [];
    const createArray = []
    const transaction = await sequelize.transaction();


    await new Promise(async (resolve, reject) => {
        try {
            let batchCount = 0;
            let isReadingFinished = false;
            // Create an event for processing each batch of records
            databaseEmitter.on('processBatch', async (records, transaction) => {
                try {
                    await Users.bulkCreate(records, { transaction });

                    if (--batchCount <= 0 && isReadingFinished) {
                        // Commit the transaction if everything is successful
                        await transaction.commit();
                        resolve();
                    }
                } catch (error) {
                    await transaction.rollback();
                    // throw error;
                }
            });


            const batchSize = 10000; // Set the batch size according to your needs


            const stats = fs.statSync(csvFilePath);
            const fileSizeInBytes = stats.size;
            const readStream = fs.createReadStream(csvFilePath);

            const rl = readLine.createInterface({
                input: readStream,
                crlfDelay: Infinity,
            });

            let headers = null;

            rl.on('line', async (line) => {
                const row = line.split(',');
                printProgress(readStream.bytesRead / fileSizeInBytes);

                if (!headers) {
                    headers = row;

                    if (headers[0] !== "name.firstName" || headers[1] !== "name.lastName" || headers[2] !== "age") {
                        await transaction.rollback();
                        reject("Invalid headers in the CSV file.");
                    }
                } else {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });

                    const nestedObject = generateNestedObject(obj);

                    const { name, age, address, ...additional_info } = nestedObject;

                    if (!name || !name.firstName || !name.lastName || !age) {
                        await transaction.rollback();
                        throw new Error('Required data is missing in the file');
                    }

                    const finalJsonObject = {
                        name: `${name.firstName} ${name.lastName}`,
                        age: Number(age),
                        address,
                        additional_info,
                    };

                    createArray.push(finalJsonObject);

                    if (createArray.length >= batchSize) {
                        // Emit the 'processBatch' event with the batch details
                        ++batchCount
                        databaseEmitter.emit('processBatch', [...createArray], transaction);
                        createArray.length = 0; // Clear the array
                    }
                }
            });

            rl.on('close', async () => {
                if (createArray.length > 0) {
                    ++batchCount
                    databaseEmitter.emit('processBatch', [...createArray], transaction);
                }
                isReadingFinished = true;
            });

            readStream.on('error', async (error) => {
                console.log('Error reading CSV file:', error);
                throw error;
            });
        } catch (error) {
            console.error('An error occurred:', error);
            await transaction.rollback();
            reject(error);
            throw error;
        }
    })

    return jsonArray;

}

async function calculateAgeDistribution() {
  
    const ageGroups = await Users.findAll({
        attributes: [
          [sequelize.literal(`CASE WHEN age < 20 THEN '< 20' WHEN age BETWEEN 20 AND 40 THEN '20 to 40' WHEN age BETWEEN 41 AND 60 THEN '40 to 60' ELSE '> 60' END`), 'ageGroup'],
          [sequelize.fn('COUNT', sequelize.literal('*')), 'count']
        ],
        group: ['ageGroup'],
        raw: true,
      });

      // sum up the total count
      const totalCount = ageGroups.reduce((acc, curr) => acc + Number(curr.count), 0);
      
      const finalAgeGroups = []
      // calculate the percentage of each age group
      ageGroups.forEach(group => {
        finalAgeGroups.push({
            "Age-Group": group.ageGroup,
            "% Distribution": Number(((group.count / totalCount) * 100).toFixed(2))
        })
      })
      
      console.table(finalAgeGroups);
}

async function main() {
    try {

        // recreating the table in order avoid load
        await sequelize.sync({ force: true });
        console.log('Models synchronized with database.');

        await init();

        // Calculate and print age distribution
        await calculateAgeDistribution();
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await sequelize.close(); // Close the Sequelize connection
    }
}

main();
