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

};
