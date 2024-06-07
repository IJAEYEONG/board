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
// const ResdFileSync =require('./module/ResdFileSync.js')
const generateAuthLinks = require("./module/LoginLink.js");
const fsReadFile = require("./module/fsReadFile.js");
const { serveCssFile } = require("./module/css.js");
<<<<<<< HEAD
=======
function serveHtmlFile(filePath, res) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`${filePath} 읽기 오류:`, err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}
>>>>>>> FsModuleTest

const server = http.createServer((req, res) => {
  if (serveCssFile(req, res)) {
    return;
  }
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;
  if (req.method === "GET" && req.url === "/") {
    readSession(sessionId, (err, sessionData) => {
      if (err) {
        console.error("세션 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      fsReadFile.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          console.error("index.html 읽기 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        const { loginLink, signupLink } = generateAuthLinks(sessionData);
        data = data.replace("%LOGIN_LINK%", loginLink);
        data = data.replace("%signup_Link%", signupLink);
        const query =
          "SELECT id, title, date FROM submissions ORDER BY date DESC LIMIT 3";
        connection.query(query, (err, results) => {
          if (err) {
            console.error("데이터베이스에서 제출물 조회 오류:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          const linksHTML = linksModule.generateLinks(results);
          data = data.replace("%a%", linksHTML);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      });
    });
  } else if (req.method === "GET" && req.url === "/BoardList") {
    fs.readFile("BoardList.html", "utf8", (err, data) => {
      if (err) {
        console.error("BoardList.html 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      //BoardList.html을 읽는 부분 에러가 발생하면 return으로 함수 종료.
      const query = "SELECT id, title, date FROM submissions";
      connection.query(query, (err, results) => {
        if (err) {
          console.error("데이터베이스에서 제출물 조회 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        //submissiions 테이블에서 id,title,date를 찾아서 선택함 만약 에러가 나오면 return으로 함수종료.
        const links = results
          .map(
            (submission) => `
          <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
          <a href="/delete/${submission.id}">삭제</a>
          <a href="/edit/${submission.id}">수정</a>
        `
          )
          .join("<br>");
        //위에서 나온 쿼리문을 실행한 결과를 받은 results는 배열로 반환하기떄문에 map으로 html형태로 쪼갠다? 그리고 그 배열을 join으로 결합 시킴.
        data = data.replace("%a%", links);
        //위에서 map으로 쪼개고 join으로 결합시킨걸 links에 들어가있기때문에 그 replace로 html에 나타나게 한다.
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    });
  } 
  else if (req.method === "GET" && req.url === "/login") {
    serveHtmlFile("login.html", res);
  } else if (req.method === "GET" && req.url === "/signup") {
    //get이고 /signup일떄 실행되고 signup.html을 읽는다
    fs.readFile("signup.html", "utf8", (err, data) => {
      if (err) {
        console.error("signup.html 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      //에러가 생기면 console에 에러가 나오고err을 콜백한고 함수종료.
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    // 에러가 나지 않았으면 상태코드 200을 나오고 text/html을 읽게한뒤 res.end로 data를 응답으로 보내준다.
  } else if (req.method === "POST" && req.url === "/signup") {
    //POST이고 /signup일때 실행이되고
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    //body라는 변수로 초기화 시킨뒤.data라는 이벤트를 on으로 연결해서 post로 보낸 데이터를 crunk에 저장하고 crunk가  가지고 있는 정보나 값들을 문자열로 만들어 리턴해 body에 넣는부분
    req.on("end", async () => {
      const postData = qs.parse(body);
      const name = postData.name;
      const Email = postData.Email;
      const username = postData.username;
      const password = postData.password;
      //위에서 body안에 넣은 데이터들 queryString.parse 해서 가져온다, 위에서 async를 선언해 비동기방식으로 했다고 정의했다.
      if (name && Email && username && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        //name, Email, username,password 가 다들어왔으면 잠시 async함수를 정지시키고 패스워드를 10개형태로 암호화시킨다.
        const query =
          "INSERT INTO site_user (name, Email, username, password) VALUES (?, ?, ?, ?)";
        //site_user이라는 테이블에 4개의 값을 INSERT한다라는 쿼리문.
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
          //connection.query로 query문을 실행시켜 4개의값을 테이블에 저장한다 성공했으면 302상태코드를 말하고 /login 화면으로 돌아간다.
        );
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad Request");
      }
    }); //그게아니라면 400상태코드를 내뱉고 html에서 Bad Request라고 응답한다.
  } else if (req.method === "POST" && req.url === "/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    //body라는 변수로 초기화 시킨뒤.data라는 이벤트를 on으로 연결해서 post로 보낸 데이터를 crunk에 저장하고 crunk가  가지고 있는 정보나 값들을 문자열로 만들어 리턴해 body에 넣는부분
    req.on("end", () => {
      const postData = qs.parse(body);
      const username = postData.username;
      const password = postData.password;
      //postData라는 변수를 만들어 body에 저장해놓은 데이터를 queryString.parse해서 postData에 넣는다
      if (username && password) {
        const query = "SELECT * FROM site_user WHERE username = ?";
        connection.query(query, [username], async (err, results) => {
          if (err) {
            console.error("데이터베이스에서 사용자 조회 오류:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          //만약 username과 password가 들어왔다면 실행하는 부분이고 site_user테이블안에있는 username을 기준으로 찾아본다.
          if (results.length > 0) {
            const user = results[0];
            // selete문은 항상 배열로 봔한하는데 그 결과값이 results안에 들어가있으니까 그 안에있는 첫번째 해당하는것을 user변수에 담는다.
            try {
              const passwordMatch = await bcrypt.compare(
                password,
                user.password
              );
              //사용자가 입력한 비밀번호와 db에 저장된 비밀번호를 비교하는 부분.
              if (passwordMatch) {
                const sessionData = { loggedIn: true, userId: user.id };
                //만약 비밀번호를 비교한게 맞다면 세션 데이터를 만들어준다.
                createSession(sessionData, (err, sessionId) => {
                  if (err) {
                    console.error("세션 생성 오류:", err);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                    return;
                  }
                  //createSession함수로 세션데이터를 가져오고 id와 세션 만료시간을 생성해 둔다.
                  res.setHeader(
                    "Set-Cookie",
                    `sessionId=${sessionId}; HttpOnly`
                  );
                  //
                  res.writeHead(302, { Location: "/" });
                  res.end();
                }); // 오류가안났다면 상태코드 302로 내보내고 /로 돌아가게 한다.
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
  } else if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    }); // post이고/submit이면 변수 body를 초기화하고 data이벤트를 사용해서 들어온 데이터를 읽는다.
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
      //GET이고 url이고 /board이면 board.html을 읽는다
      if (err) {
        console.error("board.html 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      //만약 err이면 console에 오류를 나타내고 return으로 함수 종료시킨다.
      const query = "SELECT id, title, date FROM submissions";
      //submissions 테이블에서 id,title,date를 찾는다.
      connection.query(query, (err, results) => {
        //connection.query메서드로 qeury를 실행하고 콜백으로 err,result를 받는다.
        if (err) {
          console.error("데이터베이스에서 제출물 조회 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        //만약 에러가 났다면 console에 오류가 뜨고 상태코드 500이 뜬고 return으로 함수가종료.
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
      //별다른 오류가 없다면 상태코드 200을 내고 html에 data를 반환하고 종료.
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
