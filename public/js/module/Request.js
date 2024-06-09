const fs =require('fs')
const connection=require('./db.js')
function handleGetBoardRequest(req, res) {
    if (req.method === "GET" && req.url === "/board") {
      fs.readFile("./public/html/board.html", "utf8", (err, data) => {
        if (err) {
          console.error("board.html 읽기 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        const query = "SELECT id, title, date FROM submissions";
        connection.query(query, (err, results) => {
          if (err) {
            console.error("데이터베이스에서 제출물 조회 오류:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      });
    }
  }
  module.exports={
    handleGetBoardRequest
  }