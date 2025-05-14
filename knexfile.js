module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://exporter_app:mysecret@127.0.0.1:5432/exporter_db',
    migrations: { directory: './migrations' }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './migrations' }
  }
};
