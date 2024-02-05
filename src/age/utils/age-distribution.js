const { sequelize, Users } = require('./config');

// calculateAgeDistribution - calculate and print the age distribution of the users from the database.
async function calculateAgeDistribution() {
  console.log("\nAge Distribution");
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

  console.log(`Total Users: ${totalCount}`);

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

module.exports = calculateAgeDistribution;
