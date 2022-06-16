import React from "react";
import axios from "axios";
import Logout from "./Logout";
import SuccessView from "./SuccessView";
import ImportHistory from "./ImportHistory";
import { useRouter } from 'next/router'

import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { signOut } from "supertokens-auth-react/recipe/thirdparty";

export default function Home() {
  const { userId } = useSessionContext();
  const router = useRouter();

  async function logoutClicked() {
    await signOut();
    router.push("/auth");
  }

  async function importHistoryClicked(email) {
    const response = await axios.post('/api/history', {
      superTokensId: userId,
    });
  }

  return (
    <div className="fill">
      <Logout logoutClicked={logoutClicked} />
      <ImportHistory importHistoryClicked={importHistoryClicked} />
      <SuccessView userId={userId} />
    </div>
  );
}
