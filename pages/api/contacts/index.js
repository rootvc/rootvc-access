import { withSentry } from '@sentry/nextjs';
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
const { verifySession } = require("supertokens-node/recipe/session/framework/express");
const SuperTokensNode = require('supertokens-node');
const { backendConfig } = require('../../../config/backendConfig');
const prisma = require('../../../services/prisma');

const handler = async (req, res) => {
  SuperTokensNode.init(backendConfig());

  await superTokensNextWrapper(
    async (next) => {
      await verifySession()(req, res, next);
    },
    req,
    res
  )

  let userId = req.session.getUserId();

  const user = await prisma.User.findUnique({
    where: { superTokensId: userId }
  });

  const connections = await prisma.Connection.findMany({
    where: { owner: user.email },
    orderBy: {
      toAndFromOwner: 'desc'
    }
  });

  res.statusCode = 200;
  res.status(200).json(connections);
};

// horrible hack to get around a sentry + next bug
// https://github.com/getsentry/sentry-javascript/issues/3852
export const config = {
  api: {
    externalResolver: true,
  },
};

export default withSentry(handler);
