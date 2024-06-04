// *내장모듈이나 모듈을 불러오는 부분.
const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const bcrypt = require("bcrypt");
const connection = require("./db.js");
const crypto = require("crypto");

// *세션 생성해주는 함수
function createSession(sessionData, callback) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  //세션 id를 16바이트의 랜덤 스트링을 hex형태로 바꿈
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  //세션 만료시간 부분 현재시간+24한것을 만듬
  console.log(typeof sessionData);
  console.log(sessionData);
  const query =
    "INSERT INTO sessions (session_id, session_data, expires_at) VALUES (?, ?, ?)";
  //session테이블에 id,data,시간을 삽입하는 쿼리
  connection.query(
    query,
    [sessionId, JSON.stringify(sessionData), expiresAt],
    (err) => {
      if (err) {
        return callback(err);
      }
      callback(null, sessionId);
    }
  );
  //위에있는 쿼리문을 실행하고 id, 데이터 ,시간을 받아서 쿼리에 저장 오류가없으면 null과 id를 콜백해서 저장 후 함수 종료.
}

// *query에서 조건에 맞는 데이터를 가져와 js 객체 형태로 바꿔서
function readSession(sessionId, callback) {
  const query =
    "SELECT session_data FROM sessions WHERE session_id = ? AND expires_at > NOW()"; //id와 같은 데이터와 시간을 선택
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      //만약 에러가 발생했다면 콜백으로 에러를 말해주고 return 으로 함수종료
      return callback(err);
    }
    if (results.length === 0) {
      //만약 results안에 값이 없다면 값이없다고null반환하고 함수종료
      return callback(null, null);
    }
    const sessionData = JSON.parse(results[0].session_data);
    //세션데이터 첫번째를 js객체형태로 바꿔서 sessionData에 저장
    console.log(sessionData);
    callback(null, sessionData);
    //에러가 없으면 null과 데이터를 반환해서 저장
  }); //
}

// *세션 업데이트 부분
function updateSession(sessionId, sessionData, callback) {
  const query =
    "UPDATE sessions SET session_data = ?, expires_at = ? WHERE session_id = ?";
  //세션 테이블을 업데이트한다고 선언 id와같은 세션 데이터와 시간을 업데이트하는 부분
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  // 시간만료시간은 현재시간+24
  connection.query(
    query,
    [JSON.stringify(sessionData), expiresAt, sessionId],
    (err) => {
      // 위에 쿼리문을 실행하고 받은 데이터를 json화 시키고 시간, id를 세션 테이블에 저장
      if (err) {
        // 오류가 났으면 콜백으로 에러를 반환하고 종료
        return callback(err);
      }
      callback(null);
      // 오류가없으면 콜백으로 null을 반환시켜준다.
    }
  );
}

//*세션 삭제 부분
function deleteSession(sessionId, callback) {
  const query = "DELETE FROM sessions WHERE session_id = ?";
  // id에 맞는 세션 테이블 찾는 부분
  connection.query(query, [sessionId], (err) => {
    // 쿼리문을 실행해서 id를 삭제한후 저장.

    if (err) {
      return callback(err);
    }
    //오류 나면 콜백으로 오류 보내주고 return으로 함수 종류
    callback(null);
  });
  //오류없으면 null반환
}
// *문자열의 쿠키를 객체 형식으로 바꾸는 함수
const parseCookies = (cookie = "") =>
  //빈 문자열로 설정.
  cookie
    .split(";")
    //쿠키 문자열을 세미콜론 기준으로 분할해서 배열로 넣음
    .map((v) => v.split("="))
    //위에서 분할된 쿠키 항목을 다시 =를 기준으로 키와 값으로 나누는 부분
    .reduce((acc, [key, value]) => {
      //acc는 누적값을 의미 
      acc[key.trim()] = decodeURIComponent(value);
      //key.trim()은 키에서 공백을 제거 하고 decodeURIComponent(value);이 url 인코딩된 경우 디코딩 해버림
      return acc;
      //누적된 값을 종료
    }, {});
