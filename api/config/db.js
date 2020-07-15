module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
    dialectOptions: {
      options: {
        encrypt: true,
      }
    },
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
    dialectOptions: {
      options: {
        encrypt: true,
      }
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
    dialectOptions: {
      options: {
        encrypt: true,
      }
    },
  },
}
