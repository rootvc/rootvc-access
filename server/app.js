require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const heartbeatRouter = require('./routes/heartbeat');
const emailsRouter = require('./routes/emails');
const { run } = require('graphile-worker');
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/heartbeat/', heartbeatRouter);
app.use('/webhooks/', emailsRouter);

// Handle React routing, return all requests to React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/build', req.path));
});

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
    console.error('This should never happen', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = app;
