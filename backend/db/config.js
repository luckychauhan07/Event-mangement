const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("[DB Config] DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("[DB Config] Attempting to use DATABASE_URL:", process.env.DATABASE_URL);

const isProduction = process.env.NODE_ENV === "production";

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    port: dbUrl.port,
    // Explicitly set host and disable family detection to prefer IPv4.
    // This can resolve 'getaddrinfo ENOTFOUND' errors on some systems.
    host: dbUrl.hostname, 
    family: false,
    // The pg driver defaults to a secure SSL connection if the server requires it.
    // Supabase connection strings are configured for this automatically.
    // For Supabase, SSL is always required.
    ssl: {
        // In production, reject unauthorized certificates for security. In development, allow for flexibility.
        rejectUnauthorized: isProduction
    },
});

pool.connect()
    .then(client => {
        console.log("✅ Database Connected Successfully");
        client.release();
    })
    .catch(err => {
        console.error("❌ Database Connection Error");
        console.error(err);
    });

module.exports = pool;