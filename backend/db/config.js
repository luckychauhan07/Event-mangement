const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({
	path: path.resolve(__dirname, "../.env"),
});

console.log("[DB Config] DATABASE_URL exists:", !!process.env.DATABASE_URL);

const isProduction = process.env.NODE_ENV === "production";

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
	user: dbUrl.username,
	password: dbUrl.password,
	database: dbUrl.pathname.slice(1),
	port: dbUrl.port,
	host: dbUrl.hostname,
	family: false,
	ssl: {
		rejectUnauthorized: isProduction,
	},
});

module.exports = pool;
