module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://exporter_app:mysecret@127.0.0.1:5432/exporter_db',
    migrations: { directory: './migrations' }
  },

  production: {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }          //  ← required on Render
  },
  migrations: { directory: './migrations' },
  pool: { min: 2, max: 10 }
}

};
