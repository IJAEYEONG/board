// server.js
const { http,fs,connection, serveCssFile, parseCookies, serveHtmlFile, handleRootRequest, handleBoardListRequest, edit,deleteSession,handleGetBoardRequest,handleDeleteRequest } = require('./modules.js');
const { handleSignupRequest, handleLoginRequest, test } = require('./public/js/module/handlers.js')

function handleLogoutRequest(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId; // 쿠키에서 세션 ID를 가져오는 함수가 있다고 가정
  
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
}

function handleEditRequest(req, res) {
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
}

function handlePostEditRequest(req, res) {
  edit(req, res); // edit 함수가 정의되어 있다고 가정
}

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
    handleGetBoardRequest(req, res);
  }  else if (req.method === "GET" && req.url.startsWith("/submission/")) {
    handleGetSubmissionRequest(req, res);
  } else if (req.method === "GET" && req.url.startsWith("/delete/")) {
    handleDeleteRequest(req, res);
  } else if (req.method === "GET" && req.url === "/logout") {
    handleLogoutRequest(req, res);
  } else if (req.method === "GET" && req.url.startsWith("/edit/")) {
    handleEditRequest(req, res);
  } else if (req.method === "POST" && req.url === "/edit") {
    handlePostEditRequest(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});
server.listen(8080, () => {
  console.log("서버가 http://localhost:8080 에서 실행 중입니다.");
});
