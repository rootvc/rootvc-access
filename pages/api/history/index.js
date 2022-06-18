import { withSentry } from '@sentry/nextjs';
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
const { verifySession } = require("supertokens-node/recipe/session/framework/express");
const SuperTokensNode = require('supertokens-node');
const { backendConfig } = require('../../../config/backendConfig');
const prisma = require('../../../services/prisma');
const worker = require('../../../services/graphileWorker');

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

  const user = await prisma.User.findUnique({
    where: { superTokensId: body.superTokensId }
  });

  enqueueImportHistoryJob(user.email, null);

  res.statusCode = 200;
  res.status(200).json({ message: `Enqueued processing of email history for ${body.superTokensId}: ${user.email}` });
};

const enqueueImportHistoryJob = async (owner, pageToken) => {
  const utils = await worker;

  return await utils.addJob(
    'importHistory',
    {
      owner: owner,
      pageToken: pageToken
    }
  );
};

// horrible hack to get around a sentry + next bug
// https://github.com/getsentry/sentry-javascript/issues/3852
export const config = {
  api: {
    externalResolver: true,
  },
};

export default withSentry(handler);
