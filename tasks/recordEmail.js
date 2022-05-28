require('dotenv').config();
const prisma = require('../services/prisma');
const workerUtils = require('../services/graphileWorker');

// TODO: Enqueue child jobs selectively

// TODO: Extract to some constant
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
  /billing.*@/,
];

module.exports = async (data, helpers) => {
  helpers.logger.info(`Recording Email: ${data.messageId}`);
  const participants = [].concat(data.from, data.to, data.cc, data.replyTo);

  // Why does this ever happen? I don't know, but this fixes it
  if (data.to == null) {
    helpers.logger.error(`The 'To' field is null in ${data.messageId}. Debug: ${JSON.stringify(data)}`);
  }

  // temp fix
  data.cc = data.cc ? data.cc : [];

  participants
    .filter(p => p && p != data.owner)
    .filter(p => !BLOCKLIST.some(re => re.test(p))) // email address doesn't come from a blocklist (e.g. no-reply@domain.com)
    .forEach(async (contact) => {
      upsertConnection(data, contact, helpers);
      upsertPerson(contact, helpers);
      enqueueEnrichmentJob(contact, helpers);
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
  try {
    await prisma.Message.upsert({
      where: { messageId: data.messageId },
      update: {},
      create: data
    });
    helpers.logger.info(`Recorded Message: ${data.messageId}`);
  } catch (error) {
    helpers.logger.error(`Error upserting Message: ${data.messageId}`);
    helpers.logger.error(error);
  }
};

// Create connection pair if doesn't exist, otherwise increment appropriate count
const upsertConnection = async (data, contact, helpers) => {
  const isFromOwner = data.from === data.owner;
  const isExistingMessage = await getMessage(data.messageId) !== null;

  let updateData = { toAndFromOwner: { increment: 1 } };
  updateData[isFromOwner ? 'fromOwner' : 'toOwner'] = { increment: 1 };

  try {
    await prisma.Connection.upsert({
      where: {
        owner_contact: {
          owner: data.owner,
          contact: contact
        },
      },
      update: isExistingMessage ? {} : updateData,
      create: {
        owner: data.owner,
        contact: contact,
        toOwner: isFromOwner ? 0 : 1,
        fromOwner: isFromOwner ? 1 : 0,
        toAndFromOwner: 1,
      },
    });
    helpers.logger.info(`Recorded Connection: ${data.owner} | ${contact}`);
  } catch (error) {
    helpers.logger.error(`Error upserting Connection: ${data.owner} | ${contact}`);
    helpers.logger.error(error);
  }
}

// Create person, only if new email
const upsertPerson = async (p, helpers) => {
  try {
    await prisma.Person.upsert({
      where: { email: p },
      update: {},
      create: { email: p },
    });
    helpers.logger.info(`Recorded Person: ${p}`);
  } catch (error) {
    helpers.logger.error(`Error upserting Person: ${p}`);
    helpers.logger.error(error);
  }
};

// Enqueue enrichment job for async processing
const enqueueEnrichmentJob = async (email) => {
  const utils = await workerUtils;
  return await utils.addJob(
    'clearbitEnrichment',
    { email: email },
    { queueName: 'main' }
  );
};
