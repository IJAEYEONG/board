// *내장모듈이나 모듈을 불러오는 부분.
const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const bcrypt = require("bcrypt");
const connection = require("./module/db.js");
const crypto = require("crypto");
const createSession = require("./module/CreateSession.js");
const readSession = require("./module/readSession.js");
const updateSession = require("./module/updateSession.js");
const deleteSession = require("./module/deleteSession.js");
const parseCookies = require("./module/parseCookies.js");
const linksModule = require("./module/fs.js");
const generateAuthLinks = require("./module/LoginLink.js");
const fsReadFile = require("./module/fsReadFile.js");
const { serveCssFile } = require("./module/css.js");
const {serveHtmlFile}=require('./module/FsRead.js')
const {handleRootRequest}=require('./module/test.js')
const {handleBoardListRequest}= require('./module/test2.js')
function handleSignupRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
      body += chunk.toString();
  });
  req.on("end", async () => {
      const postData = qs.parse(body);
      const name = postData.name;
      const Email = postData.Email;
      const username = postData.username;
      const password = postData.password;
      if (name && Email && username && password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const query =
              "INSERT INTO site_user (name, Email, username, password) VALUES (?, ?, ?, ?)";
          connection.query(
              query,
              [name, Email, username, hashedPassword],
              (err, results) => {
                  if (err) {
                      console.error("데이터베이스에 사용자 삽입 오류:", err);
                      res.writeHead(500, { "Content-Type": "text/plain" });
                      res.end("Internal Server Error");
                      return;
                  }
                  res.writeHead(302, { Location: "/login" });
                  res.end();
              }
          );
      } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Bad Request");
      }
  });
}
function handleLoginRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
      body += chunk.toString();
  });
  req.on("end", () => {
      const postData = qs.parse(body);
      const username = postData.username;
      const password = postData.password;

      if (username && password) {
          const query = "SELECT * FROM site_user WHERE username = ?";
          connection.query(query, [username], async (err, results) => {
              if (err) {
                  console.error("데이터베이스에서 사용자 조회 오류:", err);
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end("Internal Server Error");
                  return;
              }

              if (results.length > 0) {
                  const user = results[0];
                  try {
                      const passwordMatch = await bcrypt.compare(password, user.password);
                      if (passwordMatch) {
                          const sessionData = { loggedIn: true, userId: user.id };
                          createSession(sessionData, (err, sessionId) => {
                              if (err) {
                                  console.error("세션 생성 오류:", err);
                                  res.writeHead(500, { "Content-Type": "text/plain" });
                                  res.end("Internal Server Error");
                                  return;
                              }
                              res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly`);
                              res.writeHead(302, { Location: "/" });
                              res.end();
                          });
                      } else {
                          res.writeHead(401, { "Content-Type": "text/plain" });
                          res.end("Unauthorized");
                      }
                  } catch (err) {
                      console.error("비밀번호 비교 오류:", err);
                      res.writeHead(500, { "Content-Type": "text/plain" });
                      res.end("Internal Server Error");
                  }
              } else {
                  res.writeHead(401, { "Content-Type": "text/plain" });
                  res.end("Unauthorized");
              }
          });
      } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Bad Request");
      }
  });
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
  } 
  else if (req.method === "GET" && req.url === "/login") {
    serveHtmlFile("login.html", res);
  } else if (req.method === "GET" && req.url === "/signup") {
    serveHtmlFile("signup.html",res);
  } 
  else if (req.method === "POST" && req.url === "/signup") {
    handleSignupRequest(req, res);
} else if (req.method === "POST" && req.url === "/login") {
  handleLoginRequest(req, res);
} else if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    }); 
    req.on("end", () => {
      const postData = qs.parse(body);
      // postData라는 변수를 만들어 body에 들어있는 데이터를 queryString.parse 해서 넣어둔다.
      const title = postData.title;
      const content = postData.content;
      const date = new Date().toLocaleString();
      //title,content,data를 body에서 가져온다.
      const query =
        "INSERT INTO submissions (title, content, date) VALUES (?, ?, ?)";
      //submissions 테이블에 title,content,date값을 INSERT한다.
      connection.query(query, [title, content, date], (err, results) => {
        //connection.query 메서드를 사용해서 query를 실행 title,content,date를 넣는다.
        if (err) {
          console.error("데이터베이스에 제출물 삽입 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        //만약 err이 났다면 return으로 함수종료.
        res.writeHead(302, { Location: "/" });
        res.end();
      }); // 오류가 나지않았으면 302상태코드를 주고 /를 반환
    });
  } else if (req.method === "GET" && req.url === "/board") {
    fs.readFile("board.html", "utf8", (err, data) => {
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
    //pop메서드는 배열에서 마지막 요소를 제거하는 메서드.
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
        fs.readFile("submission.html", "utf8", (err, data) => {
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
    connection.query(query, [submissionId], (err, results) => {
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
      res.setHeader(
        "Set-Cookie",
        "sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
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
        fs.readFile("edit.html", "utf8", (err, data) => {
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
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
  console.log(req.url.startsWith);
});
server.listen(7070, () => {
  console.log("서버가 http://localhost:7070 에서 실행 중입니다.");
});
