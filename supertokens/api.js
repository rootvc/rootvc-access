const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const helmet = require("helmet");
require("dotenv").config();
let supertokens = require("supertokens-node");
let Session = require("supertokens-node/recipe/session");
let { verifySession } = require("supertokens-node/recipe/session/framework/express");
let { middleware, errorHandler } = require("supertokens-node/framework/express");
let ThirdParty = require("supertokens-node/recipe/thirdparty");

const apiPort = process.env.REACT_APP_API_PORT || 3000;
const apiDomain = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3002;
const websiteDomain = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_URI,
    apiKey: process.env.SUPERTOKENS_API_KEY,
  },
  appInfo: {
    appName: "RootVC Access",
    apiDomain: "access.root.vc",
    websiteDomain: "access.root.vc",
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          // We have provided you with development keys which you can use for testing.
          // IMPORTANT: Please replace them with your own OAuth keys for production use.
          ThirdParty.Google({
            clientId: "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
            clientSecret: "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",
          }),
        ],
      },
    }),
    Session.init(),
  ],
});

const app = express();

// app.use(
//   cors({
//     origin: "access.root.vc", // TODO: Change to your app's website domain
//     allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
//     methods: ["GET", "PUT", "POST", "DELETE"],
//     credentials: true,
//   })
// );

// custom API that requires session verification
app.get("/sessioninfo", verifySession(), async (req, res) => {
  let session = req.session;
  res.send({
    sessionHandle: session.getHandle(),
    userId: session.getUserId(),
    accessTokenPayload: session.getAccessTokenPayload(),
  });
});

app.use(errorHandler());

app.use((err, req, res, next) => {
  res.status(500).send(`Internal error: ${err.message}`);
});

app.listen(apiPort, () => console.log(`[supertokens] API Server listening on port ${apiPort}`));