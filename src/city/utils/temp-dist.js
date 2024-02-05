const { fs } = require("../../age/utils/config");
const { Temperature, sequelize } = require("../models/temperature");


// calculateMeanMax - 
async function calculateMeanMaxMedia() {
  console.log("\nCalculating Mean Max Media");

  const rawQuery = `
  select 
  city,
   count(1),
   sum("temp")/count(1) as mean,
   max("temp"),
   PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY temp) AS median_temperature
  from temperatures t 
  group by city
 order by city 
 
`;

  // Execute the raw query
  const result = await sequelize.query(rawQuery, {
    type: sequelize.QueryTypes.SELECT,
    model: Temperature,
    raw: true,
  });

  fs.createWriteStream("./temp-dist.csv").write(JSON.stringify(result));
}

module.exports = calculateMeanMaxMedia;
