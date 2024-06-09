const connection=require('./db.js')
const qs=require('querystring')
function edit (req,res){
    let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const postData = qs.parse(body);
        const id = postData.id;
        const title = postData.title;
        const content = postData.content;
  
        if (id && title && content) {
          const query =
            "UPDATE submissions SET title = ?, content = ? WHERE id = ?";
          connection.query(query, [title, content, id], (err, results) => {
            if (err) {
              console.error("데이터베이스에서 제출물 업데이트 오류:", err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
              return;
            }
            res.writeHead(302, { Location: "/" });
            res.end();
          });
        } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Bad Request");
        }
      });
  }
  module.exports={edit}