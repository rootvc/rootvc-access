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
    "date": parseDate(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
  };

  await prisma.Message.create({ data: data });
  console.debug(data);

  res.status(200).json({ message: 'Created record.' });

  // do clearbit as async call
});

const parseDate = (str) => {
  return new Date(str)
}

module.exports = router;
