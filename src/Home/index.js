import React from "react";
import axios from "axios";
import Logout from "./Logout";
import SuccessView from "./SuccessView";
import ImportHistory from "./ImportHistory";

import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useNavigate } from "react-router-dom";
import { signOut } from "supertokens-auth-react/recipe/thirdparty";

export default function Home() {
  const { userId } = useSessionContext();
  const navigate = useNavigate();

  async function logoutClicked() {
    await signOut();
    navigate("/auth");
  }

  async function importHistoryClicked(email) {
    email = "lee@root.vc";  // TODO: do not hardcode lol
    const response = await axios.post('/history', {
      email: email
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
