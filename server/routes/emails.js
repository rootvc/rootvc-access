const express = require('express');
const router = express.Router();
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();

router.post('/emails', async (req, res) => {
  const body = req.body;

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

  const owner = body.owner;
  const participants = [].concat(data.from, data.to, data.cc || [], data.replyTo || []);
  const isFromOwner = data.from === owner;
  const messageExists = await prisma.Message.findUnique({
    where: { messageId: data.messageId }
  }).then(res => res !== null);

  const message = await prisma.Message.upsert({
    where: { messageId: data.messageId },
    update: {},
    create: data
  })
  .then(res => { console.log('Message created: ', res); return res });
  
  participants.filter(p => p != owner).forEach(async (p) => {
    await prisma.Connection.findFirst({
      where: { owner: owner, contact: p }
    })
    .then(res => { res ? console.log('Connection found: ', res) : console.log('Connection not found'); return res; });

    var updateData = { toAndFromOwner: { increment: 1 } };
    updateData[isFromOwner ? 'fromOwner' : 'toOwner'] = { increment: 1 };

    prisma.Connection.upsert({
      where: {
        owner_contact: { owner: owner, contact: p },
      },
      update: messageExists ? {} : updateData,
      create: {
        owner: owner,
        contact: p,
        toOwner: isFromOwner ? 0 : 1,
        fromOwner: isFromOwner ? 1 : 0,
        toAndFromOwner: 1,
      },
    })
    .then(res => { console.log('Connection upserted: ', res) });

    // TODO: Insert Person
    // TODO: Enrich Person
    // TODO: Insert Company
  })

  res.status(200).json({ message: `Recorded email: ${message.messageId}` });

});

module.exports = router;
