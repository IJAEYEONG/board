const connection =require("./db.js")
function fetchRecentSubmissions(callback) {
  const query = "SELECT id, title, date FROM submissions";
  connection.query(query, [], callback);
}
module.exports={
  fetchRecentSubmissions
}