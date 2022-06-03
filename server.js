require('dotenv').config();
const path = require("path");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
let supertokens = require("supertokens-node");
let Session = require("supertokens-node/recipe/session");
let { verifySession } = require("supertokens-node/recipe/session/framework/express");
let { middleware, errorHandler } = require("supertokens-node/framework/express");
let ThirdParty = require("supertokens-node/recipe/thirdparty");
const jwt = require('jsonwebtoken');

const prisma = require('./services/prisma');
const worker = require('./services/graphileWorker');

const apiPort = process.env.REACT_APP_API_PORT || 3001;
const apiDomain = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
const websiteDomain = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;

const heartbeatRouter = require('./routes/heartbeat');
const emailsRouter = require('./routes/emails');
const historyRouter = require('./routes/history');

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
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,

            signInUpPOST: async function(input) {
              if (originalImplementation.signInUpPOST === undefined) {
                throw Error("Should never come here");
              }

              let response = await originalImplementation.signInUpPOST(input);

              if (response.status === "OK") {
                const userData = jwt.decode(response.authCodeResponse.id_token);
                const accessToken = response.authCodeResponse.access_token;

                // TODO: grab name and maybe avatar from Google API?                              

                try {
                  await prisma.User.upsert({
                    where: { email: userData.email },
                    update: {
                      googleAccessToken: accessToken,
                    },
                    create: {
                      email: userData.email,
                      domain: userData.hd,
                      googleAccessToken: accessToken,
                      isOwner: userData.hd == process.env.OWNER_GOOGLE_DOMAIN,
                    }
                  });
                  console.log(`Logged in and created/updated User: ${userData.email}`);
                } catch (error) {
                  console.log(`Error upserting User: ${userData.email}`)
                  console.log(error);
                }
              };

              return response;
            },
          }
        }
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
app.use('/history/', historyRouter);
app.use('/webhooks/emails/', emailsRouter);

// custom API that requires session verification
app.get("/sessioninfo", verifySession(), async (req, res) => {
  let session = req.session;
  res.send({
    sessionHandle: session.getHandle(),
    userId: session.getUserId(),
    accessTokenPayload: session.getAccessTokenPayload(),
  });
});

// Serve React app
app.use(express.static(path.join(__dirname, './build')));

app.use(errorHandler());

app.use((err, req, res, next) => {
  res.status(500).send(`Internal error: ${err.message}`);
});

async function main() {
  await worker.init(); // TODO: try non-async function in service, and () at require here
}

main()
  .catch((error) => {
    console.error('This should never happen')
    console.error(error);
  })

app.listen(apiPort, "0.0.0.0", () => console.log(`API Server listening on port ${apiPort}`));
