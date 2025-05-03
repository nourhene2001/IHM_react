const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true, // Matches database schema
    },
    isRead: {
      type: DataTypes.TINYINT, // Matches tinyint(1) in database
      defaultValue: 0, // Matches database default
      allowNull: false,
    }
  }, {
    tableName: 'Messages', // Verify exact table name
    timestamps: true, // createdAt and updatedAt
    createdAt: 'createdAt', // Ensure field names match
    updatedAt: 'updatedAt',
    // Add this if you need to handle the BOOLEAN conversion:
    getterMethods: {
      isRead() {
        return this.getDataValue('isRead') === 1;
      }
    },
    setterMethods: {
      isRead(value) {
        this.setDataValue('isRead', value ? 1 : 0);
      }
    }
  });

  return Message;
};