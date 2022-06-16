import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import SessionNode from 'supertokens-node/recipe/session'
import { appInfo } from './appInfo'
import jwt from 'jsonwebtoken'
const prisma = require('../services/prisma');

export const backendConfig = () => {
  return {
    framework: "express",
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_URI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo,
    recipeList: [
      ThirdPartyNode.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyNode.Google({
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
      SessionNode.init(),
    ],
    isInServerlessEnv: true,
  }
}
