const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const connection = require('./db.js');

// 쿠키 파싱 함수
const parseCookies = (cookie = '') =>
  cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, [key, value]) => {
      acc[key.trim()] = decodeURIComponent(value);
      return acc;
    }, {});

const server = http.createServer((req, res) => {
  const cookies = parseCookies(req.headers.cookie);

  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        console.error('index.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      // 로그인 상태에 따라 링크 변경
      let loginLink = '';
      if (cookies.login && cookies.login === 'true') {
        loginLink = '<a href="/logout">로그아웃</a>';
      } else {
        loginLink = '<a href="/login">로그인</a>';
      }

      // HTML에 로그인 링크 삽입
      data = data.replace('%LOGIN_LINK%', loginLink);

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
  } else if (req.url === "/styles.css") {
    const css = fs.readFileSync("styles.css");
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.write(css);
    res.end();
  }else if (req.url === '/signup'&&req.method==='GET') {
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
  }  else if (req.method === 'GET' && req.url === '/login') {
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
  }else if (req.method === 'POST' && req.url === '/signup') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const postData = qs.parse(body);
        const username = postData.username;
        const password = postData.password;
        // 입력 데이터 검증
        if (username && password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const query = 'INSERT INTO site_user (username, password) VALUES (?, ?)';
          connection.query(query, [username, hashedPassword], (err, results) => {
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
    }else if (req.method === 'POST' && req.url === '/login') {
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
                res.setHeader('Set-Cookie', 'login=true; HttpOnly');
                res.writeHead(302, { 'Location': '/' });
                res.end();
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
  } else if (req.method === 'GET' && req.url === '/logout') {
    res.setHeader('Set-Cookie', 'login=; Max-Age=0; HttpOnly');
    res.writeHead(302, { 'Location': '/' });
    res.end();
  } else if (req.method === 'POST' && req.url === '/submit') {
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
  } else if (req.method === 'GET' && req.url === '/board') {
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
  } else if (req.method === 'GET' && req.url.startsWith('/submission/')) {
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
    const id = req.url.split('/').pop();
    const query = 'DELETE FROM submissions WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 삭제 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(302, { 'Location': '/' });
      res.end();
    });
  } else if (req.method === 'GET' && req.url.startsWith('/edit/')) {
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
        fs.readFile('edit.html', 'utf8', (err, data) => {
          if (err) {
            console.error('edit.html 읽기 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          data = data.replace('%TITLE%', submission.title);
          data = data.replace('%CONTENT%', submission.content);
          data = data.replace('%ID%', submission.id);
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
      const query = 'UPDATE submissions SET title = ?, content = ? WHERE id = ?';
      connection.query(query, [title, content, id], (err, results) => {
        if (err) {
          console.error('데이터베이스에서 제출물 수정 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/' });
        res.end();
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
server.listen(4000, () => {
  console.log('Server running at http://localhost:4000/');
});