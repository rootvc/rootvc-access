require('dotenv').config();
const express = require('express');
const router = express.Router();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();
const { quickAddJob } = require("graphile-worker");

// Process email entirely asynchrnously to allow large parallelization
router.post('/emails', async (req, res) => {
  const body = req.body;
  const owner = body.owner;

  // Collect data from webhook
  const data = {
    "from": body.from.toLowerCase(),
    "to": body.to.toLowerCase().split(','),
    "cc": body.cc ? body.cc.toLowerCase().split(',') : [],
    "replyTo": body.replyTo ? body.replyTo.toLowerCase() : null,
    "labels": body.labels,
    "date": new Date(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
    "messageId": body.messageId,
  };

  // email address doesn't come from PROMOTIONS tab
  if (data.labels.indexOf('CATEGORY_PROMOTIONS') == -1) {
    enqueueRecordEmailJob(owner, data);
    res.status(200).json({ message: `Enqueued processing of new email for ${owner}: ${data.messageId}` });
  } else {
    res.status(200).json({ message: `Skipping email for ${owner}: ${data.messageId}` });
  }
});

// Enqueue record email job for async processing
const enqueueRecordEmailJob = async (owner, data) => {
  return await quickAddJob(
    { connectionString: process.env['DATABASE_URL'] },
    'recordEmail',
    {
      owner: owner,
      data: data
    },
  );
};

module.exports = router;
