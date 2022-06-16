export default function Logout(props) {
  let importHistoryClicked = props.importHistoryClicked;

  return (
    <div className="button">
      <div className="button-inner" onClick={importHistoryClicked}>
        IMPORT HISTORY
      </div>
    </div>
  );
}
