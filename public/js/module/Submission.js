const fs =require('fs')
const connection=require('./db.js')
function handleGetSubmissionRequest(req, res) {
    const id = req.url.split("/").pop();
    const query = "SELECT * FROM submissions WHERE id = ?";
    
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error("데이터베이스에서 제출물 조회 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      
      if (results.length > 0) {
        const submission = results[0];
        
        fs.readFile("./public/html/submission.html", "utf8", (err, data) => {
          if (err) {
            console.error("submission.html 읽기 오류:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          
          data = data.replace("%TITLE%", submission.title);
          data = data.replace("%CONTENT%", submission.content);
          data = data.replace("%DATE%", submission.date);
          
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });
  }
  module.exports={
    handleGetSubmissionRequest
  }