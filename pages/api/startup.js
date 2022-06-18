import { withSentry } from '@sentry/nextjs';
const server = require("../../server/index");

// see the server/index endpoint to see what happens on startup

const handler = async (req, res) => {
  await server;

  res.statusCode = 200;
  res.status(200).json({ status: 200, message: "OK" });
}

// horrible hack to get around a sentry + next bug
// https://github.com/getsentry/sentry-javascript/issues/3852
export const config = {
  api: {
    externalResolver: true,
  },
};

export default withSentry(handler);
