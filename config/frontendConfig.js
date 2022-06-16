import ThirdPartyReact, { Google } from 'supertokens-auth-react/recipe/thirdparty'
import SessionReact from 'supertokens-auth-react/recipe/session'
import { appInfo } from './appInfo'

export const frontendConfig = () => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyReact.init({
        signInAndUpFeature: {
          providers: [Google.init()],
          style: {
            container: {
              "backgroundImage": "url(/rootvc-logo.png)",
              "backgroundSize": "100px",
              "backgroundRepeat": "no-repeat",
              "backgroundPositionY": "20px",
              "backgroundPositionX": "center",
              "paddingTop": "100px"
            },
            providerGoogle: {
              "backgroundColor": "#ff6700",
              "borderColor": "black",
            }
          }
        },
        palette: {
          background: '#2c2c2c',
          error: '#ff6700',
          textTitle: "white",
          textLabel: "white",
          textInput: '#a9a9a9',
          textPrimary: "white",
          textLink: '#a9a9a9',
          superTokensBrandingBackground: "white",
          superTokensBrandingText: "black"
        },
        style: {
          container: {
            fontFamily: "Abel"
          }
        }
      }),
      SessionReact.init(),
    ],
  }
}
