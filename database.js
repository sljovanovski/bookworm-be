config = require('./config');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const hash = Promise.promisify(bcrypt.hash);

var knex = require('knex')({
  client: 'pg',
  connection: config.database,
  pool: {
    min: 0,
    max: 7
  }
})

module.exports = knex;
