module.exports = {

  //Node ENV
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Port to run at
  PORT: process.env.PORT || 8080,

  // DB ENV's
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB,
  DIALECT: process.env.DIALECT,

  // App Secret Key
  SECRET_KEY: process.env.SECRET_KEY,

  // Allowed Origins
  ORIGIN: process.env.ORIGIN,

  // Staff Password
  DEFAULT_STAFF_PASSWORD: process.env.DEFAULT_STAFF_PASSWORD,

  // OTPs
  AUTHKEY: process.env.AUTHKEY,
  TEMPLATEID: process.env.TEMPLATEID,

  // Email SMTP
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

  // Azure Storage
  STORAGE_ACCOUNT_SURVEYS: process.env.STORAGE_ACCOUNT_SURVEYS,
  STORAGE_ACCOUNT_CONNECTION: process.env.STORAGE_ACCOUNT_CONNECTION,

  // Agenda - Mongo Connection String
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,

  // Notifications Timings
  NOTIFICATIONS_HOUR: process.env.NOTIFICATIONS_HOUR,
  NOTIFICATIONS_MINUTES: process.env.NOTIFICATIONS_MINUTES,
  
  //Inputs API Integration
  INPUTS_API_URL: process.env.INPUTS_API_URL,
  INPUTS_API_AUTH_KEY: process.env.INPUTS_API_AUTH_KEY,

};
