const crypto = require("crypto");
const connection = require("./db.js");
function createSession(sessionData, callback) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  console.log(typeof sessionData);
  console.log(sessionData);
  const query =
    "INSERT INTO sessions (session_id, session_data, expires_at) VALUES (?, ?, ?)";
  connection.query(
    query,
    [sessionId, JSON.stringify(sessionData), expiresAt],
    (err) => {
      if (err) {
        return callback(err);
      }
      callback(null, sessionId);
    }
  );
}
module.exports=createSession