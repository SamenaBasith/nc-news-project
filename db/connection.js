const { Pool } = require("pg");
const path = require("path");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(`${__dirname}/../.env.${ENV}`),
});

const config = {};
if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE not set or DATABASE_URL not set");
}

module.exports = new Pool(config);
