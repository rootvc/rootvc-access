require('dotenv').config();
const express = require('express');
const router = express.Router();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();
const { quickAddJob } = require("graphile-worker");

// Extract to some constant
const BLOCKLIST = [
  /notifications.*@/,
  /subscribe.*@/,
  /unsubscribe.*@/,
  /.*no-?reply.*@/,
  /info@.*/,
  /events@.*/,
  /team@.*/,
  /founders@.*/,
  /mailer-deamon@.*/,
  /promo@.*/,
  /do-?not-?reply@.*/,
  /newsletter.*@/,
  /investors.*@/,
  /support.*@/,
  /comments.*@/,
  /@.*unsubscribe.*/,
  /orders@.*/,
  /contact@.*/,
  /accounts?@.*/,
  /reminders?@.*/,
  /reply.*@/,
];

router.post('/emails', async (req, res) => {
  const body = req.body;
  const owner = body.owner;

  // Collect data from webhook
  const data = {
    "from": body.from.toLowerCase(),
    "to": body.to.toLowerCase().split(','),
    "cc": body.cc ? body.cc.toLowerCase().split(',') : [],
    "replyTo": body.replyTo ? body.replyTo.toLowerCase() : null,
    "labels": body.labels ? body.labels.split(',') : [],
    "date": new Date(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
    "messageId": body.messageId,
  };

  // email address doesn't come from PROMOTIONS tab
  if (data.labels.indexOf('CATEGORY_PROMOTIONS') == -1) {
    const participants = [].concat(data.from, data.to, data.cc, data.replyTo);

    participants
    .filter(p => p && p != owner)
    .filter(p => !BLOCKLIST.some(re => re.test(p))) // email address doesn't come from a blocklist (e.g. no-reply@domain.com)
    .forEach(async (contact) => {
      upsertConnection(data, owner, contact);
      upsertPerson(contact);
      enqueueEnrichmentJob(contact);
    });
    upsertMessage(data);

    res.status(200).json({ message: `Processed new email: ${data.messageId}` });
  } else {
    res.status(200).json({ message: `Skipping email: ${data.messageId}` });
  }
});

// Get message by messageId
const getMessage = async (messageId) => {
  return await prisma.Message.findUnique({
    where: { messageId: messageId }
  });
};

// Create message, only if new messageId
const upsertMessage = async (data) => {
  return await prisma.Message.upsert({
    where: { messageId: data.messageId },
    update: {},
    create: data
  })
  .then(res => { console.log('Message: ', res.messageId) });
};

// Create connection pair if doesn't exist, otherwise increment appropriate count
const upsertConnection = async (data, owner, contact) => {
  const isFromOwner = data.from === owner;
  const isExistingMessage = await getMessage(data.messageId) !== null;
  
  var updateData = { toAndFromOwner: { increment: 1 } };
  updateData[isFromOwner ? 'fromOwner' : 'toOwner'] = { increment: 1 };

  return prisma.Connection.upsert({
    where: {
      owner_contact: { owner: owner, contact: contact },
    },
    update: isExistingMessage ? {} : updateData,
    create: {
      owner: owner,
      contact: contact,
      toOwner: isFromOwner ? 0 : 1,
      fromOwner: isFromOwner ? 1 : 0,
      toAndFromOwner: 1,
    },
  })
  .then(res => { console.log('Connection: ', res.owner, '|', res.contact) });
}

// Create person, only if new email
const upsertPerson = async (p) => {
  return await prisma.Person.upsert({
    where: { email: p },
    update: {},
    create: { email: p },
  })
  .then(res => { console.log('Person: ', res.email) });
};

// Enqueue enrichment job for async processing
const enqueueEnrichmentJob = async (email) => {
  return await quickAddJob(
    { connectionString: process.env['DATABASE_URL'] },
    'clearbitEnrichment',
    { email: email },
  );
};

module.exports = router;
