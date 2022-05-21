import CallAPIView from "./CallAPIView";

export default function SuccessView(props) {
  let userId = props.userId;

  return (
    <div
      className="fill"
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: "bold",
        paddingTop: "10px",
        paddingBottom: "40px",
      }}>

      Your user ID is
      <div />
      {userId}

    </div>
  );
}
