const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const connection = require('./db.js');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        console.error('index.html 읽기 오류:', err);
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
      if (username && password) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const query = 'INSERT INTO users (name, Email, username, password) VALUES (?, ?, ?, ?)';
          connection.query(query, [name, Email, username, hashedPassword], (err, results) => {
            if (err) {
              console.error('데이터베이스에 사용자 삽입 오류:', err);
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
              return;
            }
            res.writeHead(302, { 'Location': '/' });
            res.end();
          });
        } catch (err) {
          console.error('비밀번호 해싱 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
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
        const query = 'SELECT * FROM users WHERE username = ?';
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
                res.writeHead(302, { 'Location': '/board' });
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
        res.writeHead(302, { 'Location': '/board' });
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
        `).join('<br>');

        data = data.replace('%DATA%', links);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });
  } else if (req.method === 'GET' && req.url.startsWith('/submission/')) {
    const id = req.url.split('/').pop();
    const query = 'SELECT title, content, date FROM submissions WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 조회 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (results.length > 0) {
        const submission = results[0];
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(`
          <h1>제출된 데이터</h1>
          <p><strong>제목:</strong> ${submission.title}</p>
          <p><strong>내용:</strong> ${submission.content}</p>
          <p><strong>날짜:</strong> ${submission.date}</p>
          <a href="/board">뒤로가기</a>
        `);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
server.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다');
});