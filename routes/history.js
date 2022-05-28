require('dotenv').config();
const express = require('express');
const router = express.Router();
const workerUtils = require('../services/graphileWorker');
const { verifySession } = require("supertokens-node/recipe/session/framework/express");

router.post("/", verifySession({ sessionRequired: true }), async (req) => {
  const body = req.body
  enqueueImportHistoryJob(body.email, null);
});

const enqueueImportHistoryJob = async (owner, pageToken) => {
  const utils = await workerUtils;
  return await utils.addJob(
    'importHistory',
    {
      owner: owner,
      pageToken: pageToken
    },
    { queueName: 'main' }
  );
}

module.exports = router;
