import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { middleware } from 'supertokens-node/framework/express'
import supertokens from 'supertokens-node'
import { backendConfig } from '../../../config/backendConfig'
import NextCors from "nextjs-cors";

const port = process.env.APP_PORT || 3000;

supertokens.init(backendConfig());

export default async function superTokens(req, res) {
  // NOTE: We need CORS only if we are querying the APIs from a different origin
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost${port}`,
    credentials: true,
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
  });

  await superTokensNextWrapper(
    async (next) => {
      await middleware()(req, res, next)
    },
    req,
    res
  )
  if (!res.writableEnded) {
    res.status(404).send('Not found')
  }
}