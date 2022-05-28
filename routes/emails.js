require('dotenv').config();
const express = require('express');
const router = express.Router();
const workerUtils = require('../services/graphileWorker');

// Process email entirely asynchrnously to allow large parallelization
router.post('/', async (req, res) => {
  const body = req.body;

  // Collect data from webhook
  const data = {
    "owner": body.owner,
    "from": body.from.toLowerCase(),
    "to": body.to ? body.to.toLowerCase().split(",") : null,
    "cc": body.cc ? body.cc.toLowerCase().split(",") : [],
    "replyTo": body.replyTo ? body.replyTo.toLowerCase() : null,
    "labels": body.labels,
    "date": new Date(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
    "messageId": body.messageId
  };

  // email address doesn't come from PROMOTIONS tab
  if (data.labels.indexOf('CATEGORY_PROMOTIONS') == -1) {
    enqueueRecordEmailJob(data);
    res.status(200).json({ message: `Enqueued processing of new email for ${data.owner}: ${data.messageId}` });
  } else {
    res.status(200).json({ message: `Skipping email for ${data.owner}: ${data.messageId}` });
  }
});

// Enqueue record email job for async processing
const enqueueRecordEmailJob = async (data) => {
  const utils = await workerUtils;
  return await utils.addJob(
    'recordEmail',
    data,
    { queueName: 'main' }
  );
};

module.exports = router;
