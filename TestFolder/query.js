const connection = require('../public/js/module/db');

function query(res, callback) {
  const query =
    "SELECT id, title, date FROM submissions ORDER BY date DESC LIMIT 3";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("데이터베이스에서 제출물 조회 오류:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    // 콜백 함수를 통해 결과 전달
    callback(results);
  });
}

module.exports = {
  query
};