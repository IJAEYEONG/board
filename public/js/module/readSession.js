const connection = require("./db.js");
function readSession(sessionId, callback) {
  const query ="SELECT session_data FROM sessions WHERE session_id = ? AND expires_at > NOW()";
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      return callback(err);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    const sessionData = JSON.parse(results[0].session_data);
    console.log(sessionData);
    callback(null, sessionData);
  });
}
module.exports=readSession