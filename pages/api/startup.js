require("../../server/index");

// see the server/index endpoint to see what happens on startup

const handler = async (req, res) => {
  res.statusCode = 200;
  res.status(200).json({ status: 1, message: "OK" });
}

export default handler;
