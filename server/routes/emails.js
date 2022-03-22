const express = require('express');
const router = express.Router();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();

router.post('/emails', async (req, res) => {
  const body = req.body;

  // Collect data from webhook
  const data = {
    "from": body.from,
    "to": body.to,
    "cc": body.cc,
    "replyTo": body.replyTo,
    "labels": body.labels,
    "date": new Date(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
    "messageId": body.messageId,
  };

  _createMessage(data);
  
  const owner = body.owner;
  const participants = [].concat(data.from, data.to, data.cc || [], data.replyTo || []);

  participants.filter(p => p != owner).forEach(async (contact) => {
    _createConnection(data, owner, contact);
    _createPerson(contact);
    // _enrich(contact);
    // TODO: Enrich Person
    // TODO: Insert Company
  })

  res.status(200).json({ message: `Processed new email: ${data.messageId}` });
});

const _createMessage = async (data) => { // Create message, only if new messageId
  await prisma.Message.upsert({
    where: { messageId: data.messageId },
    update: {},
    create: data
  })
  .then(res => { console.log('Message created: ', res) });
};

const _createConnection = async (data, owner, contact) => { // Create connection pair if doesn't exist, otherwise increment appropriate count
  const isFromOwner = data.from === owner;

  const existingMessage = await prisma.Message.findUnique({
    where: { messageId: data.messageId }
  }).then(res => res !== null);
  
  var updateData = { toAndFromOwner: { increment: 1 } };
    updateData[isFromOwner ? 'fromOwner' : 'toOwner'] = { increment: 1 };

    prisma.Connection.upsert({
      where: {
        owner_contact: { owner: owner, contact: contact },
      },
      update: existingMessage === null ? {} : updateData,
      create: {
        owner: owner,
        contact: contact,
        toOwner: isFromOwner ? 0 : 1,
        fromOwner: isFromOwner ? 1 : 0,
        toAndFromOwner: 1,
      },
    })
    .then(res => { console.log('Connection created/updated: ', res) });
}

const _createPerson = async (p) => { // Create person, only if new email
  await prisma.Person.upsert({
    where: { email: p },
    update: {},
    create: { email: p },
  })
  .then(res => { console.log('Person created: ', res) });
};

module.exports = router;
