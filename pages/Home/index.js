import React, { useState, useEffect } from "react";
import Axios from "axios";
import Logout from "./Logout";
import SuccessView from "./SuccessView";
import ImportHistory from "./ImportHistory";
// import ShowContacts from "./ShowContacts";
import { useRouter } from 'next/router'

import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { signOut } from "supertokens-auth-react/recipe/thirdparty";

export default function Home() {
  const { userId } = useSessionContext();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);

  async function logoutClicked() {
    await signOut();
    router.push("/auth");
  }

  async function importHistoryClicked(email) {
    await Axios.post('/api/history', {
      superTokensId: userId,
    });
  }

  async function fetchContacts() {
    const { data } = await Axios.get('api/contacts');
    const contacts = data;
    setContacts(contacts);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="fill">
      <Logout logoutClicked={logoutClicked} />
      <ImportHistory importHistoryClicked={importHistoryClicked} />
      <SuccessView userId={userId} />
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>[{contact.toAndFromOwner}] {contact.contact}</li>
        ))}
      </ul>
    </div>
  );
}
