const { Pool } = require('pg');

const db = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = db;

// A pool keeps multiple connections open and hands them out as needed
// much better for a web app where many requests can come in at the same time.
// Once exported, you import pool in any route file and query.
// pool -> Pool and { Pool } is important
