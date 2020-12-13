var winston = require('winston');
require('winston-daily-rotate-file');

var transport = new winston.transports.DailyRotateFile({
  filename: `${process.env.LOG_PATH || './logs'}/api-application-%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.LOG_LEVEL
});

transport.on('rotate', function(oldFilename, newFilename) {
  // do something fun
});

var logger = winston.createLogger({
  transports: [
    transport
  ]
});

module.exports = logger;
