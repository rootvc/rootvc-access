const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
require('dotenv').config();
let supertokens = require("supertokens-node");
let Session = require("supertokens-node/recipe/session");
let { verifySession } = require("supertokens-node/recipe/session/framework/express");
let { middleware, errorHandler } = require("supertokens-node/framework/express");
let ThirdParty = require("supertokens-node/recipe/thirdparty");
const { run } = require('graphile-worker');
const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();

const apiPort = process.env.REACT_APP_API_PORT || 3001;
const apiDomain = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
const websiteDomain = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;

const heartbeatRouter = require('./routes/heartbeat');
const emailsRouter = require('./routes/emails');

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_URI,
    apiKey: process.env.SUPERTOKENS_API_KEY,
  },
  appInfo: {
    appName: "RootVC Access",
    apiDomain: apiDomain,
    websiteDomain: websiteDomain
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          ThirdParty.Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            scope: [
              "https://www.googleapis.com/auth/userinfo.email",
              "https://www.googleapis.com/auth/userinfo.profile",
              "https://www.googleapis.com/auth/gmail.readonly"
            ]
          }),
        ],
      },
    }),
    Session.init(),
  ],
});

const app = express();

app.use(
  cors({
    origin: websiteDomain,
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(middleware());

app.use('/heartbeat/', heartbeatRouter);
app.use('/webhooks/', emailsRouter);

// custom API that requires session verification
app.get("/sessioninfo", verifySession(), async (req, res) => {
  let session = req.session;
  res.send({
    sessionHandle: session.getHandle(),
    userId: session.getUserId(),
    accessTokenPayload: session.getAccessTokenPayload(),
  });
});

// Handle React routing, return all requests to React app
// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('/*', function(req, res) {
// res.sendFile(path.join(__dirname, '../client/build', req.path));
// });

app.use(errorHandler());

app.use((err, req, res, next) => {
  res.status(500).send(`Internal error: ${err.message}`);
});

async function main() {
  const runner = await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskDirectory: `${__dirname}/tasks`,
  });

  // If the worker exits (whether through fatal error or otherwise), this
  // promise will resolve/reject:
  await runner.promise;
}

main()
  .catch((err) => {
    console.error('This should never happen', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

app.listen(apiPort, () => console.log(`API Server listening on port ${apiPort}`));

// module.exports = app;
