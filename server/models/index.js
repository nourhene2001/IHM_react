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
User.hasMany(Job, { foreignKey: 'recruiterId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = {
  sequelize,
  models: { User, Job, Application },
};
