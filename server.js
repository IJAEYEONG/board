const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const connection = require('./db.js');
const crypto = require('crypto');

// 세션 생성
function createSession(sessionData, callback) {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

  const query = 'INSERT INTO sessions (session_id, session_data, expires_at) VALUES (?, ?, ?)';
  connection.query(query, [sessionId, JSON.stringify(sessionData), expiresAt], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null, sessionId);
  });
}

// 세션 읽기
function readSession(sessionId, callback) {
  const query = 'SELECT session_data FROM sessions WHERE session_id = ? AND expires_at > NOW()';
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      return callback(err);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    const sessionData = JSON.parse(results[0].session_data);
    callback(null, sessionData);
  });
}

// 세션 갱신
function updateSession(sessionId, sessionData, callback) {
  const query = 'UPDATE sessions SET session_data = ?, expires_at = ? WHERE session_id = ?';
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

  connection.query(query, [JSON.stringify(sessionData), expiresAt, sessionId], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

// 세션 삭제
function deleteSession(sessionId, callback) {
  const query = 'DELETE FROM sessions WHERE session_id = ?';
  connection.query(query, [sessionId], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

// 쿠키 파싱 함수
const parseCookies = (cookie = '') =>
  cookie.split(';').map(v => v.split('=')).reduce((acc, [key, value]) => {
    acc[key.trim()] = decodeURIComponent(value);
    return acc;
  }, {});

const server = http.createServer((req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (req.method === 'GET' && req.url === '/') {
    readSession(sessionId, (err, sessionData) => {
      if (err) {
        console.error('세션 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
          console.error('index.html 읽기 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        let loginLink = '';
        let signupLink = '';
        if (sessionData && sessionData.loggedIn) {
          loginLink = '<a href="/logout">로그아웃</a>';
        } else {
          loginLink = '<a href="/login">로그인</a>';
          signupLink = '<a href="/signup">회원가입</a>';
        }

        data = data.replace('%LOGIN_LINK%', loginLink);
        data = data.replace('%signup_Link%', signupLink);

        const query = 'SELECT id, title, date FROM submissions';
        connection.query(query, (err, results) => {
          if (err) {
            console.error('데이터베이스에서 제출물 조회 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          const links = results.map(submission => `
            <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
            <a href="/delete/${submission.id}">삭제</a>
            <a href="/edit/${submission.id}">수정</a>
          `).join('<br>');

          data = data.replace('%a%', links);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      });
    });
  } else if (req.url === "/styles.css") {
    const css = fs.readFileSync("styles.css");
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.write(css);
    res.end();
  } else if (req.url === "/login.css") {
    const LoginCss = fs.readFileSync("login.css");
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.write(LoginCss);
    res.end();
  } else if (req.method === 'GET' && req.url === '/login') {
    fs.readFile('login.html', 'utf8', (err, data) => {
      if (err) {
        console.error('login.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'GET' && req.url === '/signup') {
    fs.readFile('signup.html', 'utf8', (err, data) => {
      if (err) {
        console.error('signup.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/signup') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const postData = qs.parse(body);
      const name = postData.name;
      const Email = postData.Email;
      const username = postData.username;
      const password = postData.password;

      if (name && Email && username && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO site_user (name, Email, username, password) VALUES (?, ?, ?, ?)';
        connection.query(query, [name, Email, username, hashedPassword], (err, results) => {
          if (err) {
            console.error('데이터베이스에 사용자 삽입 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(302, { 'Location': '/login' });
          res.end();
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const username = postData.username;
      const password = postData.password;

      if (username && password) {
        const query = 'SELECT * FROM site_user WHERE username = ?';
        connection.query(query, [username], async (err, results) => {
          if (err) {
            console.error('데이터베이스에서 사용자 조회 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
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
                    console.error('세션 생성 오류:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                    return;
                  }
                  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
                  res.writeHead(302, { 'Location': '/' });
                  res.end();
                });
              } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Unauthorized');
              }
            } catch (err) {
              console.error('비밀번호 비교 오류:', err);
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
            }
          } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized');
          }
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
  }else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const title = postData.title;
      const content = postData.content;
      const date = new Date().toLocaleString();
      const query = 'INSERT INTO submissions (title, content, date) VALUES (?, ?, ?)';
      connection.query(query, [title, content, date], (err, results) => {
        if (err) {
          console.error('데이터베이스에 제출물 삽입 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/' });
        res.end();
      });
    });
  }
   else if (req.method === 'GET' && req.url === '/board') {
    fs.readFile('board.html', 'utf8', (err, data) => {
      if (err) {
        console.error('board.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      const query = 'SELECT id, title, date FROM submissions';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('데이터베이스에서 제출물 조회 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        const links = results.map(submission => `
          <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
          <a href="/delete/${submission.id}">삭제</a>
          <a href="/edit/${submission.id}">수정</a>
        `).join('<br>');

        data = data.replace('%a%', links);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });
  }else if (req.method === 'GET' && req.url.startsWith('/submission/')) {
    const id = req.url.split('/').pop();
    const query = 'SELECT * FROM submissions WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 조회 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (results.length > 0) {
        const submission = results[0];
        fs.readFile('submission.html', 'utf8', (err, data) => {
          if (err) {
            console.error('submission.html 읽기 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          data = data.replace('%TITLE%', submission.title);
          data = data.replace('%CONTENT%', submission.content);
          data = data.replace('%DATE%', submission.date);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/delete/')) {
    const submissionId = req.url.split('/').pop();
    const query = 'DELETE FROM submissions WHERE id = ?';
    connection.query(query, [submissionId], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 삭제 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(302, { 'Location': '/' });
      res.end();
    });
  } else if (req.method === 'GET' && req.url === '/logout') {
    deleteSession(sessionId, (err) => {
      if (err) {
        console.error('세션 삭제 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.writeHead(302, { 'Location': '/' });
      res.end();
    });
  } else if (req.method === 'GET' && req.url.startsWith('/edit/')) {
    const submissionId = req.url.split('/').pop();
    const query = 'SELECT title, content FROM submissions WHERE id = ?';
    connection.query(query, [submissionId], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 조회 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (results.length > 0) {
        const submission = results[0];
        fs.readFile('edit.html', 'utf8', (err, data) => {
          if (err) {
            console.error('edit.html 읽기 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          data = data.replace('%TITLE%', submission.title);
          data = data.replace('%CONTENT%', submission.content);
          data = data.replace('%ID%', submissionId);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  } else if (req.method === 'POST' && req.url === '/edit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const id = postData.id;
      const title = postData.title;
      const content = postData.content;

      if (id && title && content) {
        const query = 'UPDATE submissions SET title = ?, content = ? WHERE id = ?';
        connection.query(query, [title, content, id], (err, results) => {
          if (err) {
            console.error('데이터베이스에서 제출물 업데이트 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(302, { 'Location': '/' });
          res.end();
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(8080, () => {
  console.log('서버가 http://localhost:8080 에서 실행 중입니다.');
});
