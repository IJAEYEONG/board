const connection = require("./db.js");
function deleteSession(sessionId, callback) {
  const query = "DELETE FROM sessions WHERE session_id = ?";
  connection.query(query, [sessionId], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}
module.exports=deleteSession