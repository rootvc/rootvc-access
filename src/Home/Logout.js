export default function Logout(props) {
  let logoutClicked = props.logoutClicked;

  return (
    <div class="button">
      <div class="button-inner" onClick={logoutClicked}>
        SIGN OUT
      </div>
    </div>
  );
}
