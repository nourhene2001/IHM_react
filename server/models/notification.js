const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING(255), // Explicit length to match varchar(255)
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'isRead' // Explicit field mapping if needed
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false, // Changed to false to enforce a value
      defaultValue: DataTypes.NOW, // Set default to current timestamp
      field: 'createdAt' // Explicit field mapping
    }
  }, {
    tableName: 'Notifications', // Ensure this exactly matches your table name
    timestamps: false, // Disable automatic timestamps since we're managing createdAt manually
    underscored: false // Set to true if your database uses snake_case
  });

  return Notification;
};