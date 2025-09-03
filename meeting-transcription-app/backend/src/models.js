import { Sequelize, DataTypes } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'sqlite::memory:';

export const sequelize = new Sequelize(databaseUrl, {
  logging: false,
});

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

export const Meeting = sequelize.define('Meeting', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
});

export const Transcription = sequelize.define('Transcription', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  language: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER },
});

User.hasMany(Meeting, { foreignKey: 'userId' });
Meeting.belongsTo(User, { foreignKey: 'userId' });
Meeting.hasOne(Transcription, { foreignKey: 'meetingId' });
Transcription.belongsTo(Meeting, { foreignKey: 'meetingId' });

export async function syncDatabase() {
  await sequelize.sync();
}

