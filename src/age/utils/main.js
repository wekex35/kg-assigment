const { fs, sequelize, databaseEmitter, readLine, Users, path } = require('./config');
const {printProgress, printDataProgress} = require('./progress');
const generateNestedObject = require('./nested-object');


/**
 *  main - this function will read the file content and convert it to the json 
 * and it will insert data into the database
 */
async function main() {
    // read file path from .env file
    let csvFilePath = process.env.CSV_FILE_PATH;

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

    console.info('\nReading CSV file from:', csvFilePath);


    const createArray = []
    const transaction = await sequelize.transaction();


    await new Promise(async (resolve, reject) => {
        try {
            let batchCount = 0;
            let isReadingFinished = false;

            // custom event emitter for processing each batch of records
            databaseEmitter.on('processBatch', async (records, transaction) => {
                try {
                    await Users.bulkCreate(records, { transaction });

                    if (--batchCount <= 0 && isReadingFinished) {
                        // Commit the transaction if everything is successful
                        await transaction.commit();
                        resolve();
                    }
                    if (isReadingFinished){
                        printDataProgress(batchCount);
                    }
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            });


            // define batch size
            const batchSize = 5000;

            // read file stats and set size
            const stats = fs.statSync(csvFilePath);
            const fileSizeInBytes = stats.size;

            // create file stream
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
                        throw new Error('Invalid headers in the CSV file.');
                    }
                } else {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });

                    // generate nested object from the csv object
                    const nestedObject = generateNestedObject(obj);

                    const { name, age, address, ...additional_info } = nestedObject;

                    if (!name || !name.firstName || !name.lastName || !age) {
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
                console.error('Error reading CSV file:', error);
                throw error;
            });
        } catch (error) {
            console.error('An error occurred:', error);
            await transaction.rollback();
            reject(error);
            throw error;
        }
    })

    console.log('\n\nData inserted successfully.');
}

module.exports = main;
