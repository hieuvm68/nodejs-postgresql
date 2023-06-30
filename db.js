const Pool = require("pg").Pool;
require("dotenv").config();
const pool = new Pool({
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  host: process.env.DBHOST,
  port: 5432,

  database: process.env.DATABASE,
});
module.exports = pool;
