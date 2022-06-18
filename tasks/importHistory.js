const Sentry = require("@sentry/nextjs");
const { google } = require('googleapis');
const prisma = require('../services/prisma');
const worker = require('../services/graphileWorker');

// Gmail API rate limits at 10 requests/second.
// This job implements a bootleg rate limiter.
// I am so sorry for how this is implemented.

// TODO: Catch errors correctly like Clearbit not found
// TODO: Only allow one history import job per user

module.exports = async (payload, helpers) => {
  const pageSize = 10;
  const minTimeBetweenGoogleRequests = 100;
  let { owner, pageToken } = payload;

  const user = await prisma.User.findUnique({
    where: { email: owner }
  });
  const accessToken = user.googleAccessToken;

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "/auth/callbacks/google"
  );
  oAuth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  let now = new Date(Date.now());
  let lastGoogleCall = new Date(0);

  const allExistingMessages = await prisma.Message.findMany({
    where: { owner: owner },
  });

  while (true) {
    now = new Date(Date.now());

    if (now - lastGoogleCall > minTimeBetweenGoogleRequests) {
      try {
        const listResponse = await gmail.users.messages.list({
          includeSpamTrash: false,
          maxResults: pageSize,
          pageToken: pageToken,
          q: "-label:CATEGORY_PROMOTIONS -label:CATEGORY_UPDATES", // filter out spam, newsletters etc.
          userId: "me"
        });
        lastGoogleCall = new Date(Date.now());

        listResponse.data.messages.forEach(async (message) => {
          if (allExistingMessages.map(m => m.id).includes(message.id)) {
            helpers.logger.info(`SKIPPED: Already imported historical message: ${message.id}`);
          } else {
            importHistoryItem(owner, message.id, gmail, helpers);
            lastGoogleCall = new Date(Date.now());
          }
        });

        if (listResponse.data.messages && listResponse.data.messages.length > 0) {
          pageToken = listResponse.data.nextPageToken; // use for next iteration
        } else {
          helpers.logger.info(`DEBUG current pageToken: ${pageToken} seems to have no messages. Why does this happen?`);
        }

        if (!pageToken) {
          helpers.logger.info(`FINISHED history import for ${owner}.`);
          break;
        }
      } catch (e) {
        Sentry.captureException(e);
        helpers.logger.error(`Failed Google/Gmail message fetch for ${owner}`);
        helpers.logger.error(e);
        break;
      }
    }
  };
}

const importHistoryItem = async (owner, messageId, gmail, helpers) => {
  try {
    const messageResponse = await gmail.users.messages.get({
      id: messageId,
      userId: "me"
    });
    const data = messageResponse.data;
    const headers = messageResponse.data.payload.headers;

    const messageData = {
      owner: owner,
      from: extractEmailHeaderValue(headers, "From")[0],
      to: extractEmailHeaderValue(headers, "To"),
      cc: extractEmailHeaderValue(headers, "Cc") || [],
      replyTo: extractEmailHeaderValue(headers, "Reply-To")[0],
      labels: data.labelIds || [],
      date: new Date(parseInt(data.internalDate)),
      threadId: data.threadId,
      historyId: data.historyId,
      messageId: data.id
    };

    if (messageData.labels.indexOf('CATEGORY_PROMOTIONS') == -1) {
      helpers.logger.info(`ENQUEUED: Importing historical message: ${messageData.messageId}`);
      enqueueRecordEmailJob(messageData);
    }

  } catch (e) {
    Sentry.captureException(e);
    helpers.logger.error(`Failed Google/Gmail message detail fetch for ${owner}`);
    helpers.logger.error(e);
  }
};

const extractHeaderValue = (headers, key) => {
  const pair = headers.find(o => o.name === key);
  return typeof (pair) === "undefined" ? null : pair.value;
};

const extractEmailHeaderValue = (headers, key) => {
  const extractedField = extractHeaderValue(headers, key);
  return emailsFromEmailField(extractedField);
};

const emailsFromEmailField = (emailField) => {
  if (!emailField) {
    return [];
  }
  const regex = /([a-z0-9._+-]+@[a-z0-9_-]+[a-z]\.[a-z]+)+/gi;
  emailField = `${emailField.split('@')[0].split('+')[0]}@${emailField.split('@')[1]}`; // strip + addresses
  return [... new Set(emailField.toLowerCase().match(regex))]; // unique and lowercase
};

const enqueueRecordEmailJob = async (data) => {
  const utils = await worker;

  return await utils.addJob(
    'recordEmail',
    data
  );
}
