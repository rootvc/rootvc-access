import { superTokensNextWrapper } from 'supertokens-node/nextjs'
const workerUtils = require('../../../services/graphileWorker');
const { verifySession } = require("supertokens-node/recipe/session/framework/express");

const SuperTokensNode = require('supertokens-node');
const { backendConfig } = require('../../../config/backendConfig');

const handler = async (req, res) => {
  const body = req.body

  SuperTokensNode.init(backendConfig());

  await superTokensNextWrapper(
    async (next) => {
      await verifySession()(req, res, next);
    },
    req,
    res
  )

  enqueueImportHistoryJob(body.email, null);

  res.statusCode = 200;
  res.status(200).json({ message: `Enqueued processing of email history for ${body.email}` });
};

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
};

export default handler;
