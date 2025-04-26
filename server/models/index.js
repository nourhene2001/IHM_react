const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
  }
);

const User = require('./User')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);

// Define relationships
User.hasMany(Job, { foreignKey: 'recruiterId' });
Job.belongsTo(User, { foreignKey: 'recruiterId' });

User.hasMany(Application, { foreignKey: 'candidateId' });
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(User, { foreignKey: 'candidateId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

module.exports = sequelize;
