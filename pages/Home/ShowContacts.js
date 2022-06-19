export default function ShowContacts(props) {
  let showContactsClicked = props.showContactsClicked;

  return (
    <div className="button">
      <div className="button-inner" onClick={showContactsClicked}>
        SHOW CONTACTS
      </div>
    </div>
  );
}
