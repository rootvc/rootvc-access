import { withSentry } from '@sentry/nextjs';

const handler = async (req, res) => {
  res.statusCode = 200;
  res.status(200).json({ message: "OK" })
};

export default withSentry(handler);