//reduce 메서드를 사용하여 키-값 쌍 배열을 순회하며 
const server = http.createServer((req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;
  //
  if (req.method === "GET" && req.url === "/") {
    readSession(sessionId, (err, sessionData) => {
      if (err) {
        console.error("세션 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }

      fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          console.error("index.html 읽기 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }

        let loginLink = "";
        let signupLink = "";
        if (sessionData && sessionData.loggedIn) {
          loginLink = '<a href="/logout">로그아웃</a>';
        } else {
          loginLink = '<a href="/login">로그인</a>';
          signupLink = '<a href="/signup">회원가입</a>';
        }
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
          const links = results
            .map(
              (submission) => `
          <div class="post">
            <a href="/submission/${submission.id}" class="post-title">${submission.title}</a>
            <p class="post-date">${submission.date}</p>
            <div class="post-actions">
              <a href="/delete/${submission.id}" class="btn small">삭제</a>
              <a href="/edit/${submission.id}" class="btn small">수정</a>
            </div>
          </div>
        `
            )
            .join("");
          data = data.replace("%a%", links);
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
      const query = "SELECT id, title, date FROM submissions";
      connection.query(query, (err, results) => {
        if (err) {
          console.error("데이터베이스에서 제출물 조회 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        const links = results
          .map(
            (submission) => `
          <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
          <a href="/delete/${submission.id}">삭제</a>
          <a href="/edit/${submission.id}">수정</a>
        `
          )
          .join("<br>");

        data = data.replace("%a%", links);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    });
  } else if (req.url === "/styles.css") {
    const css = fs.readFileSync("styles.css");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.write(css);
    res.end();
  } else if (req.url === "/edit.css") {
    const EditCss = fs.readFileSync("edit.css");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.write(EditCss);
    res.end();
  } else if (req.url === "/board.css") {
    const BoardCss = fs.readFileSync("board.css");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.write(BoardCss);
    res.end();
  } else if (req.url === "/submission.css") {
    const Details = fs.readFileSync("submission.css");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.write(Details);
    res.end();
  } else if (req.url === "/signup.css") {
    const signup = fs.readFileSync("signup.css");
    res.statusCode = 200;
    res.setHeader("Contnet-Type", "text/css; charset=utf-8");
    res.write(signup);
    res.end();
  } else if (req.url === "/login.css") {
    const LoginCss = fs.readFileSync("login.css");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.write(LoginCss);
    res.end();
  } else if (req.method === "GET" && req.url === "/login") {
    fs.readFile("login.html", "utf8", (err, data) => {
      if (err) {
        console.error("login.html 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "GET" && req.url === "/signup") {
    fs.readFile("signup.html", "utf8", (err, data) => {
      if (err) {
        console.error("signup.html 읽기 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "POST" && req.url === "/signup") {
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
  } else if (req.method === "POST" && req.url === "/login") {
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
              const passwordMatch = await bcrypt.compare(
                password,
                user.password
              );
              if (passwordMatch) {
                const sessionData = { loggedIn: true, userId: user.id };
                createSession(sessionData, (err, sessionId) => {
                  if (err) {
                    console.error("세션 생성 오류:", err);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                    return;
                  }
                  res.setHeader(
                    "Set-Cookie",
                    `sessionId=${sessionId}; HttpOnly`
                  );
                  //
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
  } else if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const postData = qs.parse(body);
      const title = postData.title;
      const content = postData.content;
      const date = new Date().toLocaleString();
      const query =
        "INSERT INTO submissions (title, content, date) VALUES (?, ?, ?)";
      connection.query(query, [title, content, date], (err, results) => {
        if (err) {
          console.error("데이터베이스에 제출물 삽입 오류:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        res.writeHead(302, { Location: "/" });
        res.end();
      });
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
        const links = results
          .map(
            (submission) => `
          <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
          <a href="/delete/${submission.id}">삭제</a>
          <a href="/edit/${submission.id}">수정</a>
        `
          )
          .join("<br>");
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
});

server.listen(8080, () => {
  console.log("서버가 http://localhost:8080 에서 실행 중입니다.");
});
