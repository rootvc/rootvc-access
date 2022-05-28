import { useState } from "react";
import "./App.css";
import SuperTokens, { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react";
import ThirdParty, { ThirdPartyAuth, Google } from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";


import Home from "./Home";
import SessionExpiredPopup from "./SessionExpiredPopup";

export function getApiDomain() {
  const apiPort = process.env.REACT_APP_API_PORT || 3001;
  const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
  return apiUrl;
}

export function getWebsiteDomain() {
  const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
  const websiteUrl = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
  return websiteUrl;
}

SuperTokens.init({
  appInfo: {
    appName: "RootVC Access",
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
  },
  recipeList: [
    ThirdParty.init({
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
    Session.init(),
  ],
});

function App() {
  let [showSessionExpiredPopup, updateShowSessionExpiredPopup] = useState(false);

  return (
    <div className="App">
      <Router>
        <div className="fill">
          <Routes>
            {/* This shows the login UI on "/auth" route */}
            {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"))}

            <Route
              path="/"
              element={
                /* This protects the "/" route so that it shows 
                <Home /> only if the user is logged in.
                Else it redirects the user to "/auth" */
                <ThirdPartyAuth
                  onSessionExpired={() => {
                    updateShowSessionExpiredPopup(true);
                  }}>
                  <Home />
                  {showSessionExpiredPopup && <SessionExpiredPopup />}
                </ThirdPartyAuth>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;