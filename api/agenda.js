const Agenda = require('agenda');

const config = require("./config");

const connectionString = config.MONGO_CONNECTION_STRING;

const agenda = new Agenda({
  db: { address: connectionString, collection: 'jobs' },
  processEvery: '30 seconds'
});

module.exports = {
  agenda,
}
