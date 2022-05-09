require('dotenv').config();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();
var clearbit = require('clearbit')(process.env['CLEARBIT_API_KEY']);
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

module.exports = async (payload, helpers) => {
    const { owner, data } = payload;
    helpers.logger.info('Running record emails job');
    helpers.logger.info(`Recording Email: ${data.messageId}`);
    const participants = [].concat(data.from, data.to, data.cc, data.replyTo);
    
    participants
    .filter(p => p && p != owner)
    .filter(p => !BLOCKLIST.some(re => re.test(p))) // email address doesn't come from a blocklist (e.g. no-reply@domain.com)
    .forEach(async (contact) => {
      upsertConnection(data, owner, contact, helpers);
      upsertPerson(contact, helpers);
      enqueueEnrichmentJob(contact, helpers); // async job
    });
    upsertMessage(data, helpers);
};

// Get message by messageId
const getMessage = async (messageId) => {
  return await prisma.Message.findUnique({
    where: { messageId: messageId }
  });
};

// Create message, only if new messageId
const upsertMessage = async (data, helpers) => {
  return await prisma.Message.upsert({
    where: { messageId: data.messageId },
    update: {},
    create: data
  })
  .catch(res => {
    helpers.logger.error(`Error upserting Message: ${res.messageId}`);
  })
  .then(res => {
    helpers.logger.info(`Recorded Message: ${res.messageId}`);
  });
};

// Create connection pair if doesn't exist, otherwise increment appropriate count
const upsertConnection = async (data, owner, contact, helpers) => {
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
  .catch(res => {
    helpers.logger.error(`Error upserting Connection: ${res.email}`);
  })
  .then(res => {
    helpers.logger.info(`Recorded Connection: ${res.owner} | ${res.contact}`);
  });
}

// Create person, only if new email
const upsertPerson = async (p, helpers) => {
  return await prisma.Person.upsert({
    where: { email: p },
    update: {},
    create: { email: p },
  })
  .catch(res => {
    helpers.logger.error(`Error upserting Person: ${res.email}`);
  })
  .then(res => {
    helpers.logger.info(`Recorded Person: ${res.email}`);
  });
};

// Enqueue enrichment job for async processing
const enqueueEnrichmentJob = async (email) => {
  return await quickAddJob(
    { connectionString: process.env['DATABASE_URL'] },
    'clearbitEnrichment',
    { email: email },
  );
};
