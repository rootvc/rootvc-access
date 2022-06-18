import { withSentry } from '@sentry/nextjs';

const handler = async (req, res) => {
  res.statusCode = 200;
  res.status(200).json({ message: "OK" })
};

// horrible hack to get around a sentry + next bug
// https://github.com/getsentry/sentry-javascript/issues/3852
export const config = {
  api: {
    externalResolver: true,
  },
};

export default withSentry(handler);
