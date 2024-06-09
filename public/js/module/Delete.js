const connection=require('./db.js')
function handleDeleteRequest(req, res) {
    const submissionId = req.url.split("/").pop();
    const query = "DELETE FROM submissions WHERE id = ?";
    
    connection.query(query, [submissionId], (err) => {
      if (err) {
        console.error("데이터베이스에서 제출물 삭제 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  }
  module.exports={
    handleDeleteRequest
  }