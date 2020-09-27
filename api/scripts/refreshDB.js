require('dotenv').config();

const db = require("../models");

const load = async () => {
  await db.sequelize.dropAllSchemas();
  console.log("Deleted All tables");
  // Does not support MSSQL, for MSSQL run the following
  // DECLARE @sql NVARCHAR(max)=''

  // SELECT @sql += ' Drop table ' + QUOTENAME(TABLE_SCHEMA) + '.'+ QUOTENAME(TABLE_NAME) + '; '
  // FROM   INFORMATION_SCHEMA.TABLES
  // WHERE  TABLE_TYPE = 'BASE TABLE'

  // Exec Sp_executesql @sql
}

(() => {
  load();
})();
