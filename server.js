// server.js
const { http,fs, serveCssFile, parseCookies, serveHtmlFile, handleRootRequest, handleBoardListRequest,handleGetBoardRequest,handleDeleteRequest,handleLogoutRequest,handleEditRequest,
  handleSignupRequest, handleLoginRequest,
  handleGetSubmissionRequest} = require('./modules.js');
const { test } = require('./public/js/module/handlers.js')

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
    handleEditRequest(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});
server.listen(8080, () => {
  console.log("서버가 http://localhost:8080 에서 실행 중입니다.");
});