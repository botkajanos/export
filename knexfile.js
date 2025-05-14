module.exports = {
  development: {
    
    client: 'pg',
    connection: 'postgres://exporter_app:mysecret@127.0.0.1:5432/exporter_db',
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' }
    
  },

  production: {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }          //  ← required on Render
  },
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' },
  pool: { min: 2, max: 10 }
}

};
