const worker = require('../../../../services/graphileWorker');
const SuperTokensNode = require('supertokens-node');
const { backendConfig } = require('../../../../config/backendConfig');
import { withSentry } from '@sentry/nextjs';


// Process email entirely asynchronously to allow large parallelization
const handler = async (req, res) => {
  const body = req.body;

  SuperTokensNode.init(backendConfig());

  // Collect data from webhook
  const data = {
    "owner": body.owner,
    "from": body.from.toLowerCase(),
    "to": body.to ? body.to.toLowerCase().split(",") : null,
    "cc": body.cc ? body.cc.toLowerCase().split(",") : [],
    "replyTo": body.replyTo ? body.replyTo.toLowerCase() : null,
    "labels": body.labels,
    "date": new Date(body.date),
    "threadId": body.threadId,
    "historyId": body.historyId,
    "messageId": body.messageId
  };

  // email address doesn't come from PROMOTIONS tab
  if (data.labels.indexOf('CATEGORY_PROMOTIONS') == -1) {
    enqueueRecordEmailJob(data);
    res.statusCode = 200;
    res.status(200).json({ message: `Enqueued processing of new email for ${data.owner}: ${data.messageId}` });
  } else {
    res.statusCode = 200;
    res.status(200).json({ message: `Skipping email for ${data.owner}: ${data.messageId}` });
  }
};

// Enqueue record email job for async processing
const enqueueRecordEmailJob = async (data) => {
  const utils = await worker;

  return await utils.addJob(
    'recordEmail',
    data
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
