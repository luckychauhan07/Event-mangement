const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({
	path: path.resolve(__dirname, "../.env"),
});

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
	user: dbUrl.username,
	password: dbUrl.password,
	database: dbUrl.pathname.slice(1),
	port: dbUrl.port,
	host: dbUrl.hostname,
	family: false,
	ssl: {
		rejectUnauthorized: false,
	},
});

module.exports = pool;
