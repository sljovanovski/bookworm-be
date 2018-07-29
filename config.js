var configObject = {
  port: process.env.PORT || 4002,
  database: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    ssl: true
  },
  session: {
    secret: process.env.COOKIE_SECRET || 'cinnamon'
  },
  tokenKey: process.env.TOKEN_KEY || '000'
}

module.exports = configObject;

