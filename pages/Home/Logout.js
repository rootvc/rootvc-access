export default function Logout(props) {
  let logoutClicked = props.logoutClicked;

  return (
    <div className="button">
      <div className="button-inner" onClick={logoutClicked}>
        SIGN OUT
      </div>
    </div >
  );
}
