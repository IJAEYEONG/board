// server.js
const { http,fs,connection, serveCssFile, parseCookies, serveHtmlFile, handleRootRequest, handleBoardListRequest, edit,deleteSession } = require('./modules.js');
const { handleSignupRequest, handleLoginRequest, test } = require('./public/js/module/handlers.js')
const server = http.createServer((req, res) => {
  if (serveCssFile(req, res)) {
    return;
  }
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;
  if (req.method === "GET" && req.url === "/") {
    handleRootRequest(req, res, sessionId);
  } else if (req.method === "GET" && req.url === "/BoardList") {
    handleBoardListRequest(req, res);
  } else if (req.method === "GET" && req.url === "/login") {
    serveHtmlFile("./public/html/login.html", res);
  } else if (req.method === "GET" && req.url === "/signup") {
    serveHtmlFile("./public/html/signup.html", res);
  } else if (req.method === "POST" && req.url === "/signup") {
    handleSignupRequest(req, res);
  } else if (req.method === "POST" && req.url === "/login") {
    handleLoginRequest(req, res);
  } else if (req.method === "POST" && req.url === "/submit") {
    test(req, res);
  } else if (req.method === "GET" && req.url === "/board") {
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
  } else if (req.method === "GET" && req.url.startsWith("/submission/")) {
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
  } else if (req.method === "GET" && req.url.startsWith("/delete/")) {
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
  } else if (req.method === "GET" && req.url === "/logout") {
    deleteSession(sessionId, (err) => {
      if (err) {
        console.error("세션 삭제 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  } else if (req.method === "GET" && req.url.startsWith("/edit/")) {
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
  } else if (req.method === "POST" && req.url === "/edit") {
    edit(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(8080, () => {
  console.log("서버가 http://localhost:8080 에서 실행 중입니다.");
});
