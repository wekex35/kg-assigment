const fs = require('fs');

// Function to generate random data for a city
const generateDataForCity = (city) => {
  const data = [];
  for (let i = 0; i < 5000000; i++) {
    const temperature = Math.random() * 100; // Adjust range as needed
    data.push(`${city};${temperature}`);
  }
  return data;
};

// Function to write data to CSV
const writeDataToCSV = (filePath, data) => {
//   fs.writeFileSync(filePath, 'city;temp\n'); // Write CSV header
  fs.appendFileSync(filePath, "\n"+ data.join('\n')); // Append data
};

// Generate and write data for 10 cities
const generateAndWriteCSV = () => {
  const cities = ['City1', 'City2', 'City3', 'City4', 'City5', 'City6', 'City7', 'City8', 'City9', 'City10'];
  const allData = [];

  for (const city of cities) {
    const data = generateDataForCity(city);
    writeDataToCSV('temperature_data.csv', data);
  }

//   writeDataToCSV('temperature_data.csv', allData);
  console.log('CSV file generated successfully.');
};

// Uncomment the line below to generate and write CSV data
generateAndWriteCSV();
