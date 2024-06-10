const fs = require("fs");
const connection = require("./db.js");
function handleEditRequest(req, res) {
  if (req.method === 'GET') {
    const submissionId = req.url.split("/").pop();
    const query = "SELECT title, content FROM submissions WHERE id = ?";
    connection.query(query, [submissionId], (err, results) => {
      if (err) {
        console.error("데이터베이스에서 제출물 조회 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      if (results.length > 0) {
        const submission = results[0];
        fs.readFile("./public/html/edit.html", "utf8", (err, data) => {
          if (err) {
            console.error("edit.html 읽기 오류:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          data = data.replace("%TITLE%", submission.title);
          data = data.replace("%CONTENT%", submission.content);
          data = data.replace("%ID%", submissionId);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });
  } else if (req.method === 'POST') {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const parsedData = new URLSearchParams(body);
      const submissionId = parsedData.get("id");
      const title = parsedData.get("title");
      const content = parsedData.get("content");
      const query = "UPDATE submissions SET title = ?, content = ? WHERE id = ?";
      connection.query(query, [title, content, submissionId], (err) => {
        if (err) {
          console.error("데이터베이스에서 제출물 수정 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        res.writeHead(302, { Location: "/" });
        res.end();
      });
    });
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
}
module.exports = {
  handleEditRequest
};
