require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const indexRouter = require('./routes/index');
const emailsRouter = require('./routes/emails');
const { run } = require('graphile-worker');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/webhooks/', emailsRouter);
app.listen(process.env.PORT || 3000);

async function main() {
  const runner = await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskDirectory: `${__dirname}/../tasks`,
  });

  // If the worker exits (whether through fatal error or otherwise), this
  // promise will resolve/reject:
  await runner.promise;
}

main()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = app;
