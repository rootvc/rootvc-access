import './styles.css'
import React from 'react'
import SuperTokensReact from 'supertokens-auth-react'

import { frontendConfig } from '../config/frontendConfig'

if (typeof window !== 'undefined') {
  SuperTokensReact.init(frontendConfig())
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
