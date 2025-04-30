const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message, err.stack);
    process.exit(1);
  });

const User = require('./User')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);
const Message = require('./message')(sequelize);
const Notification = require('./notification')(sequelize);

// Define relationships
User.hasMany(Job, { foreignKey: 'recruiterId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Application.hasMany(Message, { foreignKey: 'applicationId', as: 'messages' });
Message.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Application.hasMany(Notification, { foreignKey: 'applicationId', as: 'notifications' });
Notification.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Job.hasMany(Notification, { foreignKey: 'jobId', as: 'notifications' });
Notification.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = {
  sequelize,
  models: { User, Job, Application, Message, Notification },
};