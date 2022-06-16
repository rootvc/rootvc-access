import React from 'react'
import dynamic from 'next/dynamic'
import ThirdParty from 'supertokens-auth-react/recipe/thirdparty'
import Home from "./Home";

const ThirdPartyAuthNoSSR = dynamic(
  new Promise((res) =>
    res(ThirdParty.ThirdPartyAuth)
  ),
  { ssr: false }
)

export default function App() {
  return (
    // we protect ProtectedPage by wrapping it
    // with ThirdPartyEmailPasswordAuthNoSSR

    <ThirdPartyAuthNoSSR>
      <Home />
    </ThirdPartyAuthNoSSR>
  )
}
