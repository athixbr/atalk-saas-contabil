require("dotenv").config();

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: process.env.DB_TIMEZONE || "-03:00",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "atalk",
  username: process.env.DB_USER || "atalk",
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG === "true"
};
