const connection=require('./db.js')
function fetchRecentSubmissions(callback) {
  const query = "SELECT id, title, date FROM submissions ORDER BY date DESC LIMIT 3";
  connection.query(query, [], callback);
}
module.exports={
  fetchRecentSubmissions
}